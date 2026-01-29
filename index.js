const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

const MUNSIT_API_KEY = "sk-ctxt-100fa312645b4bcb9c08e04af2d61601"; 

app.post('/analyser', upload.single('file'), async (req, res) => {
    try {
        const targetPhrase = req.body.phrase_id; 
        console.log("Cible : " + targetPhrase);

        if (!req.file) {
            console.log("❌ Aucun fichier reçu du client.");
            return res.status(400).json({ status: "ERROR", message: "NO_FILE" });
        }

        const form = new FormData();
        // MODIFICATION ICI : On utilise les infos réelles du fichier envoyé par Système.io
        form.append('file', req.file.buffer, {
            filename: req.file.originalname || 'audio.webm',
            contentType: req.file.mimetype || 'audio/webm',
        });
        form.append('model', 'munsit-1');
        form.append('language', 'ar'); 

        const response = await axios.post("https://api.cntxt.tools/audio/transcribe", form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${MUNSIT_API_KEY}`
            }
        });

        // Munsit renvoie souvent le texte dans response.data.data.transcription ou response.data.text
        // On adapte pour être sûr de capter la réponse
        const transcription = (response.data.text || (response.data.data && response.data.data.transcription) || "").trim().toLowerCase();
        console.log("Munsit a entendu : [" + transcription + "]");

        if (!transcription) {
            console.log("⚠️ Munsit n'a capté aucun son (Réponse vide).");
            return res.json({ status: "ERROR", message: "EMPTY_AUDIO" });
        }

        if (transcription.includes(targetPhrase.toLowerCase())) {
            console.log("✅ Match réussi !");
            res.json({ status: "SUCCESS" });
        } else {
            console.log("❌ Pas de correspondance.");
            res.json({ status: "ERROR", received: transcription });
        }
    } catch (error) {
        console.error("Erreur API Munsit :", error.response ? JSON.stringify(error.response.data) : error.message);
        res.status(500).json({ status: "SERVER_ERROR" });
    }
});

// Utilisation du port dynamique pour Render ou 8080 par défaut
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Serveur prêt sur le port ${PORT}`));
