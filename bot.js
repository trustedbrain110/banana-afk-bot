const mineflayer = require('mineflayer');
const express = require('express');
const config = require('./config.json');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Banana SMP AFK Bot Online!');
});

app.listen(port, () => {
  console.log(`Web server running on port ${port}`);
});

function createBot() {
  const bot = mineflayer.createBot({
    host: config.serverHost,
    port: config.serverPort,
    username: config.botUsername,
    version: false
  });

  bot.on('spawn', () => {
    console.log('Bot server mein join ho gaya!');

    setTimeout(() => {
      bot.chat(`/register ${config.password} ${config.password}`);
      bot.chat(`/login ${config.password}`);
    }, 2000);

    setInterval(() => {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 500);
    }, 30000);
  });

  bot.on('windowOpen', async (window) => {
    console.log('GUI Menu open ho gaya, Lifesteal search kar raha hoon...');
    
    setTimeout(async () => {
      const items = window.items();
      
      const lifestealItem = items.find(item => 
        item.name.includes('red_dye') || 
        item.name.includes('rose_red') || 
        (item.customName && item.customName.toLowerCase().includes('lifesteal'))
      );

      if (lifestealItem) {
        console.log(`Lifesteal found at slot ${lifestealItem.slot}! Clicking...`);
        try {
          await bot.clickWindow(lifestealItem.slot, 0, 0);
          console.log('Successfully Lifesteal server join kar liya!');
        } catch (err) {
          console.log('Click error:', err);
        }
      } else {
        console.log('Red Dye nahi mila, manual slot click try kar rahe hain...');
      }
    }, 1500);
  });

  bot.on('message', (message) => {
    const msg = message.toString().toLowerCase();
    if (msg.includes('/login')) {
      bot.chat(`/login ${config.password}`);
    } else if (msg.includes('/register')) {
      bot.chat(`/register ${config.password} ${config.password}`);
    }
  });

  bot.on('end', () => {
    console.log('Bot disconnect hua, 5 seconds mein reconnect kar raha hoon...');
    setTimeout(createBot, 5000);
  });

  bot.on('error', (err) => {
    console.log('Bot Error:', err);
  });
}

createBot();
