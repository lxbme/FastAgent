import json

from fastapi import FastAPI, File, UploadFile, Form, Body
import uvicorn
import os
import whisper_py
from fastapi.middleware.cors import CORSMiddleware

from config import Config
from llm.llm_gpt import GPTChatMode, GPTAnalyzeMode
from api.paint_sd import SDPaint
import agent
from prompt import Prompts

app = FastAPI()

# 添加以下代码来启用 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/transcribe/")
async def transcribe(file: UploadFile = File(...), language: str = Form(None)) -> dict:
    audio_path = f"temp_{file.filename}"
    with open(audio_path, "wb") as buffer:
        buffer.write(await file.read())
    result = whisper_py.transcribe(audio_path, language=language)
    os.remove(audio_path)
    #print(result)
    return {"transcription": result["text"], "language": result["language"]}

@app.post("/gpt-conversation/")
async def gpt_conversation(prompt: str):
    gpt = GPTChatMode()
    response = gpt.generate_text(prompt)
    return {"response": response}

@app.post("/gpt-analyze/")
async def gpt_analyze(prompt: str):
    gpt = GPTAnalyzeMode()
    response = gpt.generate_text(prompt)
    return json.loads(response)

@app.post("/sd-paint/")
async def sd_paint(prompt: str):
    sd = SDPaint()
    img = sd.generate_base64(prompt)
    return img

@app.post("/agent/")
async def agent_processer(prompt: str):
    command: str = agent.agent_analyze(prompt)
    return agent.agent(command)

@app.post("/")
async def process(file: UploadFile = File(...), language: str = Form(None)) -> dict:
    audio_path = f"temp_{file.filename}"
    with open(audio_path, "wb") as buffer:
        buffer.write(await file.read())
    result = whisper_py.transcribe(audio_path, language=language)
    os.remove(audio_path)
    command = agent.agent_analyze(result["text"])
    response = agent.agent(command)
    response["prompt"] = result["text"]
    print(response)
    return response

@app.get("/analyzer-prompt/")
async def analyzer_prompt():
    return "<p>" + Prompts.ANALYZER_PROMPT + "</p>"

@app.get("/api-registery/")
async def api_registery():
    return api_registry.get_registry()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)