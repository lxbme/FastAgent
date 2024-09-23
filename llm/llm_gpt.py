import threading
import requests
from llm.llm_base import LLMBase
from config import Config
from prompt import Prompts

class GPTChatMode(LLMBase):
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(GPTChatMode, cls).__new__(cls)
        return cls._instance

    def __init__(self, api_url: str = Config.GPT_API_URL,
                 api_key: str = Config.GPT_API_KEY,
                 model_name: str = Config.CHAT_MODEL,
                 max_conversation_length: int = Config.MAX_CONVERSATION_LENGTH):
        if hasattr(self, '_initialized') and self._initialized:
            return
        self.api_url = api_url
        self.api_key = api_key
        self.model_name = model_name
        self.parameters = {
            "temperature": 0.7,
            "max_tokens": 500,
            "top_p": 1.0,
            "frequency_penalty": 0.0,
            "presence_penalty": 0.0,
        }
        self.max_conversation_length = max_conversation_length
        self.conversation = []
        self._initialized = True

    def generate_text(self, prompt: str, **kwargs) -> str:
        params = {**self.parameters, **kwargs}
        self.conversation.append({"role": "user", "content": prompt})
        if len(self.conversation) > self.max_conversation_length * 2:
            self.conversation = self.conversation[-self.max_conversation_length * 2:]
        payload = {
            "model": self.model_name,
            "messages": self.conversation,
            **params
        }
        headers = {
            "Content-Type": "application/json"
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        response = requests.post(self.api_url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        assistant_reply = data['choices'][0]['message']['content'].strip()
        self.conversation.append({"role": "assistant", "content": assistant_reply})
        if len(self.conversation) > self.max_conversation_length * 2:
            self.conversation = self.conversation[-self.max_conversation_length * 2:]
        return assistant_reply

    def get_model_name(self) -> str:
        return self.model_name

    def set_parameters(self, **kwargs):
        self.parameters.update(kwargs)

    def reset_conversation(self):
        self.conversation = []

class GPTAnalyzeMode(LLMBase):
    def __init__(self, api_url: str = Config.GPT_API_URL,
                 api_key: str = Config.GPT_API_KEY,
                 model_name: str = Config.ANAYLIZE_MODEL):
        self.api_url = api_url
        self.api_key = api_key
        self.model_name = model_name
        self.parameters = {
            "temperature": 0.7,
            "max_tokens": 300,
            "top_p": 1.0,
            "frequency_penalty": 0.0,
            "presence_penalty": 0.0,
        }
        self.conversation = []

    def generate_text(self, prompt: str, **kwargs) -> str:
        params = {**self.parameters, **kwargs}
        self.conversation.append({"role": "user", "content": Prompts.ANALYZER_PROMPT.format(prompt)})
        payload = {
            "model": self.model_name,
            "messages": self.conversation,
            **params
        }
        headers = {
            "Content-Type": "application/json"
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        response = requests.post(self.api_url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        assistant_reply = data['choices'][0]['message']['content'].strip()
        self.conversation.append({"role": "assistant", "content": assistant_reply})
        return assistant_reply

    def get_model_name(self) -> str:
        return self.model_name

    def set_parameters(self, **kwargs):
        self.parameters.update(kwargs)

    def reset_conversation(self):
        self.conversation = []


class GPTBaseMode(LLMBase):
    def __init__(self, api_url: str = Config.GPT_API_URL,
                 api_key: str = Config.GPT_API_KEY,
                 model_name: str = Config.ANAYLIZE_MODEL):
        self.api_url = api_url
        self.api_key = api_key
        self.model_name = model_name
        self.parameters = {
            "temperature": 0.7,
            "max_tokens": 300,
            "top_p": 1.0,
            "frequency_penalty": 0.0,
            "presence_penalty": 0.0,
        }
        self.conversation = []

    def generate_text(self, prompt: str, **kwargs) -> str:
        params = {**self.parameters, **kwargs}
        self.conversation.append({"role": "user", "content": prompt})
        payload = {
            "model": self.model_name,
            "messages": self.conversation,
            **params
        }
        headers = {
            "Content-Type": "application/json"
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        response = requests.post(self.api_url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        assistant_reply = data['choices'][0]['message']['content'].strip()
        self.conversation.append({"role": "assistant", "content": assistant_reply})
        return assistant_reply

    def get_model_name(self) -> str:
        return self.model_name

    def set_parameters(self, **kwargs):
        self.parameters.update(kwargs)

    def reset_conversation(self):
        self.conversation = []

