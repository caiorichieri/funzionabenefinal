"""Remove the visible checkerboard pattern from vr-brand.png and make background truly transparent."""
from pathlib import Path
from PIL import Image

SRC = Path("/app/frontend/public/mascotte/vr-brand.png")
DST = SRC  # overwrite

img = Image.open(SRC).convert("RGBA")
w, h = img.size
print(f"Image: {w}x{h}, mode={img.mode}")

pixels = img.load()

# Checkerboard typical colors: light gray ~#CCCCCC and white ~#FFFFFF
# Use a tolerant detection: any pixel that is in the gray/white range and NOT close to
# the mascot's gold-orange (#C79C50) or gray-blue (#78949E) or black (outlines).

def is_checker(r, g, b, a):
    # near white
    if r > 235 and g > 235 and b > 235:
        return True
    # near light gray (checkerboard squares ~#B0B0B0 to #E0E0E0)
    if (170 <= r <= 235) and (170 <= g <= 235) and (170 <= b <= 235) and abs(r-g) < 12 and abs(g-b) < 12 and abs(r-b) < 12:
        return True
    return False

removed = 0
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        if is_checker(r, g, b, a):
            pixels[x, y] = (255, 255, 255, 0)  # transparent
            removed += 1

print(f"Made {removed} pixels transparent ({removed * 100 / (w*h):.1f}%)")
img.save(DST, "PNG")
print(f"Saved to {DST}")
