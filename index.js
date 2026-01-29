const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

const MUNSIT_API_KEY = process.env.MUNSIT_API_KEY; 
// URL mise à jour selon ta capture d'écran de la doc
const MUNSIT_URL = "https://api.cntxt.tools/audio/transcribe"; 

app.post('/analyser', upload.single('file'), async (req, res) => {
    try {
        const targetPhrase = req.body.phrase_id; 
        
        const form = new FormData();
        form.append('file', req.file.buffer, {
            filename: 'audio.wav',
            contentType: 'audio/wav',
        });
        form.append('model', 'munsit-1'); // Modèle indiqué sur ta capture

        const response = await axios.post(MUNSIT_URL, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${MUNSIT_API_KEY}`
            }
        });

        // Munsit renvoie souvent la réponse dans response.data.text
        const transcription = response.data.text || "";
        console.log(`Reçu de Munsit: ${transcription}`);

        if (transcription.toLowerCase().includes(targetPhrase.toLowerCase())) {
            res.json({ status: "SUCCESS" });
        } else {
            res.json({ status: "ERROR", received: transcription });
        }
    } catch (error) {
        // C'est ici que le "CORS Forbidden" apparaissait
        console.error("Erreur détaillée:", error.response ? error.response.data : error.message);
        res.status(500).json({ status: "SERVER_ERROR" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Serveur prêt sur le port ${PORT}`));

