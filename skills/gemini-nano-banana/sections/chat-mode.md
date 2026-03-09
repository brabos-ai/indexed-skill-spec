<!-- SECTION:chat-create | keywords: chat,multi-turn,conversation,session,chats-create,iterative | Create a chat session -->
## Create a Chat Session

Chat mode is the recommended approach for iterative image editing. State is
preserved across turns.

```python
chat = client.chats.create(
    model=MODEL_ID,
    config=types.GenerateContentConfig(
        response_modalities=["Text", "Image"]
    )
)
```
<!-- /SECTION:chat-create -->

<!-- SECTION:chat-iteration | keywords: chat,send-message,iterate,turn,edit,update,refine | Iterate on images via chat turns -->
## Iterate via Chat Turns

Each `send_message` builds on the previous. The model remembers what was generated.

```python
# Turn 1: create the initial image
response = chat.send_message("Create a plastic toy fox figurine in a kid's bedroom.")
display_response(response)
save_image(response, "figurine.png")

# Turn 2: modify a detail
response = chat.send_message("Add a blue planet on the figurine's helmet or hat (add one if needed).")
display_response(response)

# Turn 3: change the scene
response = chat.send_message("Move that figurine to a beach.")
display_response(response)

# Turn 4: further edits
response = chat.send_message("Now it should be base-jumping from a spaceship with a wingsuit.")
display_response(response)

# Turn 5: another scene
response = chat.send_message("Cooking a barbecue with an apron.")
display_response(response)
```

Character consistency (shape, colors, accessories) is maintained automatically
across turns.
<!-- /SECTION:chat-iteration -->

<!-- SECTION:chat-aspect-ratio | keywords: chat,aspect-ratio,image-config,per-turn-config,size | Control aspect ratio in chat -->
## Control Aspect Ratio in Chat

Override per-turn config by passing `config` to `send_message`.

```python
response = chat.send_message(
    "Bring it back to the bedroom.",
    config=types.GenerateContentConfig(
        response_modalities=["Text", "Image"],
        image_config=types.ImageConfig(aspect_ratio="16:9")
    )
)
display_response(response)
```

Each turn can use a different aspect ratio without affecting previous turns.
<!-- /SECTION:chat-aspect-ratio -->
