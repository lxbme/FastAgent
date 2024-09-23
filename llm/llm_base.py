from abc import ABC, abstractmethod

class LLMBase(ABC):
    """
    大语言模型（LLM）的抽象基类，定义了通用的接口和方法。
    """

    @abstractmethod
    def generate_text(self, prompt: str, **kwargs) -> str:
        """
        根据提示词生成文本。

        :param prompt: 输入的提示词或问题。
        :param kwargs: 其他可选参数，例如最大长度、温度等。
        :return: 生成的文本。
        """
        pass

    @abstractmethod
    def get_model_name(self) -> str:
        """
        获取模型的名称。

        :return: 模型名称。
        """
        pass

    @abstractmethod
    def set_parameters(self, **kwargs):
        """
        设置模型的参数。

        :param kwargs: 参数字典。
        """
        pass

