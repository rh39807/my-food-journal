const cachedData = {
    foodJournal: {
        resCache: {},
        collection: null
    }
};
const dbUtils = require('./db-utils');
const TF = require('./transform');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const users = require('./users.json');
const userLookup = getUserLookup(users);
const docLookup = { foodJournal: {}};

loadInitialData();

module.exports = {
    getFoodJournal,
    getUserList,
    getTokenFromReq,
    getUser,
    generateToken,
    clearCache,
    checkDocIsUsers
}

function clearCache(prop) {
    cachedData[prop] = { resCache:{}, collection: null };
}

function generateDocLookup(key,collection) {
    docLookup[key] = {};
    collection.forEach((doc) => {
        docLookup[key][doc.id] = doc;
    })
}

async function loadInitialData() {
    try {
        let collection = await dbUtils.getCollection('foodJournal');
        collection = await TF.addUserInfo(collection,users);

        if (collection?.length) {
            cachedData.foodJournal.collection = collection;
            generateDocLookup('foodJournal',collection);
        }
    } catch(e) {
        console.log(e);
    }
}

async function getUserList(user,res,req) {
    let list = [];
    for (let id in users) {
        list.push({ label: users[id].displayName, value:id });
    }
    res.json(list);
}

async function getFoodJournal(user,res,req) {
    let filter = undefined;
    let { query } = req;
    let cacheKey = '';
    try {
        cacheKey = `${user.token} ${req.query && JSON.stringify(req.query)} ${moment().format('M/D/YYYY')}`
    } catch(e) {
        console.log(e);
    }
    if (checkIsInResCache(res,cacheKey)) return;
    if (query?.filter) {
        try {
            filter = JSON.parse(req.query.filter);
        } catch(e) {
            console.log(e);
        }
    }
    try {
        let collection = null;
        if (cachedData?.foodJournal?.collection) {
            collection = cachedData.foodJournal.collection;
        } else {
            collection = await dbUtils.getCollection('foodJournal');
            collection = await TF.addUserInfo(collection,users);
            generateDocLookup('foodJournal',collection);
        }
        let filteredCollection = null;
        let transformPromises = [];
        if (query?.transforms) {
            query.transforms = query.transforms.split(',');
            query.transforms.forEach((item)=>{
                if (item.toLowerCase().includes('prefilter:')) {
                    const newTransform = item.replace(/prefilter:/i,'');
                    if (TF[newTransform]) transformPromises.push(TF[newTransform](collection,user,users));
                }
            })
        }
        if (filter && Object.keys(filter).length) {
            filteredCollection = applyFilter(filter,collection);
        }
        if (filteredCollection) collection = filteredCollection;
        if (!(user?.roles?.admin)) {
            collection = collection.filter((item) => item.uid === user.id);
        }
        if (query?.transforms) {
            //would have already split into array on prefilter check, so just loop array looking for post filter transforms
            query.transforms.forEach((item)=>{
                if (!item.toLowerCase().includes('prefilter:')) {
                    if (TF[item]) transformPromises.push(TF[item](collection,user,users));
                }
            })
        }     
        if (transformPromises.length) {
            const transformedResponse = await processTransforms(transformPromises,collection);
            res.json(transformedResponse);
            setResCache(cacheKey,transformedResponse);
        } else {
            res.json(collection);
            setResCache(cacheKey,collection);
        }

    } catch(e) {
        console.log(e);
        res.json({error:e,errorMessage:'Error retrieving food journal'})
    }
}

async function processTransforms(promises,collection) {
    let transformedResponse = {
        foodJournal: collection
    }
    const results = await Promise.allSettled(promises);
    if (results?.length) {
        results.forEach((result)=>{
            if (result?.value && typeof result.value === 'object') {
                transformedResponse = { 
                    ...transformedResponse, 
                    ...result.value 
                }
            }
        })
    }
    return transformedResponse;
}

function applyFilter(filter, collection) {
    return collection.filter((item) => {
        let valid = true;
        for (let field in filter) {
            if (item[field]) {
                const { type } = filter[field];
                switch (type) {
                    case 'date-range':
                        const { fromDate, toDate } = filter[field];
                        valid = moment(item[field]).isSameOrAfter(moment(fromDate).startOf('day'));
                        if (!valid) return false;
                        valid = moment(item[field]).isSameOrBefore(moment(toDate).endOf('day'));
                        break;
                    default:
                        break;
                }
            }
        }
        return valid;
    });
} 

function checkIsInResCache(res,key) {
    if (key && cachedData?.foodJournal?.resCache && cachedData.foodJournal.resCache[key]) {
        res.json(cachedData.foodJournal.resCache[key]);
        return true;
    } else {
        return false;
    }
}

function setResCache(key,collection) {
    if (key) {
        if (!cachedData.foodJournal.resCache) cachedData.foodJournal.resCache = {};
        cachedData.foodJournal.resCache[key] = collection;
    }
}

function getTokenFromReq(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        return req.query.token;
    }

    return null;
}

function getUser(req) {
    const userKey = getTokenFromReq(req);
    return userLookup[userKey];
}


function generateToken(username) {
    let token = jwt.sign(
        {
          username: username
        },
        'super secret'
    );
    return token;
}


function getUserLookup(users) {
    let userLookup = {}
    for (let key in users) {
        userLookup[users[key].token] = users[key];
    }
    return userLookup;
}

function checkDocIsUsers(user,docId) {
    return (
        user?.id && 
        docLookup.foodJournal[docId] && 
        docLookup.foodJournal[docId].uid === user.id
    )
}




