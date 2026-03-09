<!-- SECTION:setup-install | keywords: install,sdk,pip,google-genai,package,dependency | Install the SDK -->
## Install the SDK

Requires `google-genai >= 1.65.0` for Nano-Banana 2 support.

```bash
%pip install -U -q "google-genai>=1.65.0"
```
<!-- /SECTION:setup-install -->

<!-- SECTION:setup-apikey | keywords: api-key,apikey,secret,authentication,colab,google-api-key | Configure API key -->
## Configure API Key

Store your key as a Colab Secret named `GOOGLE_API_KEY`.

```python
from google.colab import userdata

GOOGLE_API_KEY = userdata.get('GOOGLE_API_KEY')
```
<!-- /SECTION:setup-apikey -->

<!-- SECTION:setup-client | keywords: client,initialize,genai,sdk-client,setup | Initialize the SDK client -->
## Initialize SDK Client

```python
from google import genai
from google.genai import types

client = genai.Client(api_key=GOOGLE_API_KEY)
```

The model is set per call, not on the client.
<!-- /SECTION:setup-client -->

<!-- SECTION:setup-models | keywords: model,model-id,nano-banana,flash-image,pro-image,select-model,gemini-2.5,gemini-3 | Select a model -->
## Select a Model

| Model ID | Alias | Notes |
|---|---|---|
| `gemini-2.5-flash-image` | nano-banana | Cheap, fast, default choice |
| `gemini-3.1-flash-image-preview` | nano-banana-2 | Thinking, Search Grounding, 512p resolution |
| `gemini-3-pro-image-preview` | nano-banana-pro | Thinking, Search Grounding, 2K/4K images |

```python
MODEL_ID = "gemini-2.5-flash-image"
# or: "gemini-3.1-flash-image-preview"
# or: "gemini-3-pro-image-preview"
```

Use `gemini-2.5-flash-image` by default. Switch to Gemini 3 models for
thinking, grounding, or high-resolution output.
<!-- /SECTION:setup-models -->

<!-- SECTION:setup-utils | keywords: display,utils,helper,response,parts,image,text,save | Utility functions for displaying responses -->
## Utility Functions

Model responses contain multiple parts — some text, some images. Loop over all parts.

```python
from IPython.display import display, Markdown
import pathlib

def display_response(response):
    for part in response.candidates[0].content.parts:
        if part.text:
            display(Markdown(part.text))
        elif image := part.as_image():
            display(image)

def save_image(response, filename):
    for part in response.candidates[0].content.parts:
        if image := part.as_image():
            pathlib.Path(filename).write_bytes(image.image_bytes)
            break
```
<!-- /SECTION:setup-utils -->
