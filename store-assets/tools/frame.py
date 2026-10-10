"""Frames real NurseBound screenshots for the App Store and Google Play.

Input:  store-assets/raw/1-today.png … 7-english.png (screenshots straight from a phone)
Output: store-assets/framed/ios-6.9/   1320 x 2868  (App Store 6.9")
        store-assets/framed/ios-6.5/   1284 x 2778  (App Store 6.5")
        store-assets/framed/android/   1080 x 1920  (Google Play phone)
Usage:  python3 frame.py <raw dir> <out dir> <bold font .ttf> <text font .ttf>
"""
import os, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SHOTS = [
    ("1-today",   "Your path to the bedside abroad",     "U.S., Canada, Australia or New Zealand",  ("#2563eb", "#c026d3")),
    ("2-roadmap", "Your college's rules, step by step",   "Every phase, with official links and fees", ("#0891b2", "#10b981")),
    ("3-exam",    "Know your weak areas",                 "Benchmarks with a category breakdown",    ("#ea580c", "#e11d48")),
    ("4-plan",    "A daily plan to your exam date",       "Smart review brings back every miss",     ("#4f46e5", "#8b5cf6")),
    ("5-ngn",     "Next Gen NCLEX case studies",          "Bowtie, trend, matrix and more",          ("#e11d48", "#f97316")),
    ("6-visa",    "Live visa and migration updates",      "Draws, bulletins and nominee streams",    ("#9333ea", "#db2777")),
    ("7-english", "OET-style writing practice",           "Case notes, letters and model answers",   ("#059669", "#0284c7")),
]
SIZES = {"ios-6.9": (1320, 2868), "ios-6.5": (1284, 2778), "android": (1080, 1920)}

def hexrgb(h): h = h.lstrip("#"); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def gradient(w, h, a, b):
    a, b = hexrgb(a), hexrgb(b)
    g = Image.new("RGB", (w, h)); px = g.load()
    for y in range(h):
        for x in range(0, w, 1):
            t = min(1, max(0, (x / w) * 0.35 + (y / h) * 0.65))
            px[x, y] = tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
    return g

def wrap(draw, text, font, maxw):
    words, lines, cur = text.split(), [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if draw.textlength(test, font=font) <= maxw: cur = test
        else: lines.append(cur); cur = w
    lines.append(cur); return lines

def rounded(img, r):
    m = Image.new("L", img.size, 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, img.size[0] - 1, img.size[1] - 1], r, fill=255)
    out = img.convert("RGBA"); out.putalpha(m); return out

def frame(src, size, title, sub, colors, bold, text, crop_top=0.0):
    W, H = size; s = W / 1320
    bg = gradient(W // 4, H // 4, *colors).resize((W, H), Image.BICUBIC).convert("RGBA")
    d = ImageDraw.Draw(bg)
    tall = H / W > 2  # iPhone shape: more room for the headline
    fT = ImageFont.truetype(bold, int((112 if tall else 92) * s)); fS = ImageFont.truetype(text, int((50 if tall else 44) * s))
    y = int((150 if tall else 90) * s)
    for line in wrap(d, title, fT, W - int(160 * s)):
        tw = d.textlength(line, font=fT); d.text(((W - tw) / 2, y), line, font=fT, fill="white"); y += int(fT.size * 1.12)
    y += int(18 * s)
    for line in wrap(d, sub, fS, W - int(200 * s)):
        tw = d.textlength(line, font=fS); d.text(((W - tw) / 2, y), line, font=fS, fill=(255, 255, 255, 225)); y += int(fS.size * 1.3)
    top = y + int((70 if tall else 50) * s)
    shot = Image.open(src).convert("RGB")
    if crop_top: shot = shot.crop((0, int(shot.height * crop_top), shot.width, shot.height))  # drop the status bar (time, battery, mute icon)
    # phone screenshot, scaled to fit what's left, bleeding off the bottom like a phone rising into view
    avail_h = H - top + int(260 * s); sw = int(W * (0.80 if tall else 0.66))
    sh = int(shot.height * sw / shot.width)
    if sh > avail_h * 1.6: sh = int(avail_h * 1.6); sw = int(shot.width * sh / shot.height)
    up = sw > shot.width
    shot = shot.resize((sw, sh), Image.LANCZOS)
    if up: shot = shot.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))  # keep text crisp when enlarging
    bezel = int(22 * s); r = int(96 * s)
    body = Image.new("RGBA", (sw + 2 * bezel, sh + 2 * bezel), (0, 0, 0, 0))
    ImageDraw.Draw(body).rounded_rectangle([0, 0, body.width - 1, body.height - 1], r + bezel, fill=(17, 24, 39, 255), outline=(255, 255, 255, 70), width=max(2, int(3 * s)))
    body.alpha_composite(rounded(shot, r), (bezel, bezel))
    shadow = Image.new("RGBA", bg.size, (0, 0, 0, 0)); x = (W - body.width) // 2
    ImageDraw.Draw(shadow).rounded_rectangle([x, top + int(30 * s), x + body.width, top + body.height], r + bezel, fill=(0, 0, 0, 110))
    bg.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(int(40 * s))))
    bg.alpha_composite(body, (x, top))
    return bg.convert("RGB")

def main(raw, out, bold, text, manifest=None):
    """manifest (optional JSON): [{"src": "file.png", "name": "1-today", "title": "...", "sub": "...", "colors": ["#hex", "#hex"], "crop_top": 0.065}]"""
    if manifest:
        import json
        shots = [(m["name"], m["title"], m["sub"], tuple(m["colors"]), m.get("src"), m.get("crop_top", 0)) for m in json.load(open(manifest))]
    else:
        shots = [(n, t, su, c, None, 0) for n, t, su, c in SHOTS]
    done = 0
    for name, title, sub, colors, file, crop in shots:
        cands = [os.path.join(raw, file)] if file else [os.path.join(raw, name + e) for e in (".png", ".PNG", ".jpg", ".jpeg", ".JPG")]
        src = next((c for c in cands if os.path.exists(c)), None)
        if not src: print("missing", name); continue
        for k, size in SIZES.items():
            os.makedirs(os.path.join(out, k), exist_ok=True)
            frame(src, size, title, sub, colors, bold, text, crop).save(os.path.join(out, k, name + ".png"), optimize=True)
        done += 1; print("framed", name)
    print(done, "of", len(shots))

if __name__ == "__main__": main(*sys.argv[1:6])
