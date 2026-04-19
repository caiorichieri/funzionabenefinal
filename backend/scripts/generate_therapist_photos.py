"""Generate 4 professional therapist portraits using OpenAI gpt-image-1 via emergent key."""
import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

OUTPUT_DIR = Path("/app/backend/uploads/therapists")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

THERAPISTS = [
    {
        "filename": "alessandro_conti.png",
        "prompt": "Professional editorial portrait headshot of an Italian male psychologist, 55 years old, grey hair, warm kind eyes, wearing a dark grey blazer over a crisp white shirt, soft confident smile, photographed against a softly blurred warm beige studio backdrop, natural window light from the left, photorealistic magazine-quality portrait, shallow depth of field, high resolution",
    },
    {
        "filename": "giulia_marchetti.png",
        "prompt": "Professional editorial portrait headshot of an Italian female psychologist and sexologist, 38 years old, long dark brown wavy hair, olive skin, wearing an elegant navy blue blouse, calm intelligent gaze with a subtle warm smile, photographed against a softly blurred muted gold studio backdrop, natural soft light, photorealistic magazine-quality portrait, shallow depth of field, high resolution",
    },
    {
        "filename": "marco_fontana.png",
        "prompt": "Professional editorial portrait headshot of an Italian male psychologist, 32 years old, short neat black beard, modern stylish glasses, wearing a charcoal grey turtleneck sweater, friendly approachable expression, photographed against a softly blurred deep teal studio backdrop, natural soft directional light, photorealistic magazine-quality portrait, shallow depth of field, high resolution",
    },
    {
        "filename": "chiara_esposito.png",
        "prompt": "Professional editorial portrait headshot of an Italian female psychologist and sex therapist, 45 years old, short modern bob haircut in auburn tones, wearing a burgundy knit blazer, confident warm expression with a gentle smile, photographed against a softly blurred warm taupe studio backdrop, soft natural lighting, photorealistic magazine-quality portrait, shallow depth of field, high resolution",
    },
]


async def main():
    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key:
        print("NO KEY"); return
    gen = OpenAIImageGeneration(api_key=key)
    for t in THERAPISTS:
        out_path = OUTPUT_DIR / t["filename"]
        if out_path.exists() and out_path.stat().st_size > 1000:
            print(f"SKIP existing: {t['filename']}")
            continue
        print(f"Generating {t['filename']}...")
        try:
            images = await gen.generate_images(prompt=t["prompt"], model="gpt-image-1", number_of_images=1)
            if images:
                out_path.write_bytes(images[0])
                print(f"  OK {len(images[0])} bytes")
        except Exception as e:
            print(f"  FAILED: {e}")


if __name__ == "__main__":
    asyncio.run(main())
