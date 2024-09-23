import whisper
from config import Config



def transcribe(audio_path,language="", model = Config.WHISPER_MODLE):
    model = whisper.load_model(model).to("cuda")
    #use gpu
    return model.transcribe(audio_path, language=language)