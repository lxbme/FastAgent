"""
This is a custom model that inherits from LLMBase. It is a simple model that returns a fixed string "custom model" for any prompt.
"""

from llm.llm_base import LLMBase

class CustomLLM(LLMBase):
    def generate_text(self, prompt: str, **kwargs) -> str:
        return "custom model text"

    def get_model_name(self) -> str:
        return "custom"

    def set_parameters(self, **kwargs):
        pass