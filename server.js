const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressJWT = require('express-jwt');
const path = require('path');
const dbUtils = require('./db-utils');
const utils = require('./utils');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 9000;

if (process.env.NODE_ENV !== 'production') require('dotenv').config();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors())
app.use(
    expressJWT({
      secret: process.env.TOKEN_SECRET,
      algorithms: ['HS256']
    })
    .unless({ path: ['/generateToken'] })
);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*', function(req,res) {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    })
}

app.get("/userList", (req,res)=> {
    const user = utils.getUser(req);
    if (user?.roles?.admin) {
        utils.getUserList(user,res,req);
    } else {
        res.status(403).send('action not permitted');
    }
});

app.get("/foodJournal", (req,res)=> {
    const user = utils.getUser(req);
    if (!user) {
        res.status(401).send('Unauthorized')
    } else {
        utils.getFoodJournal(user,res,req);
    }
});

app.get("/foodJournal/:id", async (req,res)=> {
    const result = await dbUtils.getDocument('foodJournal',{id:req.params.id});
    res.json(result);
});

app.post("/foodJournal/new", async (req,res)=> {
    const user = utils.getUser(req);
    if (!user) {
        res.status(401).send('Unauthorized')
    } else {
        let permitted  = user?.roles?.admin;
        if (!permitted) {
            //non admin users can only add records to their own journal
            permitted = user?.id === req?.body?.uid;
        }
        if (permitted) {
            const result = await dbUtils.addDocument('foodJournal',req.body);
            res.json(result);
            utils.clearCache('foodJournal');
        } else {
            res.status(403).send('action not permitted');
        }
    }
});

app.put("/foodJournal/:id", async (req,res)=> {
    const user = utils.getUser(req);
    if (!user) {
        res.status(401).send('Unauthorized')
    } else {
        let permitted  = user?.roles?.admin;
        if (user?.roles?.powerUser) {
            //power user can only update their own records
            permitted = utils.checkDocIsUsers(user,req.params.id);
        }
        if (permitted) {
            const result = await dbUtils.updateDocument('foodJournal',{...req.body,id:req.params.id});
            res.json(result);
            utils.clearCache('foodJournal');
        } else {
            res.status(403).send('action not permitted');
        }
    }
});

app.delete("/foodJournal/:id", async (req,res)=> {
    const user = utils.getUser(req);
    if (!user) {
        res.status(401).send('Unauthorized')
    } else {
        let permitted  = user?.roles?.admin;
        if (user?.roles?.powerUser) {
            //power user can only delete their own records
            permitted = utils.checkDocIsUsers(user,req.params.id);
        }
        if (permitted) {
            const result = await dbUtils.deleteDocument('foodJournal',{id:req.params.id});
            res.json(result);
            utils.clearCache('foodJournal');
        } else {
            res.status(403).send('action not permitted');
        }
    }
});

//test endpoint to for checking if token is working correctly
app.get("/whoAmI", (req,res)=>{
    const user = utils.getUser(req); 
    res.json(user);
})

// temporary enpdoint just for ease of development
app.get("/generateToken", (req,res)=>{
    if (req.query.username) {
        res.json({"token":utils.generateToken(req.query.username)});
    } else {
        res.status(400).send({error:'missing username'});
    }
})

app.listen(port, (error)=> {
    if (error) throw error;
    console.log(`Server running on port ${port}`);
})


