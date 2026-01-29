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
const MUNSIT_URL = "https://api.cntxt.tools/audio/transcribe"; 

app.post('/analyser', upload.single('file'), async (req, res) => {
    try {
        const targetPhrase = req.body.phrase_id; 
        
        const form = new FormData();
        // On utilise 'audio.mp3' comme dans leur exemple pour voir si ça débloque
        form.append('file', req.file.buffer, {
            filename: 'audio.mp3',
            contentType: 'audio/mpeg',
        });
        form.append('model', 'munsit-1'); // Modèle exact de ta capture

        const response = await axios.post(MUNSIT_URL, form, {
            headers: {
                ...form.getHeaders(),
                // On met la clé exactement comme ils le demandent
                'Authorization': `Bearer ${MUNSIT_API_KEY}`
            }
        });

        const transcription = response.data.text || "";
        console.log(`IA a entendu : ${transcription}`);

        // Vérification souple (majuscules/minuscules)
        if (transcription.toLowerCase().includes(targetPhrase.toLowerCase())) {
            res.json({ status: "SUCCESS" });
        } else {
            res.json({ status: "ERROR", received: transcription });
        }
    } catch (error) {
        // On affiche l'erreur exacte renvoyée par Munsit dans tes logs Railway
        console.error("Détail Erreur Munsit:", error.response ? error.response.data : error.message);
        res.status(500).json({ status: "SERVER_ERROR" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Serveur prêt sur port ${PORT}`));
