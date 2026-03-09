<!-- SECTION:gemini3-overview | keywords: gemini-3,nano-banana-pro,nano-banana-2,thinking,grounding,advanced,models | Gemini 3 models overview -->
## Gemini 3 Models Overview

Both **Nano-Banana Pro** (`gemini-3-pro-image-preview`) and **Nano-Banana 2**
(`gemini-3.1-flash-image-preview`) extend the base Flash model with:

- **Thinking** — deeper reasoning before generating
- **Search Grounding** — access to real-world data via Google Search
- **High Resolution** — 2K and 4K output (Pro supports up to 4K)

Nano-Banana 2 also adds:
- **Thinking Levels** (`Minimal` / `High`) to control reasoning depth
- **512p low-latency** resolution mode
- **Image Search Grounding** (searches for images, not just text)

Setup for Gemini 3 sections:

```python
from google.colab import userdata
from google import genai
from google.genai import types

client = genai.Client(api_key=userdata.get('GOOGLE_API_KEY'))

GEMINI3_MODEL_ID = "gemini-3.1-flash-image-preview"
# or: "gemini-3-pro-image-preview"
```
<!-- /SECTION:gemini3-overview -->

<!-- SECTION:gemini3-thinking | keywords: thinking,thoughts,thought-signature,reasoning,thinking-level,minimal,high | Thinking capabilities -->
## Thinking Capabilities

Gemini 3 models think before generating. Nano-Banana 2 supports thinking levels.

```python
prompt = "Create an unusual but realistic image that might go viral"
thinking_level = "High"  # "Minimal" or "High" (Nano-Banana 2 only)

response = client.models.generate_content(
    model=GEMINI3_MODEL_ID,
    contents=prompt,
    config=types.GenerateContentConfig(
        response_modalities=["Text", "Image"],
        image_config=types.ImageConfig(aspect_ratio="16:9"),
        thinking_config=types.ThinkingConfig(thinking_budget=-1)  # High
    )
)

display_response(response)
```

### Inspect Thought Content

```python
for part in response.parts:
    if part.thought:
        if part.text:
            display(Markdown(part.text))
        elif image := part.as_image():
            display(image)
```

### Thought Signatures

Every response part from Gemini 3 contains `thought_signatures`. These are
managed automatically by the SDK in chat mode — they help the model remember
what it thought in previous turns, enabling better multi-turn consistency.

```python
for part in response.parts:
    if part.thought_signature:
        print(part.thought_signature)
```

Note: thought tokens are billed as output tokens (but images inside thoughts
are not billed).
<!-- /SECTION:gemini3-thinking -->

<!-- SECTION:gemini3-search-grounding | keywords: search,grounding,google-search,real-world,current,weather,grounding-metadata | Search grounding (text) -->
## Search Grounding (Text)

Add `tools=[{"google_search": {}}]` to give the model access to current
real-world information.

```python
prompt = "Visualize the current weather forecast for the next 5 days in Tokyo as a clean, modern weather chart. Add a visual on what I should wear each day."

response = client.models.generate_content(
    model=GEMINI3_MODEL_ID,
    contents=prompt,
    config=types.GenerateContentConfig(
        response_modalities=["Text", "Image"],
        image_config=types.ImageConfig(aspect_ratio="16:9"),
        tools=[{"google_search": {}}]
    )
)

display_response(response)
```

### Display Grounding Sources

```python
from IPython.display import HTML, display

display(HTML(
    response.candidates[0].grounding_metadata.search_entry_point.rendered_content
))
```

Note: Search grounding only retrieves text results, not images from Google
Search (for image-based grounding see `setup-image-grounding`).
<!-- /SECTION:gemini3-search-grounding -->

<!-- SECTION:gemini3-image-grounding | keywords: image-grounding,image-search,search-types,google-search,visual-grounding,nano-banana-2 | Image search grounding (Nano-Banana 2) -->
## Image Search Grounding (Nano-Banana 2)

Nano-Banana 2 can search for images on Google to ground its generations more
accurately — useful for real-world places, landmarks, or specific species.

```python
PROMPT = "A detailed painting of a Timareta Thelxione butterfly resting on a flower"

response = client.models.generate_content(
    model="gemini-3.1-flash-image-preview",
    contents=PROMPT,
    config=types.GenerateContentConfig(
        response_modalities=["Text", "Image"],
        tools=[{
            "google_search": {
                "search_types": ["IMAGE_SEARCH"]  # enables image grounding
            }
        }]
    )
)

display_response(response)
```

Without `search_types`, `google_search` defaults to text-only grounding.
<!-- /SECTION:gemini3-image-grounding -->
