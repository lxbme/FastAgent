from config import Config
def cut_text(text: str, max_len: int = Config.VIT_MAX_LEN) -> list:
    """
    Cut text into slices of max_len, 在逗号、句号、问号、感叹号处切断
    """
    text_slices = []
    while len(text) > max_len:
        slice_end = max_len
        while slice_end > 0 and text[slice_end] not in "。？！，.,?!":
            slice_end -= 1
        if slice_end == 0:
            slice_end = max_len
        text_slices.append(text[:slice_end])
        text = text[slice_end:]
    text_slices.append(text)
    return text_slices

if __name__ == "__main__":
    text = "你好，我是一个测试文本。这是一个测试文本，用来测试分割文本的函数。" * 20
    print(cut_text(text))