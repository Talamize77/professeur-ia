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

        const form = new FormData();
        // On force l'extension .wav et le type audio/wav pour tromper Munsit
        form.append('file', req.file.buffer, {
            filename: 'audio.wav',
            contentType: 'audio/wav',
        });
        form.append('model', 'munsit-1');
        form.append('language', 'ar'); 

        const response = await axios.post("https://api.cntxt.tools/audio/transcribe", form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${MUNSIT_API_KEY}`
            }
        });

        // Nettoyage ultra-poussé du texte reçu
        const transcription = (response.data.text || "").trim().toLowerCase();
        console.log("Munsit a entendu : [" + transcription + "]");

        // Si Munsit renvoie du vide, on tente une réponse d'erreur spécifique
        if (!transcription) {
            console.log("⚠️ Munsit n'a capté aucun son.");
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
        console.error("Erreur API :", error.response ? error.response.data : error.message);
        res.status(500).json({ status: "SERVER_ERROR" });
    }
});

app.listen(8080, () => console.log("Serveur prêt"));
