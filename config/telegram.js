require("dotenv").config();

const TelegramApi = require("node-telegram-bot-api");
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramApi(token, { polling: true });

module.exports = bot;
