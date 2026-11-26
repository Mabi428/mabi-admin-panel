
const express = require("express");
const cors = require("cors");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "https://mabi428.github.io"
}));

app.use(express.json());

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "MABI Admin Backend läuft!"
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    backend: "online",
    bot: bot.isReady() ? "online" : "offline"
  });
});

app.get("/api/members", async (req, res) => {
  if (!bot.isReady()) {
    return res.status(503).json({
      error: "Bot ist noch nicht verbunden."
    });
  }

  const guildId = process.env.GUILD_ID;
  const guild = bot.guilds.cache.get(guildId);

  if (!guild) {
    return res.status(404).json({
      error: "Discord-Server nicht gefunden."
    });
  }

  try {
    await guild.members.fetch();

    const members = guild.members.cache.map(member => ({
      id: member.id,
      username: member.user.username,
      displayName: member.displayName,
      avatar: member.user.displayAvatarURL(),
      bot: member.user.bot
    }));

    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Mitglieder konnten nicht geladen werden."
    });
  }
});

bot.once("ready", () => {
  console.log(`Mabi Bot ist online: ${bot.user.tag}`);
});

bot.login(process.env.DISCORD_TOKEN).catch(error => {
  console.error("Discord-Verbindung fehlgeschlagen:", error);
});

app.listen(PORT, () => {
  console.log(`Backend läuft auf Port ${PORT}`);
});
