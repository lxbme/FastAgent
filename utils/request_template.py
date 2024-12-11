from typing import Optional

from pydantic import BaseModel
class TTSRequest(BaseModel):
    text: str = "你好"
    speaker: str = "Taffy"
    language: Optional[str] = "简体中文"
    speed: Optional[float] = 1.0

class TTSResponse(BaseModel):
    message: str
    audio_base64: str