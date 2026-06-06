from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT_DIR = Path('public/assets/generated')
OUT_DIR.mkdir(parents=True, exist_ok=True)

PALETTE = {
    'black': (10, 12, 16, 255),
    'panel': (18, 24, 31, 255),
    'panel_light': (35, 45, 56, 255),
    'teal': (0, 255, 209, 255),
    'amber': (255, 184, 0, 255),
    'red': (255, 59, 59, 255),
    'steel': (122, 145, 153, 255),
}


def font(size):
    try:
        return ImageFont.truetype('DejaVuSansMono.ttf', size)
    except OSError:
        return ImageFont.load_default()


def draw_grid(draw, size, step=16, color=(0, 255, 209, 28)):
    width, height = size
    for x in range(0, width, step):
        draw.line((x, 0, x, height), fill=color)
    for y in range(0, height, step):
        draw.line((0, y, width, y), fill=color)


def panel_plate(name='industrial_panel.png', size=(512, 320)):
    img = Image.new('RGBA', size, PALETTE['black'])
    draw = ImageDraw.Draw(img)
    draw_grid(draw, size, 24)
    margin = 18
    draw.rounded_rectangle((margin, margin, size[0]-margin, size[1]-margin), radius=18, fill=PALETTE['panel'], outline=PALETTE['teal'], width=2)
    draw.rectangle((36, 42, size[0]-36, 82), fill=(0, 255, 209, 24), outline=(0, 255, 209, 110))
    draw.text((48, 52), 'FLEET DESIGNER // OPS PANEL', fill=PALETTE['teal'], font=font(18))
    for i in range(6):
        x = 48 + i * 68
        draw.rounded_rectangle((x, 112, x+46, 152), radius=6, fill=PALETTE['panel_light'], outline=PALETTE['amber'])
        draw.line((x+8, 134, x+38, 134), fill=PALETTE['teal'], width=2)
    for y in [190, 220, 250]:
        draw.line((48, y, size[0]-48, y), fill=(122, 145, 153, 130), width=2)
    img.save(OUT_DIR / name)


def schematic_node(name='schematic_node.png', size=(256, 160)):
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle((12, 16, 244, 144), radius=14, fill=PALETTE['panel'], outline=PALETTE['teal'], width=3)
    draw.rectangle((24, 30, 232, 58), fill=(0, 255, 209, 28))
    draw.text((32, 36), 'POWER BUS NODE', fill=PALETTE['teal'], font=font(13))
    for x in [36, 78, 120, 162, 204]:
        draw.ellipse((x-7, 92-7, x+7, 92+7), fill=PALETTE['amber'])
        draw.line((x, 58, x, 92), fill=PALETTE['steel'], width=2)
    img.save(OUT_DIR / name)


def hull_silhouette(name='hull_silhouette.png', size=(512, 256)):
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    hull = [(42, 128), (122, 70), (300, 44), (470, 128), (300, 212), (122, 186)]
    draw.polygon(hull, fill=(30, 39, 48, 255), outline=PALETTE['teal'])
    draw.line((92, 128, 430, 128), fill=(0, 255, 209, 120), width=2)
    for x in [150, 230, 310]:
        draw.rectangle((x, 96, x+44, 160), outline=PALETTE['amber'], width=2)
    draw.text((176, 18), 'FRIGATE HULL BLOCKOUT', fill=PALETTE['teal'], font=font(16))
    img = img.filter(ImageFilter.UnsharpMask(radius=1, percent=140, threshold=3))
    img.save(OUT_DIR / name)


def alert_badge(name='alert_badge.png', size=(256, 256)):
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.polygon([(128, 28), (232, 218), (24, 218)], fill=(70, 12, 16, 245), outline=PALETTE['red'])
    draw.line((128, 82, 128, 154), fill=PALETTE['amber'], width=12)
    draw.ellipse((120, 178, 136, 194), fill=PALETTE['amber'])
    draw.text((68, 220), 'DEFECT RISK', fill=PALETTE['red'], font=font(16))
    img.save(OUT_DIR / name)


def main():
    panel_plate()
    schematic_node()
    hull_silhouette()
    alert_badge()
    print(f'Generated prototype assets in {OUT_DIR}')


if __name__ == '__main__':
    main()
