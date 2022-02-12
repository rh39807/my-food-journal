const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const moment = require('moment');
const serviceAccount = require('./admin.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

module.exports = {
    addDocument: addDocument,
    updateDocument: updateDocument,
    deleteDocument: deleteDocument,
    getDocument: getDocument,
    getCollection: getCollection
}

function getCollection(collection) {
    return new Promise((resolve,reject)=>{
        db.collection(collection)
        .get()
        .then((snapshot)=>{
            let data = [];
            snapshot.forEach(doc => {data.push({...doc.data(),id:doc.id})});
            resolve(data);
        })
        .catch((e)=>{
            reject(e)
        })
    });
}

async function addDocument(collection, obj) {
    return await executeDocumentAction(collection, obj, 'add');
}

async function updateDocument(collection, obj) {
    return await executeDocumentAction(collection, obj, 'update');
}

async function deleteDocument(collection, obj) {
    return await executeDocumentAction(collection, obj, 'delete');
}

async function getDocument(collection, obj) {
    return await executeDocumentAction(collection, obj, 'get');
}

async function executeDocumentAction(collection, obj, action) {
    if (!obj) return 'missing object';

    try {
        const document = db.doc(`${collection}/${obj.id}`);
        const snapShot = await document.get();

        switch(action) {
            case 'get':
                return snapShot.exists ? snapShot.data() : {};
            case 'delete':
                await document.delete();
                return {result:'document action succeeded'};
            default:
                if (snapShot.exists) {
                    await document.update(obj);
                    return {result:'document action succeeded'};
                } else {
                    const createdAt = new moment();
                    //Need to do an add to collection instead of set on document to leverage the auto id function of firestore
                    const result = await db.collection('foodJournal').add({
                        ...obj,
                        createdAt
                    });
                    //after we get back new obje with new auto id then update doc with the id so it is accesible within the doc
                    await result.update({id:result.id});
                    return {result:result};
                }
        }
    } catch(error) {
        return {error:error,errorMessage:`Error peforming ${action} on document`}
    }
}



