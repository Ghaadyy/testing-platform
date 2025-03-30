import base64
import ast
import tempfile
import os
from functools import wraps
import requests
import platform
import io

from flask import Flask, request, jsonify
from auth import authorize

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, AutoProcessor
from transformers.generation import GenerationConfig
from PIL import Image, ImageDraw

def get_device():
    if torch.cuda.is_available():
        print("[DEVICE] CUDA is available. Using GPU.")
        return torch.device("cuda")
    elif platform.system() == "Darwin" and torch.backends.mps.is_available():
        print("[DEVICE] MPS is available on macOS. Using MPS.")
        return torch.device("mps")
    else:
        print("[DEVICE] No GPU available. Using CPU.")
        return torch.device("cpu")

app = Flask(__name__)

device = get_device()
torch_dtype = torch.float16

BASE_MODEL = "microsoft/Florence-2-base" # "microsoft/Florence-2-large"

model = AutoModelForCausalLM.from_pretrained(BASE_MODEL, torch_dtype=torch_dtype, trust_remote_code=True).to(device)
processor = AutoProcessor.from_pretrained(BASE_MODEL, trust_remote_code=True)

def run_model(image, task_prompt='<OPEN_VOCABULARY_DETECTION>', text_input=''):
    prompt = task_prompt + text_input

    inputs = processor(text=prompt, images=image, return_tensors="pt").to(device, torch_dtype)

    generated_ids = model.generate(
        input_ids=inputs["input_ids"],
        pixel_values=inputs["pixel_values"],
        max_new_tokens=4096,
        num_beams=3,
        do_sample=False
    )

    generated_text = processor.batch_decode(generated_ids, skip_special_tokens=False)[0]
    parsed_answer = processor.post_process_generation(
        generated_text, 
        task=task_prompt, 
        image_size=(image.width, image.height)
    )

    return parsed_answer

def draw_bbox(image, coordinates):
    draw = ImageDraw.Draw(image)
    for coord in coordinates:
        draw.rectangle(coord, outline="red", width=3)
    return image

@app.post("/coordinates")
# @authorize
def get_coordinates():
    data = request.json
    description = data['description']
    # element_type = data['element_type']

    decoded_image = base64.b64decode(data['image'])
    image = Image.open(io.BytesIO(decoded_image)).convert('RGB')
    
    results = run_model(image, text_input=description)

    boxes = results[task]['bboxes']
    image_boxes = draw_bbox(image, boxes)

    img_bytes = io.BytesIO()
    image_boxes.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    return jsonify({"image": base64.b64encode(img_bytes.getvalue()).decode('utf-8')})
        
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001)