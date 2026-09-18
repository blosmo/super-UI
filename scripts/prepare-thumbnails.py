"""Normalize browser captures without altering the original component artwork."""
from pathlib import Path
import sys
from PIL import Image, ImageChops

root = Path(__file__).resolve().parent.parent / 'public' / 'thumbnails'
count = 0
for source in root.glob('*.png'):
    target = source.with_suffix('.webp')
    if "--force" not in sys.argv and target.exists() and target.stat().st_mtime >= source.stat().st_mtime:
        continue
    image = Image.open(source).convert('RGB')
    # Trim unused white browser canvas, keeping spacing around the demo.
    difference = ImageChops.difference(image, Image.new('RGB', image.size, 'white'))
    mask = difference.convert('L').point(lambda value: 255 if value > 3 else 0)
    bounds = mask.getbbox()
    if bounds:
        left, top, right, bottom = bounds
        image = image.crop((max(0, left - 32), max(0, top - 32), min(image.width, right + 32), min(image.height, bottom + 32)))
    scale = min(672 / image.width, 432 / image.height, 2)
    image = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
    canvas = Image.new('RGB', (720, 480), 'white')
    canvas.paste(image, ((720 - image.width) // 2, (480 - image.height) // 2))
    canvas.save(target, 'WEBP', quality=85, method=6)
    count += 1
print(f'Prepared {count} thumbnails; {len(list(root.glob("*.webp")))} total.')
