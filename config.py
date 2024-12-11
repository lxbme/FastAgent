import os
class Config:
    WHISPER_MODLE = "small" # 可选模型：tiny, base, small, medium, large

    GPT_API_URL = "https://api.openai-proxy.org/v1/chat/completions"

    #read the api key from the environment variable
    GPT_API_KEY = os.environ.get('GPT_API_KEY')
    # maximum length of the conversation for the GPT model
    MAX_CONVERSATION_LENGTH = 10

    CHAT_MODEL = "gpt-4o-mini" # GPT model name or "custom"
    ANAYLIZE_MODEL = "gpt-4o-mini" # GPT model name or "custom"
    DRAW_MODEL = "gpt-4o-mini" # GPT model name or "custom"
    PAINT_MODEL = "admruul/anything-v3.0" # Huggingface diffuser model name or "custom"

    TTS_MODEL = "vits" # 可选模型：vits, custom
    VIT_URL = "http://127.0.0.1:2333/tts"
    VIT_MAX_LEN = 20

class APIConfig:
    WEATHER = "hefeng" # 可选模型：hefeng, custom

class HeFengWeather:
    API_KEY = os.environ.get('HEFENG_API_KEY')