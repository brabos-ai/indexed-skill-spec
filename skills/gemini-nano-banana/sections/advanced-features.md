<!-- SECTION:advanced-4k | keywords: 4k,2k,resolution,high-resolution,image-size,image-resolution,hd | Generate 2K and 4K images -->
## Generate 2K and 4K Images (Pro & Nano-Banana 2)

Supported by `gemini-3-pro-image-preview` and `gemini-3.1-flash-image-preview`.
4K images are more expensive — use only when needed.

```python
prompt = "A photo of an oak tree experiencing every season"

response = client.models.generate_content(
    model=GEMINI3_MODEL_ID,
    contents=prompt,
    config=types.GenerateContentConfig(
        response_modalities=["Text", "Image"],
        image_config=types.ImageConfig(
            aspect_ratio="1:1",
            image_size="4K"   # "1K", "2K", or "4K"
        )
    )
)

display_response(response)
```

Resolution table per aspect ratio:

| Ratio | 1K | 2K | 4K |
|---|---|---|---|
| 1:1 | 1024×1024 | 2048×2048 | 4096×4096 |
| 16:9 | 1824×1024 | 3648×2048 | 7296×4096 |
| 9:16 | 1024×1824 | 2048×3648 | 4096×7296 |
| 2:3 | 832×1248 | 1664×2496 | 3328×4992 |
| 3:2 | 1248×832 | 2496×1664 | 4992×3328 |
<!-- /SECTION:advanced-4k -->

<!-- SECTION:advanced-512p | keywords: 512p,512px,low-latency,fast,speed,batch,nano-banana-2 | 512p low-latency mode (Nano-Banana 2) -->
## 512p Low-Latency Resolution (Nano-Banana 2)

Nano-Banana 2 supports 512px mode — optimized for speed and low cost.
Ideal for bulk generation or draft previews before upscaling.

```python
response = client.models.generate_content(
    model="gemini-3.1-flash-image-preview",
    contents="A cute pixel art robot",
    config=types.GenerateContentConfig(
        response_modalities=["Text", "Image"],
        image_config=types.ImageConfig(image_size="512px")
    )
)

display_response(response)
```

Tip: Combine 512px with the Batch API to minimize costs at scale, then
upscale selected results to 1K, 2K, or 4K.
<!-- /SECTION:advanced-512p -->

<!-- SECTION:advanced-multilanguage | keywords: language,translate,infographic,multilingual,spanish,japanese,localize,text-in-image | Multi-language image generation and translation -->
## Multi-Language Image Generation & Translation

Generate or translate image content (infographics, diagrams, labels) into
over a dozen languages. Use chat mode for translation workflows.

```python
chat = client.chats.create(
    model=GEMINI3_MODEL_ID,
    config=types.GenerateContentConfig(
        response_modalities=['Text', 'Image'],
        tools=[{"google_search": {}}]
    )
)

# Generate in Spanish
response = chat.send_message(
    "Make an infographic explaining Einstein's theory of General Relativity suitable for a 6th grader in Spanish.",
    config=types.GenerateContentConfig(
        response_modalities=["Text", "Image"],
        image_config=types.ImageConfig(aspect_ratio="16:9", image_size="1K")
    )
)
display_response(response)

# Translate to Japanese in the next turn
response = chat.send_message(
    "Translate this infographic in Japanese, keeping everything else the same.",
    config=types.GenerateContentConfig(
        response_modalities=["Text", "Image"],
        image_config=types.ImageConfig(image_size="2K")
    )
)
display_response(response)
```

Chat mode preserves the original image layout so translations match the
original design exactly.
<!-- /SECTION:advanced-multilanguage -->
