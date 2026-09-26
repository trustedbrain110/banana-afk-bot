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
  console.log('Server se connect karne ki koshish kar raha hoon...');

  const bot = mineflayer.createBot({
    host: config.serverHost,
    port: config.serverPort,
    username: config.botUsername,
    version: '1.20.1',
    checkTimeoutInterval: 60 * 1000,
    fakeHost: 'play.bananasmp.net',
    brand: 'vanilla',
    auth: 'offline'
  });

  bot.on('spawn', () => {
    console.log('Bot successfully Banana SMP server mein join ho gaya!');

    setTimeout(() => {
      bot.chat(`/login ${config.password}`);
      console.log('Login command bhej di gayi hai.');
    }, 3500);

    setInterval(() => {
      if (bot && bot.entity) {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
      }
    }, 30000);
  });

  bot.on('windowOpen', async (window) => {
    console.log('GUI Menu open hua, Lifesteal (Red Dye) search kar raha hoon...');
    
    setTimeout(async () => {
      try {
        const items = window.items();
        let targetSlot = -1;

        for (const item of items) {
          if (item && item.name) {
            const name = item.name.toLowerCase();
            const customName = item.customName ? item.customName.toLowerCase() : '';
            
            if (name.includes('red_dye') || name.includes('rose_red') || customName.includes('lifesteal')) {
              targetSlot = item.slot;
              break;
            }
          }
        }

        if (targetSlot !== -1) {
          console.log(`Lifesteal found at slot ${targetSlot}! Clicking...`);
          await bot.clickWindow(targetSlot, 0, 0);
          console.log('Lifesteal join click ho gaya!');
        } else {
          console.log('Red dye nahi mila, slot 13 click kar rahe hain...');
          if (items.length > 0) {
            await bot.clickWindow(13, 0, 0);
          }
        }
      } catch (err) {
        console.log('GUI Click Error:', err.message);
      }
    }, 2000);
  });

  bot.on('kicked', (reason) => {
    console.log('Bot Kick hua:', reason);
  });

  bot.on('end', (reason) => {
    console.log('Bot disconnect hua, reason:', reason);
    console.log('5 seconds mein reconnect kar raha hoon...');
    setTimeout(createBot, 5000);
  });

  bot.on('error', (err) => {
    console.log('Bot Connection Error:', err.message);
  });
}

createBot();
