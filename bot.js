const mineflayer = require('mineflayer');
const express = require('express');
const config = require('./config.json');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Cavern AFK Bot Online!');
});

app.listen(port, () => {
  console.log(`Web server running on port ${port}`);
});

function createBot() {
  console.log(`Connecting to Cavern (${config.serverHost})...`);

  const bot = mineflayer.createBot({
    host: config.serverHost,
    port: config.serverPort,
    username: config.botUsername,
    version: '1.20.1' // Auto-protocol handshake to Cavern server
  });

  bot.on('spawn', () => {
    console.log(`Bot (${config.botUsername}) successfully joined Cavern!`);

    // First attempt Register and Login commands
    setTimeout(() => {
      console.log('Sending Register / Login commands...');
      bot.chat(`/register ${config.password} ${config.password}`);
      bot.chat(`/login ${config.password}`);
    }, 3000);

    // Anti-AFK Jump Loop (every 30s)
    setInterval(() => {
      if (bot && bot.entity) {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
      }
    }, 30000);
  });

  // Handle server messages for login / register prompts
  bot.on('messagestr', (message) => {
    console.log('[Cavern Chat]:', message);
    const msg = message.toLowerCase();

    if (msg.includes('register')) {
      bot.chat(`/register ${config.password} ${config.password}`);
    } else if (msg.includes('login')) {
      bot.chat(`/login ${config.password}`);
    }
  });

  bot.on('kicked', (reason) => {
    console.log('Bot Kicked:', reason);
  });

  bot.on('end', (reason) => {
    console.log('Bot disconnected:', reason);
    console.log('Reconnecting in 5 seconds...');
    setTimeout(createBot, 5000);
  });

  bot.on('error', (err) => {
    console.log('Bot Error:', err.message);
  });
}

createBot();
