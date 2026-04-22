const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔧 CONFIGURATION
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1495891178191851690/y4z2XL98Dax5opl6ai8R2me2HaOSLKvBxokC_FDnbUIv9ll02HC16O7zDgdoDy5cjgl2";
const PORT = 3000;

// Anti-doublon : stocke les IDs des SMS déjà traités
const processedSMS = new Set();

// 📩 Route qui reçoit les notifications SMSPool
app.post("/smspool", async (req, res) => {
  try {
    const data = req.body;

    console.log("📥 Données reçues:", JSON.stringify(data));

    // Créer un ID unique pour éviter les doublons
    const smsId = data.id || data.sms_id || `${data.number}-${data.message}-${Date.now()}`;

    if (processedSMS.has(smsId)) {
      console.log("⚠️ SMS déjà traité, ignoré.");
      return res.status(200).json({ success: true, duplicate: true });
    }
    processedSMS.add(smsId);

    // Nettoyer le set après 1 heure pour éviter les fuites mémoire
    setTimeout(() => processedSMS.delete(smsId), 3600000);

    // Extraire les infos du SMS
    const smsContent = data.message || data.sms || data.text || "Contenu inconnu";
    const virtualNumber = data.number || data.to || data.phone || data.phonenumber || data.pool_number || "Numéro inconnu";
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
      embeds: [
        {
          title: "📩 Nouveau SMS reçu",
          color: 0x5865f2,
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
