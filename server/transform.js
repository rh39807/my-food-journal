const moment = require('moment');

module.exports = {
    userBudgetStatus,
    userDailyTotals,
    appEntryVelocity,
    usersSevenDayCalorieAverage,
    addUserInfo
}

function addUserInfo(collection,users) {
    return new Promise((resolve) => {
        const newCollection = collection.map((item) => {
            if (item.uid && users[item.uid]) {
                return { userName: users[item.uid].displayName, ...item}
            }
            return item;
        })
        resolve(newCollection);
    })
    
}

function usersSevenDayCalorieAverage(collection,user,users) {
    return new Promise ((resolve) => {
        let newCollection = [];
        if (user?.roles?.admin) {
            let newObj = {};
            collection.forEach(item => {
                const { uid, calories, when } = item;
                if (!newObj[uid]) newObj[uid] = 0;
                if (when && moment().diff(moment(when),'days') < 8) {
                    newObj[uid] = newObj[uid] + calories;
                }
            });
            for (let uid in newObj) {
                const avg = Math.round(newObj[uid] / 7);
                newCollection.push({
                    id: uid,
                    uid: uid,
                    avgCalories: avg,
                    userName: users[uid]?.displayName ? users[uid].displayName : null,
                    overBudget: users[uid]?.budget?.calories?.day?.limit && avg > users[uid].budget.calories.day.limit  
                })
            }
        } else {
            newCollection = [{error: 'transform not permitted'}]
        }
        resolve({ usersSevenDayCalorieAverage: newCollection })
    })
}

function appEntryVelocity(collection,user) {
    return new Promise ((resolve) => {
        let newDoc = {
            lastSevenDays: 0,
            previousSevenDays: 0,
            difference: 0,
            velocity: 'down'
        };
        if (user?.roles?.admin) {
            collection.forEach((item)=> {
                const { when } = item;
                const daysAgo = moment().diff(moment(when),'days');
                if (daysAgo < 15) {
                    if (daysAgo < 8) {
                        newDoc.lastSevenDays ++;
                    } else {
                        newDoc.previousSevenDays ++;
                    }
                }
            })
            newDoc.difference = newDoc.lastSevenDays - newDoc.previousSevenDays;
            newDoc.velocity = newDoc.difference > 0 ? 'up' : 'down'
        } else {
            newDoc = {error: 'transform not permitted'}
        }
        resolve({ appEntryVelocity: newDoc })
    })
}

function userDailyTotals(collection,user) {
    return new Promise ((resolve) => {
        let newCollection = [];
        let dayObj = {};
        let dailyLimit = 4000;
        if (user?.budget?.calories?.day?.limit) {
            dailyLimit = user.budget.calories.day.limit;
        }
        collection.forEach((item)=>{
            const { uid, when, price, calories } = item;
            if (user.id === uid) {
                const day = moment(when).format('M/D/YYYY');
                if (!dayObj[day]) dayObj[day] = { when: day, calories: 0, price: 0, overBudget: false };
                dayObj[day].calories = dayObj[day].calories + calories;
                dayObj[day].price = +(Math.round((dayObj[day].price + price) + "e+2")  + "e-2");
                if (dayObj[day].calories > dailyLimit) dayObj[day].overBudget = true;
                dayObj[day].overUnder = dailyLimit - dayObj[day].calories;
            }
        })
        for (let key in dayObj) newCollection.push( { id: key, ...dayObj[key] });
        resolve({ userDailyTotals: newCollection })
    })
}

function userBudgetStatus(collection,user) {
    const { budget } = user;
    return new Promise ((resolve) => {
        const newDoc = {};
        if (budget && typeof budget === 'object' && Object.keys(budget).length) {
            for (let docId in collection) {  
                const doc = collection[docId];
                
                const { uid, when, calories, price } = doc;
                if (uid && uid === user.id && when && calories && price) {
                    for (let item in budget) {
                        if (!newDoc[item]) {
                            newDoc[item] = {};
                        }
                        for (let interval in budget[item]) {
                            const { limit } = budget[item][interval];
                            if (!newDoc[item][interval]) {
                                newDoc[item][interval] = {
                                    entries: 0,
                                    total: 0,
                                    budget: limit,
                                    remaining: limit,
                                    overBudget: false
                                }
                            }
                            if (moment(when).isSame(moment(),interval)) {
                                const { entries, total, remaining, budget } = newDoc[item][interval];
                                const newTotal = +(Math.round((total + doc[item]) + "e+2")  + "e-2");
                                const newRemaining = +(Math.round((remaining - doc[item]) + "e+2")  + "e-2");
                                newDoc[item][interval] = {
                                    entries: entries + 1,
                                    total: newTotal,
                                    remaining: newRemaining,
                                    overBudget: newRemaining < 0,
                                    budget
                                }
                            }
                        }
                    }
                }
            }
        }
        resolve({ userBudgetStatus:newDoc });
    })
}