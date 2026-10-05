"""Generate the self-contained illustrative Reply2Lead UI demo video."""

from __future__ import annotations

import html
import pathlib
import shutil
import subprocess
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "product-demo.mp4"
POSTER = ROOT / "assets" / "product-demo-poster.png"
FPS = 15
DURATION = 11


def text(x, y, value, size=24, color="#213126", weight=400, anchor="start"):
    return f'<text x="{x}" y="{y}" font-family="Arial, sans-serif" font-size="{size}" font-weight="{weight}" fill="{color}" text-anchor="{anchor}">{html.escape(value)}</text>'


def rect(x, y, w, h, fill, radius=0, stroke="none", opacity=1):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke}" opacity="{opacity}" />'


def reveal(t, at):
    return max(0, min(1, (t - at) / .38))


def bubble(x, y, width, lines, kind, alpha):
    if not alpha:
        return ""
    height = 45 + len(lines) * 31
    fill = "#dcf3e5" if kind == "customer" else "#f3f6f2"
    label = "CUSTOMER" if kind == "customer" else "RAY AI"
    output = [f'<g opacity="{alpha:.3f}" transform="translate(0,{(1-alpha)*15:.1f})">', rect(x, y, width, height, fill, 18), text(x+23, y+29, label, 13, "#668471", 700)]
    for index, line in enumerate(lines):
        output.append(text(x+23, y+62+index*31, line, 22, "#23382a", 400))
    output.append("</g>")
    return "".join(output)


def frame(t):
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">',
             '<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#e4eee7"/><stop offset="1" stop-color="#d5e6da"/></linearGradient><linearGradient id="product" x2="1" y2="1"><stop stop-color="#3e5749"/><stop offset="1" stop-color="#15291e"/></linearGradient></defs>',
             rect(0, 0, 1280, 720, "url(#bg)"),
             rect(48, 39, 1184, 642, "#ffffff", 27),
             rect(48, 39, 1184, 70, "#fbfcfa", 27),
             rect(48, 96, 1184, 13, "#fbfcfa"),
             text(81, 85, "reply2lead", 27, "#213126", 700),
             rect(1120, 64, 81, 24, "#e3f5e8", 12),
             text(1160, 81, "DEMO", 12, "#257b49", 700, "middle"),
             rect(532, 109, 1, 572, "#e8eee8"),
             text(84, 156, "SAMPLE PRODUCT", 13, "#819186", 700),
             rect(84, 180, 413, 314, "url(#product)", 19),
             '<ellipse cx="290" cy="417" rx="126" ry="18" fill="#0e2216" opacity=".45"/>',
             rect(182, 286, 216, 101, "#cbd6cf", 23),
             rect(194, 297, 190, 73, "#f3f4ef", 17),
             '<circle cx="290" cy="335" r="27" fill="#acc7b5"/><circle cx="290" cy="335" r="14" fill="#658678"/>',
             rect(220, 381, 140, 14, "#788f82", 7),
             text(84, 542, "Nova Mini projector", 30, "#203126", 700),
             text(84, 578, "In stock  ·  Express delivery", 18, "#7d8a80"),
             text(84, 640, "Illustrative demo · Sample product and price", 15, "#9da9a0"),
             rect(563, 131, 628, 69, "#f9fbf9", 13),
             '<circle cx="602" cy="165" r="21" fill="#33c976"/>',
             text(602, 173, "R", 22, "#ffffff", 700, "middle"),
             text(638, 160, "Ray AI", 19, "#24372a", 700),
             text(638, 181, "Instagram DM", 14, "#849289"),
             '<circle cx="1156" cy="164" r="6" fill="#37c875"/>',
             bubble(751, 224, 407, ["Hi! Is the Nova Mini", "available? What's the price?"], "customer", reveal(t, .35)),
             bubble(581, 363, 385, ["Yes, it's in stock for $149.", "Want the checkout link?"], "ray", reveal(t, 2.65)),
             bubble(818, 490, 340, ["Can it arrive by Friday?"], "customer", reveal(t, 5.0))]
    if 1.25 <= t < 2.52 or 5.75 <= t < 7.0:
        ty = 366 if t < 3 else 588
        parts.extend([rect(581, ty, 76, 42, "#f3f6f2", 18), text(619, ty+28, "· · ·", 25, "#819a87", 700, "middle")])
    if t >= 7.0:
        alpha = reveal(t, 7.0)
        parts.append(bubble(581, 582, 555, ["Express delivery can get it there by Friday."], "ray", alpha))
    if t >= 8.7:
        alpha = reveal(t, 8.7)
        parts.append(f'<g opacity="{alpha:.3f}">{rect(565, 626, 623, 43, "#e4f5e9", 9)}{text(585, 654, "BUYING INTENT SPOTTED  ·  READY TO FOLLOW UP", 15, "#267b47", 700)}</g>')
    parts.extend([rect(48, 677, 1184, 4, "#edf3ee"), rect(48, 677, int(1184*t/DURATION), 4, "#38ca76"), "</svg>"])
    return "".join(parts)


def main():
    OUTPUT.parent.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="reply2lead-demo-") as temp:
        directory = pathlib.Path(temp)
        for n in range(FPS * DURATION):
            svg = directory / f"frame-{n:04d}.svg"
            png = directory / f"frame-{n:04d}.png"
            svg.write_text(frame(n / FPS))
            subprocess.run(["rsvg-convert", "-o", str(png), str(svg)], check=True, stdout=subprocess.DEVNULL)
            svg.unlink()
        shutil.copyfile(directory / "frame-0000.png", POSTER)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", str(directory / "frame-%04d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "24", "-movflags", "+faststart", str(OUTPUT)], check=True)
    print(OUTPUT)


if __name__ == "__main__":
    main()
