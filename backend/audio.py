import requests
from flask import Response
import os
import base64

def get_audio_from_text(text):
    morgan_freeman_voice_id = "Ol0OE58uTil80FBOFI52"
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{morgan_freeman_voice_id}"
    payload = {
        "language_id": "en-us",
        "voice_settings": {
            "stability": 0.75,
            "similarity_boost": 0.7
        },
        "text": text
    }
    headers = {
        "xi-api-key": os.environ["XI_API_KEY"],
        "Content-Type": "application/json"
    }

    response = requests.post(url, json=payload, headers=headers)
    return response.content