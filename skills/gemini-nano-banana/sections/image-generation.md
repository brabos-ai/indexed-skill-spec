<!-- SECTION:imagegen-basic | keywords: generate,image,generate-content,prompt,text-to-image,create-image,response-modalities | Basic image generation -->
## Basic Image Generation

Call `generate_content` with a text prompt. The model returns text and image parts.

```python
prompt = "Create a photorealistic image of a siamese cat with a green left eye and a blue right one."

response = client.models.generate_content(
    model=MODEL_ID,
    contents=prompt,
    config=types.GenerateContentConfig(
        response_modalities=["Text", "Image"]
    )
)

display_response(response)
```

`response_modalities` is optional — the model defaults to text + image with
these models. Use `response_modalities=['Image']` if you only need the image.
<!-- /SECTION:imagegen-basic -->

<!-- SECTION:imagegen-edit | keywords: edit,image-editing,modify,transform,input-image,upload-image,character-consistency | Edit an existing image -->
## Edit an Image

Pass the original image as part of the prompt. The model preserves character
consistency across edits.

```python
import PIL

original = PIL.Image.open("cat.png")
text_prompt = "Create a side view of that cat in a tropical forest, eating a nano-banana, under the stars."

response = client.models.generate_content(
    model=MODEL_ID,
    contents=[text_prompt, original],
    config=types.GenerateContentConfig(
        response_modalities=["Text", "Image"]
    )
)

display_response(response)
```

Character details (eye colors, nose markings, etc.) are preserved across edits
without re-specifying them.
<!-- /SECTION:imagegen-edit -->

<!-- SECTION:imagegen-aspect-ratio | keywords: aspect-ratio,resolution,size,dimensions,image-config,16:9,square | Control aspect ratio -->
## Control Aspect Ratio

Set `aspect_ratio` in `image_config`. Default is 1:1 (square) unless matching
input images.

```python
response = client.models.generate_content(
    model=MODEL_ID,
    contents=[text_prompt, input_image],
    config=types.GenerateContentConfig(
        response_modalities=["Text", "Image"],
        image_config=types.ImageConfig(aspect_ratio="16:9")
    )
)
```

Available aspect ratios and 1K resolutions:

| Ratio | Resolution |
|---|---|
| 1:1 | 1024×1024 |
| 16:9 | 1824×1024 |
| 9:16 | 1024×1824 |
| 2:3 | 832×1248 |
| 3:2 | 1248×832 |
| 4:3 | 1248×936 |
| 3:4 | 936×1248 |
| 4:5 | 936×1168 |
| 5:4 | 1168×936 |
| 1:4 | 512×2048 |
| 4:1 | 2048×512 |
| 1:8 | 512×4096 |
| 8:1 | 4096×512 |
| 21:9 | 2048×882 |
<!-- /SECTION:imagegen-aspect-ratio -->

<!-- SECTION:imagegen-multiple | keywords: multiple-images,story,sequence,multi-image-output,baking,recipe | Generate multiple images in one call -->
## Generate Multiple Images (Stories / Sequences)

Request multiple images in a single call by asking for a story or step sequence.

```python
prompt = "Show me how to bake macarons with images"
# or: "Create a beautifully entertaining 8 part story with 8 images..."

response = client.models.generate_content(
    model=MODEL_ID,
    contents=prompt,
    config=types.GenerateContentConfig(
        response_modalities=["Text", "Image"]
    )
)

display_response(response)
```

The response contains interleaved text and image parts — loop over all parts
to display them in order.
<!-- /SECTION:imagegen-multiple -->
