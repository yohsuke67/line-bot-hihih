const line = require('@line/bot-sdk');
const { getQAData } = require('./googleSheets');
const { getBestAnswer } = require('./aiAgent');

const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

async function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }

    const userMessage = event.message.text;

    // 1. Get Q&A data from Google Sheets
    // optimizing: caching this data would be better for production
    const qaList = await getQAData();

    // 2. Get best answer from AI
    const answer = await getBestAnswer(userMessage, qaList);

    // 3. Reply to user
    return client.replyMessage(event.replyToken, {
        type: 'text',
        text: answer,
    });
}

module.exports = { config, handleEvent };
