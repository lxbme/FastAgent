import base64
import tempfile


def base64_to_wav(base64_audio: str, audio_format='wav'):

    try:
        # 解码base64
        audio_data = base64.b64decode(base64_audio)

        # 创建临时文件来存储音频数据
        file = "temp.wav"

        # 写入音频数据
        with open(file, 'wb') as f:
            f.write(audio_data)

    except Exception as e:
        print(f"处理音频文件时出错: {str(e)}")
        return None


if __name__ == "__main__":
    with open("test_base64_audio", "r") as f:
        audio_base64 = f.read()
    audio_path = base64_to_wav(audio_base64)
    print(audio_path)