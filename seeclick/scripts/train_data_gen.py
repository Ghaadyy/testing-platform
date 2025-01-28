import json
import logging
import os
import random

import cv2
from tqdm import tqdm
from ultralytics import YOLO
from paddleocr import PaddleOCR
from openai import OpenAI
from constants import DEEPSEEK, OUTPUT_SCHEMA, PROMPT
from dotenv import load_dotenv

load_dotenv()

YOLO_PATH = os.getenv("YOLO_PATH")
image_folder = os.getenv("IMG_DIR")
output_file = os.getenv("OUTPUT_FILE")
cropped_image_folder = os.getenv("CROPPED_IMG_DIR")
yolo_images = os.getenv("YOLO_IMG_DIR")

logging.getLogger('ppocr').setLevel(logging.WARNING)

ocr = PaddleOCR(use_angle_cls=True, lang='en')

model = YOLO(YOLO_PATH)

client = OpenAI(
    base_url="http://localhost:1234/v1",
    api_key="lm-studio"
)

def get_descriptions(image_result, model=DEEPSEEK):
    completion = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": PROMPT},
            {"role": "user", "content": json.dumps(image_result)}
        ],
        temperature=0.7,
        response_format=OUTPUT_SCHEMA
    )
    
    return json.loads(completion.choices[0].message.content)

all_results = []

image_files = [img_name for img_name in os.listdir(image_folder) if img_name.endswith(".jpg")]
total_images = len(image_files)

for img_name in tqdm(image_files, desc="Processing images", total=total_images):
    img_path = os.path.join(image_folder, img_name)

    if not os.path.exists(img_path):
        continue
    
    results = model(img_path)
    plot = results[0].plot()

    image = cv2.imread(img_path)

    image_result = {
        "image": img_name,
        "elements": []
    }

    for result in results:
        result.save(filename=f"{yolo_images}{os.path.splitext(img_name)[0]}_yolo.jpg")

        boxes = result.boxes  # Get boxes
        for box in boxes:
            x1, y1, x2, y2 = box.xyxy[0]

            class_id = int(box.cls[0])  # Class ID (category index)
            class_name = result.names[class_id]  # Class name

            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)

            cropped_image = image[y1:y2, x1:x2]

            ocr_result = ocr.ocr(cropped_image, cls=True)

            element = {}
            if ocr_result[0]:
                for line in ocr_result[0]:
                    text = line[1][0]  # Extract the text
                    element = {
                        "bbox": box.xyxy[0].tolist(),
                        "category": class_name,
                        "text": text
                    }
            else:
                cropped_image_path = os.path.join(cropped_image_folder,
                                                    f"{os.path.splitext(img_name)[0]}_cropped_{x1}_{y1}_{x2}_{y2}"
                                                    f".jpg")
                cv2.imwrite(cropped_image_path, cropped_image)

                element = {
                    "bbox": box.xyxy[0].tolist(),
                    "category": class_name,
                    "text": "No text detected"
                }

            image_result["elements"].append(element)
            
    image_result["elements"] = random.sample(image_result["elements"], 5)

    descriptions = get_descriptions(image_result)

    print(descriptions)
    
    for i, desc in enumerate(descriptions['elements']):
        image_result['elements'][i]['description'] = desc['description']

    all_results.append(image_result)

with open(output_file, 'w') as outfile:
    json.dump(all_results, outfile, indent=4)
