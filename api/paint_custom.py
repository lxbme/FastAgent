from api.paint_base import PaintBase

class CustomPaint(PaintBase):
    """
    自定义绘图模块
    """
    def generate_base64(self, prompt: str) -> str:
        return ''

    def custom_prompt(self) -> str:
        """
        自定义绘图提示, 将添加于用户输入之后
        """
        return ''