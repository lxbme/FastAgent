"""
处理agent逻辑
"""

import json
import requests
from config import Config, APIConfig
from llm.llm_custom import CustomLLM
from llm.llm_gpt import GPTChatMode, GPTAnalyzeMode, GPTBaseMode
from api.hefeng_weather import get_weather
from api.custom_weather import custom_get_weather
from api.paint_sd import SDPaint
from prompt import Prompts

def agent_chat(prompt: str) -> str:
    """
    与agent进行对话
    :param prompt: 用户输入的对话内容
    :return: agent的回复
    """
    if Config.CHAT_MODEL != "custom":
        model = GPTChatMode()
        response = model.generate_text(prompt)
    else:
        model = CustomLLM()
        response = model.generate_text(prompt)

    return response


def agent_analyze(prompt: str) -> str:
    """
    分析用户输入
    :param prompt: 用户输入的对话内容
    :return: 分析结果
    """
    if Config.ANAYLIZE_MODEL != "custom":
        model = GPTAnalyzeMode()
        response = model.generate_text(prompt)
    else:
        model = CustomLLM()
        response = model.generate_text(Prompts.ANALYZER_PROMPT.format(prompt))

    return response


def agent_draw(prompt: str) -> str:
    """
    绘制mermaid图表
    :param prompt: 用户输入的对话内容
    :return: mermaid代码
    """
    if Config.DRAW_MODEL != "custom":
        #model = GPTBaseMode(model_name=Config.DRAW_MODEL, )
        model = GPTChatMode()
        response = model.generate_text(Prompts.MERMAID_PROMPT.format(prompt))
    else:
        model = CustomLLM()
        response = model.generate_text(Prompts.MERMAID_PROMPT.format(prompt))

    print(response)
    return response


def agent_paint(prompt: str):
    if Config.PAINT_MODEL == "custom":
        from api.paint_custom import CustomPaint
        painter = CustomPaint()
        return painter.generate_base64(prompt + painter.custom_prompt())
    else:
        painter = SDPaint()
        return painter.generate_base64(prompt + Prompts.ANYTHING_v3_PROMPT)


def agent(command: str):
    command = json.loads(command)
    print(command)

    if command["Mode"] == "Chat":
        return result("text", agent_chat(command["Content"]))

    elif command["Mode"] == "Weather":
        if APIConfig.WEATHER == "hefeng":
            res = get_weather(command["City"])
        elif APIConfig.WEATHER == "custom":
            res = custom_get_weather(command["City"])
        else:
            return "error"
        return result("text", agent_chat("请向用户说明" + command["City"] + "的天气情况并给出一些出行建议：" + str(res)))

    elif command["Mode"] == "Mermaid":
        return result("mermaid", agent_draw(command["Content"]))

    elif command["Mode"] == "Paint":
        return result("image", agent_paint(command["Content"]))

    elif command["Mode"] == "unknown":
        return result("error", command["Reason"])

    return result("error", "Panic! I don't know what to do!")


def result(type: str, content: str):
    return {"type": type, "content": content}
