<!-- SECTION:mix-basic | keywords: mix,combine,multiple-images,input-images,fusion,collage,blend,pil | Mix multiple input images -->
## Mix Multiple Input Images

Pass multiple PIL images in `contents` to combine elements from each.

```python
import PIL

text_prompt = "Create a picture of that figurine riding that cat in a fantasy world."

image1 = PIL.Image.open("figurine.png")
image2 = PIL.Image.open("cat.png")

response = client.models.generate_content(
    model=MODEL_ID,
    contents=[text_prompt, image1, image2],
    config=types.GenerateContentConfig(
        response_modalities=["Text", "Image"]
    )
)

display_response(response)
```

Image limits per model:
- `gemini-2.5-flash-image` (nano-banana): up to **3 images**
- `gemini-3-pro-image-preview` (nano-banana-pro): up to **14 images**
- `gemini-3.1-flash-image-preview` (nano-banana-2): up to **6 images (high fidelity)** or **14 images**
<!-- /SECTION:mix-basic -->

<!-- SECTION:mix-pro-extended | keywords: mix,14-images,nano-banana-pro,nano-banana-2,extended,marketing,product | Mix up to 14 images (Pro & Nano-Banana 2) -->
## Mix Up to 14 Images (Pro & Nano-Banana 2)

Download or load multiple images and pass them all in `contents`.

```python
import PIL

# Load images
images = [
    PIL.Image.open("sweets.png"),
    PIL.Image.open("car.png"),
    PIL.Image.open("rabbit.png"),
    PIL.Image.open("spartan.png"),
]

prompt = "Create a marketing photoshoot of those items from my daughter's bedroom. Focus on the items and ignore their backgrounds."

response = client.models.generate_content(
    model="gemini-3.1-flash-image-preview",  # or gemini-3-pro-image-preview
    contents=[prompt] + images,
    config=types.GenerateContentConfig(
        response_modalities=["Text", "Image"],
        image_config=types.ImageConfig(aspect_ratio="5:4")
    )
)

display_response(response)
```

Tip: If you need to go beyond the image upload limit, combine multiple images
into a single collage first, then pass the collage as one input.
<!-- /SECTION:mix-pro-extended -->
