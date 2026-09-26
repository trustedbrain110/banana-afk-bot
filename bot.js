const mineflayer = require('mineflayer');
const express = require('express');
const { SocksClient } = require('socks');
const config = require('./config.json');

// --- PROXY CONFIGURATION ---
// Yahan apni SOCKS5 proxy details dalein:
const PROXY_HOST = 'YOUR_PROXY_IP';       // Example: '185.220.101.5'
const PROXY_PORT = 1080;                   // Example: 1080
const PROXY_USER = 'YOUR_PROXY_USERNAME'; // Leave empty '' if no auth needed
const PROXY_PASS = 'YOUR_PROXY_PASSWORD'; // Leave empty '' if no auth needed
// ---------------------------

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Banana SMP AFK Bot Online!');
});

app.listen(port, () => {
  console.log(`Web server running on port ${port}`);
});

function createBot() {
  console.log('Proxy ke zariye connect karne ki koshish kar raha hoon...');

  const options = {
    proxy: {
      host: PROXY_HOST,
      port: parseInt(PROXY_PORT),
      type: 5
    },
    destination: {
      host: config.serverHost,
      port: parseInt(config.serverPort)
    },
    command: 'connect'
  };

  if (PROXY_USER && PROXY_PASS) {
    options.proxy.userId = PROXY_USER;
    options.proxy.password = PROXY_PASS;
  }

  // Create TCP connection through SOCKS5 Proxy
  SocksClient.createConnection(options, (err, info) => {
    if (err) {
      console.log('Proxy Connection Error:', err.message);
      console.log('5 seconds mein reconnect try kar rahe hain...');
      setTimeout(createBot, 5000);
      return;
    }

    console.log('Proxy connection successful! Client create kar rahe hain...');

    const bot = mineflayer.createBot({
      stream: info.socket,
      host: config.serverHost,
      port: config.serverPort,
      username: config.botUsername,
      version: '1.20.1'
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
      console.log('Bot Error:', err.message);
    });
  });
}

createBot();
