"""Generate a colorized version of the VR mascot using Nano Banana (Gemini image editing).
Body filled with #C79C50 (logo orange/gold), VR goggles filled with #78949E (logo gray-blue).
Original black outlines preserved. Output: /app/frontend/public/mascotte/vr-brand.png
"""
import asyncio
import os
import base64
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

load_dotenv("/app/backend/.env")

INPUT_PATH = Path("/app/frontend/public/mascotte/vr-dark.png")
OUTPUT_PATH = Path("/app/frontend/public/mascotte/vr-brand.png")

PROMPT = (
    "Take this hand-drawn line-art mascot character (a round happy blob wearing a VR headset) "
    "and recolor it with flat fills while preserving 100% of the original black outlines and "
    "the original hand-drawn style. Fill rules:\n"
    "1. BODY of the character (the round blob, arms, feet, head visible area below/around the goggles) "
    "filled with FLAT WARM GOLD-ORANGE color #C79C50.\n"
    "2. The VR GOGGLES/HEADSET (the rectangular visor with strap covering the upper face) "
    "filled with FLAT GRAY-BLUE color #78949E.\n"
    "3. KEEP every original black outline intact and visible.\n"
    "4. Keep the small smile, the sparkle/wonder lines, and all hand-drawn details exactly as they are.\n"
    "5. Background must be FULLY TRANSPARENT (alpha channel, no white box).\n"
    "6. Do NOT add shadows, gradients, glows, or any additional elements. Flat fills only.\n"
    "7. Same composition, same pose, same proportions as the input image.\n"
    "Return ONLY the recolored mascot as a transparent PNG."
)


async def main():
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("EMERGENT_LLM_KEY missing")
        return

    if not INPUT_PATH.exists():
        print(f"Input not found: {INPUT_PATH}")
        return

    image_b64 = base64.b64encode(INPUT_PATH.read_bytes()).decode("utf-8")

    chat = LlmChat(
        api_key=api_key,
        session_id="vr-mascot-recolor",
        system_message="You are an expert illustrator that recolors hand-drawn line-art mascots.",
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )

    msg = UserMessage(
        text=PROMPT,
        file_contents=[ImageContent(image_b64)],
    )

    print("Calling Nano Banana...")
    text, images = await chat.send_message_multimodal_response(msg)
    print(f"Text response: {text[:200] if text else '(empty)'}")

    if not images:
        print("No images returned.")
        return

    img_bytes = base64.b64decode(images[0]["data"])
    OUTPUT_PATH.write_bytes(img_bytes)
    print(f"Saved {len(img_bytes)} bytes to {OUTPUT_PATH}")


if __name__ == "__main__":
    asyncio.run(main())
