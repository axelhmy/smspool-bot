const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🔧 CONFIGURATION
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1495891178191851690/y4z2XL98Dax5opl6ai8R2me2HaOSLKvBxokC_FDnbUIv9ll02HC16O7zDgdoDy5cjgl2";
const PORT = 3000;

// 📩 Route qui reçoit les notifications SMSPool
app.post("/smspool", async (req, res) => {
  try {
    const data = req.body;

    // Extraire les infos du SMS
    const smsContent = data.message || data.sms || data.text || "Contenu inconnu";
    const virtualNumber = data.number || data.to || data.phone || "Numéro inconnu";
    const receivedAt = new Date().toLocaleString("fr-FR", {
      timeZone: "Europe/Paris",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // 🎨 Construire l'embed Discord
    const embed = {
      username: "SMSPool Bot",
      avatar_url: "https://www.smspool.net/favicon.ico",
      embeds: [
        {
          title: "📩 Nouveau SMS reçu",
          color: 0x5865f2, // Bleu Discord
          fields: [
            {
              name: "📱 Numéro virtuel",
              value: `\`${virtualNumber}\``,
              inline: true,
            },
            {
              name: "🕐 Reçu le",
              value: receivedAt,
              inline: true,
            },
            {
              name: "💬 Contenu du SMS",
              value: `\`\`\`${smsContent}\`\`\``,
              inline: false,
            },
          ],
          footer: {
            text: "SMSPool Webhook",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    // Envoyer vers Discord
    await axios.post(DISCORD_WEBHOOK_URL, embed);

    console.log(`✅ SMS transmis à Discord - Numéro: ${virtualNumber}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🚀 Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`📡 En attente des webhooks SMSPool sur /smspool`);
});
