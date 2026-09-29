from __future__ import annotations

import argparse
from pathlib import Path

import pypdfium2 as pdfium
from PIL import Image


CROPS = {
    "quarter-1": (500, 270, 1320, 720),
    "quarter-2": (500, 510, 930, 1130),
    "quarter-3": (760, 760, 1750, 1320),
    "quarter-4": (1570, 880, 2382, 1430),
    "quarter-5": (1600, 1150, 2382, 1684),
}


def export(source: Path, output: Path) -> None:
    output.mkdir(parents=True, exist_ok=True)
    document = pdfium.PdfDocument(str(source))
    full = document[0].render(scale=2).to_pil().convert("RGB")
    full.save(output / "masterplan.webp", "WEBP", quality=88, method=6)
    for name, box in CROPS.items():
        crop = full.crop(box)
        if crop.width < 1600:
            ratio = 1600 / crop.width
            crop = crop.resize((1600, round(crop.height * ratio)), Image.Resampling.LANCZOS)
        crop.save(output / f"{name}.webp", "WEBP", quality=90, method=6)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    export(args.source, args.output)
