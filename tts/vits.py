import requests

from base64 import b64decode

from config import Config
from utils.cut_text import cut_text
from utils.merge_base64_audio import merge_base64_audio
class VITS():
    def __init__(self):
        self.url = Config.VIT_URL

    def text_to_speech(self, text: str, speaker: str, language: str, speed: float) -> str:
        try:
            audio_base64 = requests.post(
                self.url,
                json={
                    "text": text,
                    "speaker": speaker,
                    "language": language,
                    "speed": speed
                }
            ).json()["audio_base64"]
            return audio_base64
        except Exception as e:
            raise Exception(str(e))

    def long_text_to_speech(self, text: str, speaker: str, language: str, speed: float) -> str:
        text_slices: list = cut_text(text)
        base64_slices = []
        for text_slice in text_slices:
            base64_slices.append(self.text_to_speech(text_slice, speaker, language, speed))
        return merge_base64_audio(base64_slices)