import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import express from 'express'; 

dotenv.config();

 
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL;

 
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || `User${msg.from.id}`;
  console.log(username, "username from bot");

  bot.sendMessage(chatId, `Welcome to TapMe, ${username}! Ready to start playing?`);

  try {
    bot.sendMessage(chatId, 'Tap to Play', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Open TapMe',
              web_app: {
                url: FRONTEND_URL,
              },
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error('Error providing game link:', error);
    bot.sendMessage(chatId, 'An error occurred while providing the game link. Please try again later.');
  }
});

 
bot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || `User${msg.from.id}`;

  try {
    const response = await fetch(`${BACKEND_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetUser($username: String!) {
            getUser(username: $username) {
              coins
            }
          }
        `,
        variables: { username },
      }),
    });

    const data = await response.json();
    const user = data.data.getUser;

    if (user) {
      bot.sendMessage(chatId, `Your current balance is ${user.coins} coins.`);
    } else {
      bot.sendMessage(chatId, 'You are not registered yet. Start tapping to earn coins!');
    }
  } catch (error) {
    console.error('Error fetching balance:', error);
    bot.sendMessage(chatId, 'An error occurred while fetching your balance. Please try again later.');
  }
});
 
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  const helpMessage = `
Welcome to TapMe! Here are some commands you can use:
- /start: Start the game and begin earning coins.
- /balance: Check your current coin balance.
- /help: Display this help message.

To start playing, just tap the button and watch your coins grow. Happy tapping!
  `;

  bot.sendMessage(chatId, helpMessage);
});

 
const app = express();

 
app.get('/', (req, res) => {
  res.send('Telegram bot is running!');
});

 
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
