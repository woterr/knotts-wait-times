const { EmbedBuilder, Client, GatewayIntentBits } = require("discord.js");
const fetch = require("node-fetch");
require("dotenv").config();

let url = "https://queue-times.com/en-US/parks/61/queue_times.json";

async function sendMessage(channel) {
  if (!channel) {
    console.error("Channel is not defined. Bot might not be ready or channel ID is incorrect.");
    return;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`);
    }
    const out = await res.json();

    const embed = new EmbedBuilder()
      .setColor("#2f3136")
      .setDescription(`_ _`)
      .setTitle("**Knott's Berry Farm**")
      .setTimestamp();

    // add fields
    const is_openArray = [];
    out.lands.forEach((land) => {
      land.rides.forEach((ride) => {
        is_openArray.push(ride.is_open);
        embed.setDescription(
          `${embed.data.description}\n${ride.is_open ? "🟢" : "🔴"}\`${
            ride.wait_time
          }m \` - ${ride.name}`
        );
      });
    });

    // if all parks are closed
    const filtered_is_openArray = [...is_openArray];
    if (filtered_is_openArray.length > 31) { 
      filtered_is_openArray.splice(31, 1);
    }
    

    let lastMessage;
    try {
        const messages = await channel.messages.fetch({ limit: 1 });
        lastMessage = messages.first();
    } catch (fetchError) {
        console.error("Error fetching last message:", fetchError);
    }

    if (filtered_is_openArray.every((element) => element === false)) {
      if (
        lastMessage &&
        lastMessage.content === "Goodnight! 💤" &&
        lastMessage.author.id === process.env.clientID
      ) {
        return;
      } else {
        console.log("All parks closed");
        const embed_goodnight = new EmbedBuilder()
          .setColor("#2f3136")
          .setTitle("Knotts is now closed.")
          .setImage(
            "https://c.tenor.com/lLUjSh5G2H4AAAAM/snoopy-peanuts.gif"
          );
        await channel.send({
          embeds: [embed_goodnight],
          content: "Goodnight! 💤",
        });
        return;
      }
    } else {
      // good morning message if previous message was goodnight
      if (
        lastMessage &&
        lastMessage.content === "Goodnight! 💤" &&
        lastMessage.author.bot
      ) {
        console.log("Good morning");
        const embed_goodmorning = new EmbedBuilder()
          .setColor("#2f3136")
          .setTitle("Knotts is now open.")
          .setImage(
            "https://i.imgur.com/qPjXdwr.jpeg"
          );
        await channel.send({
          embeds: [embed_goodmorning],
          content: "Good morning! 🌅",
        });
      }

      // check if previous message is the same as the current message
      if (lastMessage?.embeds[0]?.description !== embed.data.description) {
        // send embed
        console.log("embed sent");
        await channel.send({
          embeds: [embed],
        });
      } else {
        console.log("previous message is same, no update sent.");
      }
    }

    return out;
  } catch (err) {
    console.error("Something went wrong fetching or sending message: ", err);
  }
}

module.exports = { sendMessage };