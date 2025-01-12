import base64
import ast
import tempfile
import os
from functools import wraps

import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
from flask import Flask, request, jsonify

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from transformers.generation import GenerationConfig
from PIL import Image

SECRET_KEY = "averyveryverylongsecretthatshouldnotbeusedinproduction"
app = Flask(__name__)

tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen-VL-Chat", trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained("./SeeClick", device_map="cuda", trust_remote_code=True, bf16=True).eval()
model.generation_config = GenerationConfig.from_pretrained("Qwen/Qwen-VL-Chat", trust_remote_code=True)

def authorize(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"msg": "Token is missing"}), 401

        if token.startswith("Bearer "):
            token = token[7:]

        try:
            decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.decoded_token = decoded_token 
            return f(*args, **kwargs)
        except ExpiredSignatureError:
            return jsonify({"msg": "Token has expired"}), 401
        except InvalidTokenError:
            return jsonify({"msg": "Invalid token"}), 401

    return decorator

@app.post("/coordinates")
@authorize
def getCoordinates():
    data = request.json
    description = data['description']
    element_type = data['element_type']
    image = base64.b64decode(data['image'])

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as temp_img:
        img_path = temp_img.name
        temp_img.write(image)
    
    try:
        prompt = "In this UI screenshot, what is the position of the {} corresponding to the description \"{}\" (with point)?"

        query = tokenizer.from_list_format([
            {'image': img_path},
            {'text': prompt.format(element_type, description)},
        ])

        response, _ = model.chat(tokenizer, query=query, history=None)
        x, y = ast.literal_eval(response)

        with Image.open(img_path) as img:
            width, height = img.size

        point = (round(width*x), round(height*y))
        return jsonify(point)
        
    finally:
        if os.path.exists(img_path):
            os.remove(img_path)

if __name__ == '__main__':
    app.run(host="0.0.0.0")