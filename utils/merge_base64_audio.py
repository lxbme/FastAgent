import base64
import io
from pydub import AudioSegment
import tempfile
import os


def merge_base64_audio(base64_audio_list, audio_format='wav'):
    """
    合并多个base64编码的音频文件并返回合并后的base64编码

    参数:
        base64_audio_list: list of str, base64编码的音频文件列表
        audio_format: str, 音频格式 (默认 'wav')

    返回:
        str: 合并后音频的base64编码，失败则返回None
    """
    try:
        # 创建一个空的音频段来存储合并结果
        combined = None

        # 临时文件列表
        temp_files = []

        for i, base64_audio in enumerate(base64_audio_list):
            try:
                # 解码base64
                audio_data = base64.b64decode(base64_audio)

                # 创建临时文件来存储音频数据
                temp = tempfile.NamedTemporaryFile(delete=False, suffix=f'.{audio_format}')
                temp_files.append(temp.name)

                # 写入音频数据
                with open(temp.name, 'wb') as f:
                    f.write(audio_data)

                # 加载音频段
                audio_segment = AudioSegment.from_file(temp.name, format=audio_format)

                # 合并音频段
                if combined is None:
                    combined = audio_segment
                else:
                    combined += audio_segment

            except Exception as e:
                print(f"处理第 {i + 1} 个音频文件时出错: {str(e)}")
                continue

        # 检查是否有成功加载的音频
        if combined is None:
            print("没有成功加载任何音频文件")
            return None

        # 创建临时文件用于存储合并后的音频
        output_temp = tempfile.NamedTemporaryFile(delete=False, suffix=f'.{audio_format}')
        temp_files.append(output_temp.name)

        # 导出合并后的音频到临时文件
        combined.export(output_temp.name, format=audio_format)

        # 读取合并后的音频文件并转换为base64
        with open(output_temp.name, 'rb') as f:
            merged_audio_data = f.read()
        merged_base64 = base64.b64encode(merged_audio_data).decode('utf-8')

        # 清理临时文件
        for temp_file in temp_files:
            try:
                os.unlink(temp_file)
            except:
                pass

        return merged_base64

    except Exception as e:
        print(f"合并音频时发生错误: {str(e)}")
        return None