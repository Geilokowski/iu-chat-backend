const express = require('express');
const cors = require('cors');
const {admin, messageCollection} = require("./config/firebase-initializer.js");
const moment = require("moment/moment.js");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.use(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.split(' ')[1] : "";

    try {
        const decodeValue = await admin.auth().verifyIdToken(token);
        if (decodeValue) {
            res.locals.user = decodeValue;
            return next();
        }

        return res.json({ message: 'Unauthorized' });
    } catch (e) {
        return res.json({ message: 'Unauthorized' });
    }
});

app.post('/messages', async (req, res) => {
    const requestBody = req.body;
    const user = res.locals.user;

    const addedDocRef = await messageCollection.add({
        message: requestBody.message,
        created: moment().unix(),
        name: user.name,
    });

    res.send(addedDocRef.id);
});

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});