from abc import ABC, abstractmethod

class PaintBase(ABC):
    @abstractmethod
    def generate_base64(self, prompt: str) -> str:
        pass

    @abstractmethod
    def custom_prompt(self) -> str:
        pass