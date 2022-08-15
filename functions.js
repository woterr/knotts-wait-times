const index = require("./index"),
  client = index.client;
const { MessageEmbed } = require("discord.js");
const https = require("https");
const fetch = require("node-fetch");
require("dotenv").config();

let url = "https://queue-times.com/en-US/parks/61/queue_times.json";
// let url = "https://queue-times.com/en-US/parks/99/queue_times.json";

function sendMessage(channel, sentMessage) {
  fetch(url)
    .then((res) => res.json())
    .then((out) => {
      const embed = new MessageEmbed()
        .setColor("#2f3136")
        .setDescription(`_ _`)
        .setTitle("**Knott's Berry Farm**")
        .setTimestamp();

      // add fields
      const is_openArray = [];
      out.lands.forEach((land) => {
        land.rides.forEach((ride) => {
          is_openArray.push(ride.is_open);
          // console.log(ride);
          // embed.addField(`\u200B`);
          embed.setDescription(
            `${embed.description}\n${ride.is_open ? "🟢" : "🔴"}\`${
              ride.wait_time
            }m \` - ${ride.name}`
          );
        });
      });

      // if all parks are closed
      is_openArray.splice(31, 1);
      if (is_openArray.every((element) => element === false)) {
        channel.messages.fetch({ limit: 1 }).then((messages) => {
          let lastMessage = messages.first();

          if (
            lastMessage.content === "Goodnight! 💤" &&
            lastMessage.author.id === process.env.clientID
          ) {
            return;
          } else {
            console.log("All parks closed");
            const embed_goodnight = new MessageEmbed()
              .setColor("#2f3136")
              .setTitle("Knotts is now closed.")
              .setImage(
                "https://c.tenor.com/lLUjSh5G2H4AAAAM/snoopy-peanuts.gif"
              );
            channel.send({
              embeds: [embed_goodnight],
              content: "Goodnight! 💤",
            });
            return;
          }
        });
      } else {
        // good morning message if previous message was goodnight
        channel.messages.fetch({ limit: 1 }).then((messages) => {
          let lastMessage = messages.first();
          if (
            lastMessage.content === "Goodnight! 💤" &&
            lastMessage.author.bot
          ) {
            console.log("Good morning");
            const embed_goodmorning = new MessageEmbed()
              .setColor("#2f3136")
              .setTitle("Knotts is now open.")
              .setImage(
                "https://cdn.discordapp.com/attachments/963903009484570684/983770358538711080/IMG_4115.jpg"
              );
            channel.send({
              embeds: [embed_goodmorning],
              content: "Good morning! 🌅",
            });
          }
        });

        // check if previous message is the same as the current message
        channel.messages.fetch({ limit: 1 }).then((messages) => {
          let lastMessage = messages.first();

          if (lastMessage?.embeds[0]?.description !== embed.description) {
            // send embed
            console.log("embed sent");
            channel.send({
              embeds: [embed],
            });
          } else {
            console.log("previous message is same");
          }
        });
      }

      return out;
    })
    .catch((err) => {
      console.log("Something went wrong: ", err);
    });
}

module.exports = { sendMessage };
