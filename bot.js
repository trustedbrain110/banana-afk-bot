const mineflayer = require('mineflayer');
const express = require('express');
const config = require('./config.json');

// Express Server (Render / UptimeRobot Keep-Alive)
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
    version: '1.20.1'
  });

  bot.on('spawn', () => {
    console.log('Bot server mein join ho gaya!');

    // Sirf ek baar Login command bhejega (No Spam)
    setTimeout(() => {
      bot.chat(`/login ${config.password}`);
      console.log('Login command bhej di gayi hai.');
    }, 2500);

    // Anti-AFK Jump Loop
    setInterval(() => {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 500);
    }, 30000);
  });

  // GUI Menu Handlers (Lifesteal / Red Dye auto click)
  bot.on('windowOpen', async (window) => {
    console.log('GUI Menu open ho gaya, Lifesteal (Red Dye) search kar raha hoon...');
    
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
        console.log('Red Dye nahi mila, inventory slots check kar rahe hain...');
      }
    }, 1500);
  });

  // Chat listener for auto-login prompt
  bot.on('message', (message) => {
    const msg = message.toString().toLowerCase();
    if (msg.includes('/login') && !msg.includes('successfully')) {
      setTimeout(() => {
        bot.chat(`/login ${config.password}`);
      }, 1000);
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
