import base64
import threading
from io import BytesIO
import torch
from api.paint_base import PaintBase

from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler

from config import Config
from prompt import Prompts

def dummy(images, **kwargs):
    return images, [False]

class SDPaint(PaintBase):
    _instance = None
    _lock = threading.Lock()
    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(SDPaint, cls).__new__(cls)
        return cls._instance
    def __init__(self, model_name=Config.PAINT_MODEL):
        self.pipe = StableDiffusionPipeline.from_pretrained(model_name,torch_dtype=torch.float16)
        self.pipe.scheduler = DPMSolverMultistepScheduler.from_pretrained("Linaqruf/anything-v3.0", subfolder="scheduler")
        self.pipe.safety_checker = dummy
        self.pipe.to("cuda")

    def process(self, prompt):
        return self.pipe(prompt, negative_prompt=Prompts.ANYTHING_v3_NEGATIVE_PROMPT, guidance_scale=7,
                         num_inference_steps=40, height=768, width=512).images[0]

    def generate_base64(self, prompt):
        img =  self.process(prompt)
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return img_str

    def custom_prompt(self):
        return ''