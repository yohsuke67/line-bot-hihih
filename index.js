require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');
const { config, handleEvent } = require('./services/lineBot');

const app = express();

const requiredEnv = ['CHANNEL_ACCESS_TOKEN', 'CHANNEL_SECRET', 'OPENAI_API_KEY', 'GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'SPREADSHEET_ID'];
requiredEnv.forEach(key => {
    if (process.env[key]) {
        console.log(`${key} is set.`);
    } else {
        console.error(`ERROR: ${key} is MISSING from environment variables.`);
    }
});

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.send('LINE Bot is running!');
});

app.post('/webhook', line.middleware(config), (req, res) => {
    Promise.all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});
