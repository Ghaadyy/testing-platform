from pydantic import BaseModel

class ImageDescription(BaseModel):
    description: str

class Element(BaseModel):
    description: str

class ImageElements(BaseModel):
    image: str
    elements: list[Element]

DEEPSEEK = "deepseek-r1-distill-qwen-7b"
LLAVA = "llava:7b"

OUTPUT_SCHEMA = {
    "type": "json_schema",
    "json_schema": {
        "schema": ImageElements.model_json_schema()
    },
}

DEEPSEEK_PROMPT = """
You are given a JSON object containing a list of UI elements from a webpage. Each element contains a "category" (e.g., button, label, checkbox) and optional "text" (e.g., "Submit", "Username"). The "bbox" (bounding box) should be ignored, and no mention of coordinates should appear in your description.

For each element:
- Use the category and the text to generate a short, human-like description of the UI element.
- Describe the element as if you were explaining it to someone, but keep the description brief—no more than a few words or a short sentence.
- Focus on what the element is and its purpose, based on its category and text, and ignore any bounding box or coordinates.
- Provide only a concise description as per the output schema and do not mention the bounding box in the description.
""".strip()

LLAVA_PROMPT = """
You are given a cropped image of a web UI element, describing an icon button. 

### Your task:
- For the icon button image, generate **one** brief, human-readable description.
- Keep the description **concise**.
- Focus only on **what the icon is**.
- Do **not** include extra details or explanations.
- The image is a cropped icon button from a web UI, so only describe the icon itself.

### Example:
```json
{
    "description": "A small refresh icon"
}
```
""".strip()
