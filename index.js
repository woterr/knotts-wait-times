const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");
const { sendMessage } = require("./functions.js");
require("dotenv").config();

const app = express();
let PORT = process.env.PORT || "3000";

app.get("/", (request, response) => {
  response.send("Bot is running! on port", PORT);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let channel;

client.once("ready", async () => {
  console.log("Bot is ready!");
  try {
    channel = await client.channels.fetch(process.env.channelID);
    if (!channel) {
      console.error(`Could not find channel with ID: ${process.env.channelID}`);
      return;
    }
    console.log(`Monitoring channel: ${channel.name}`);
    // Initial message send on startup
    sendMessage(channel);
  } catch (error) {
    console.error("Error fetching channel on ready:", error);
  }
});

setInterval(() => {
  if (channel) {
    sendMessage(channel);
  } else {
    console.log("Channel not yet initialized, skipping message send.");
  }
}, 300000); 

client.login(process.env.token).catch(console.error);

module.exports.client = client;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});