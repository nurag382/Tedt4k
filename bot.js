const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

// Initialize Express server
const app = express();
const PORT = 3000;

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Function to fetch search results
async function fetchSearchResults(query) {
    try {
        const response = await axios.get(`https://www.bing.com/search?q=${encodeURIComponent(query)}`);
        const $ = cheerio.load(response.data);
        let results = '';
        $('.b_algo a').each((index, element) => {
            if (index < 5) { // Limit to 5 results
                results += `${$(element).text()}: ${$(element).attr('href')}\n`;
            }
        });
        return results || 'No results found.';
    } catch (error) {
        console.error(error);
        return 'Error fetching search results.';
    }
}

// Start command
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Hi! Send me a query and I will fetch search results for you.');
});

// Handle text messages
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    if (msg.text.startsWith('/start')) return;
    const query = msg.text;
    const results = await fetchSearchResults(query);
    bot.sendMessage(chatId, results);
});

// Start Express server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
