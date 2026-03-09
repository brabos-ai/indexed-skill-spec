<!-- SECTION:examples-80s | keywords: 80s,style-transfer,era,retro,fashion,photo-style | 80s style photo transformation -->
## 80s Style Photo Transformation

```python
text_prompt = "Create a photograph of the person in this image as if they were living in the 1980s. The photograph should capture the distinct fashion, hairstyles, and overall atmosphere of that time period."

import PIL
person_image = PIL.Image.open("person.jpg")

response = client.models.generate_content(
    model=MODEL_ID,
    contents=[text_prompt, person_image],
    config=types.GenerateContentConfig(response_modalities=["Text", "Image"])
)
display_response(response)
```
<!-- /SECTION:examples-80s -->

<!-- SECTION:examples-figurine | keywords: figurine,miniature,toy,collectible,scale,3d-model,packaging | Mini figurine from photo -->
## Mini Figurine from Photo

```python
text_prompt = (
    "create a 1/7 scale commercialized figurine of the characters in the picture, "
    "in a realistic style, in a real environment. The figurine is placed on a computer desk. "
    "The figurine has a round transparent acrylic base, with no text on the base. "
    "The content on the computer screen is a 3D modeling process of this figurine. "
    "Next to the computer screen is a toy packaging box, designed in a style reminiscent "
    "of high-quality collectible figures, printed with original artwork. The packaging features "
    "two-dimensional flat illustrations."
)

import PIL
source_image = PIL.Image.open("character.jpg")

response = client.models.generate_content(
    model=MODEL_ID,
    contents=[text_prompt, source_image],
    config=types.GenerateContentConfig(response_modalities=["Text", "Image"])
)
display_response(response)
```
<!-- /SECTION:examples-figurine -->

<!-- SECTION:examples-stickers | keywords: sticker,pop-art,ben-day,halftone,die-cut,comic,custom-sticker | Pop-art sticker from photo -->
## Pop-Art Sticker from Photo

```python
text_prompt = (
    "Create a single sticker in the distinct Pop Art style. The image should feature bold, "
    "thick black outlines around all figures, objects, and text. Utilize a limited, flat color "
    "palette consisting of vibrant primary and secondary colors, applied in unshaded blocks, "
    "but maintain the person skin tone. Incorporate visible Ben-Day dots or halftone patterns "
    "to create shading, texture, and depth. The subject should display a dramatic expression. "
    "Include stylized text within speech bubbles or dynamic graphic shapes to represent sound effects. "
    "The overall aesthetic should be clean, graphic, and evoke a mass-produced, commercial art sensibility "
    "with a polished finish. The user's face from the uploaded photo must be the main character, "
    "ideally with an interesting outline shape that is not square or circular but closer to a dye-cut pattern."
)

import PIL
face_image = PIL.Image.open("face.jpg")

response = client.models.generate_content(
    model=MODEL_ID,
    contents=[text_prompt, face_image],
    config=types.GenerateContentConfig(response_modalities=["Text", "Image"])
)
display_response(response)
```
<!-- /SECTION:examples-stickers -->

<!-- SECTION:examples-colorize | keywords: colorize,restore,black-and-white,bw,historical,photo-restoration | Colorize black and white photos -->
## Colorize Black & White Photos

```python
import PIL
from IPython.display import Image

bw_image = PIL.Image.open("historical_photo.jpg")
text_prompt = "Restore and colorize this image from 1932."

response = client.models.generate_content(
    model=MODEL_ID,
    contents=[text_prompt, bw_image],
    config=types.GenerateContentConfig(response_modalities=["Text", "Image"])
)
display_response(response)
```
<!-- /SECTION:examples-colorize -->

<!-- SECTION:examples-isometric | keywords: isometric,landmark,3d,game-style,pixel,theme-park,architecture | Isometric landmark from map -->
## Isometric Landmark from Map

```python
import PIL

map_image = PIL.Image.open("map.png")
text_prompt = "Take this location and make the landmark an isometric image (building only), in the style of the game Theme Park."

response = client.models.generate_content(
    model=MODEL_ID,
    contents=[text_prompt, map_image],
    config=types.GenerateContentConfig(response_modalities=["Text", "Image"])
)
display_response(response)
```
<!-- /SECTION:examples-isometric -->

<!-- SECTION:examples-sprites | keywords: sprite-sheet,animation,frames,gif,grid,pixel-animation,game-asset | Sprite sheet and GIF generation -->
## Sprite Sheet & GIF (Pro & Nano-Banana 2)

Generate a sprite sheet from a reference grid, then convert to GIF.

```python
import PIL

# Download a 3x3 grid reference
import subprocess
subprocess.run(["wget", "https://storage.googleapis.com/generativeai-downloads/images/grid_3x3_1024.png", "-O", "grid_3x3_1024.png", "-q"])

grid_ref = PIL.Image.open("grid_3x3_1024.png")
text_prompt = "Sprite sheet of a jumping illustration, 3x3 grid, white background, sequence, frame by frame animation, square aspect ratio. Follow the structure of the attached reference image exactly."

response = client.models.generate_content(
    model=GEMINI3_MODEL_ID,
    contents=[text_prompt, grid_ref],
    config=types.GenerateContentConfig(response_modalities=["Text", "Image"])
)
save_image(response, "sprites.png")

# Convert sprite sheet to GIF
from IPython.display import display, Image as IPImage

sprite_image = PIL.Image.open("sprites.png")
w, h = sprite_image.size
frame_w, frame_h = w // 3, h // 3

frames = []
for row in range(3):
    for col in range(3):
        box = (col * frame_w, row * frame_h, (col + 1) * frame_w, (row + 1) * frame_h)
        frames.append(sprite_image.crop(box))

frames[0].save(
    "animation.gif",
    save_all=True,
    append_images=frames[1:],
    duration=100,
    loop=0
)
display(IPImage("animation.gif"))
```
<!-- /SECTION:examples-sprites -->

<!-- SECTION:examples-meme-restyle | keywords: meme,restyle,parody,recreate,famous-meme,style-change,chat | Restyle a famous meme -->
## Restyle a Famous Meme (Pro & Nano-Banana 2 + Chat)

```python
chat = client.chats.create(
    model=GEMINI3_MODEL_ID,
    config=types.GenerateContentConfig(
        response_modalities=["Text", "Image"]
    )
)

response = chat.send_message(
    "There's a very famous meme about a dog in a house on fire saying 'this is fine'. Can you do a papier maché version of it?"
)
display_response(response)
```
<!-- /SECTION:examples-meme-restyle -->

<!-- SECTION:examples-text-heavy | keywords: infographic,text-heavy,diagram,sonnet,literary,poster,typography | Text-heavy images and infographics -->
## Text-Heavy Images & Infographics (Pro & Nano-Banana 2)

```python
text_prompt = "Show me an infographic about how sonnets work, using a sonnet about bananas written in it, along with a lengthy literary analysis of the poem. Good vintage aesthetics."

response = client.models.generate_content(
    model=GEMINI3_MODEL_ID,
    contents=[text_prompt],
    config=types.GenerateContentConfig(
        response_modalities=["Text", "Image"],
        image_config=types.ImageConfig(aspect_ratio="9:16", image_size="2K")
    )
)
display_response(response)
```

Gemini 3 models excel at text-heavy images where precise typography and
layout are needed. Standard Flash handles simpler text fine.
<!-- /SECTION:examples-text-heavy -->
