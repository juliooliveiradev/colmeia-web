from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 2200, 1040
SCALE = 2

CREAM = (251, 246, 234)
PAPER = (255, 250, 240)
HONEY = (196, 120, 10)
INK = (28, 36, 22)
MUTED = (109, 103, 88)
FOREST = (36, 51, 34)
BLUE_FILL = (217, 232, 245)
BLUE_STROKE = (61, 111, 145)


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    path = Path(rf"C:\Windows\Fonts\{name}")
    return ImageFont.truetype(str(path), size * SCALE)


def rounded_rect(draw: ImageDraw.ImageDraw, box, radius, fill, outline, width=2):
    draw.rounded_rectangle(
        [c * SCALE for c in box],
        radius=radius * SCALE,
        fill=fill,
        outline=outline,
        width=width * SCALE,
    )


def text(draw, xy, value, fnt, fill, anchor="lt"):
    x, y = xy
    draw.text((x * SCALE, y * SCALE), value, font=fnt, fill=fill, anchor=anchor)


def arrow_right(draw, x, y):
    size = 9 * SCALE
    px, py = x * SCALE, y * SCALE
    draw.polygon([(px, py - size), (px + size, py), (px, py + size)], fill=FOREST)


def arrow_left(draw, x, y):
    size = 9 * SCALE
    px, py = x * SCALE, y * SCALE
    draw.polygon([(px, py - size), (px - size, py), (px, py + size)], fill=FOREST)


def arrow_down(draw, x, y):
    size = 9 * SCALE
    px, py = x * SCALE, y * SCALE
    draw.polygon([(px - size, py), (px + size, py), (px, py + size)], fill=FOREST)


def line(draw, a, b, width=2):
    draw.line(
        [(a[0] * SCALE, a[1] * SCALE), (b[0] * SCALE, b[1] * SCALE)],
        fill=FOREST,
        width=width * SCALE,
    )


def main() -> None:
    image = Image.new("RGB", (WIDTH, HEIGHT), CREAM)
    draw = ImageDraw.Draw(image)

    title = font("georgia.ttf", 28)
    subtitle = font("arial.ttf", 16)
    box_title = font("arial.ttf", 18)
    box_sub = font("arial.ttf", 13)
    small = font("arial.ttf", 12)
    legend = font("arialbd.ttf", 13) if Path(r"C:\Windows\Fonts\arialbd.ttf").exists() else box_sub

    text(draw, (40, 48), "Colmeia Urbana — Cenário 1", title, INK, "ls")
    text(draw, (40, 78), "Interface + API própria + componente externo", subtitle, MUTED, "ls")

    rounded_rect(draw, (80, 130, 340, 220), 16, PAPER, HONEY)
    text(draw, (210, 168), "Interface (Front-End)", box_title, INK, "mm")
    text(draw, (210, 196), "React + Nginx", box_sub, MUTED, "mm")

    rounded_rect(draw, (430, 130, 690, 220), 16, PAPER, HONEY)
    text(draw, (560, 168), "API (Back-End)", box_title, INK, "mm")
    text(draw, (560, 196), "FastAPI + Swagger", box_sub, MUTED, "mm")

    rounded_rect(draw, (800, 145, 870, 205), 10, BLUE_FILL, BLUE_STROKE)
    text(draw, (835, 175), "SQLite", small, INK, "mm")

    rounded_rect(draw, (80, 360, 340, 450), 16, BLUE_FILL, BLUE_STROKE)
    text(draw, (210, 396), "API Externa", box_title, INK, "mm")
    text(draw, (210, 424), "Open-Meteo Forecast", box_sub, INK, "mm")

    line(draw, (340, 175), (430, 175))
    arrow_right(draw, 421, 175)
    arrow_left(draw, 349, 175)
    text(draw, (385, 158), "REST", small, FOREST, "mm")

    line(draw, (690, 175), (800, 175))
    arrow_right(draw, 791, 175)

    line(draw, (210, 220), (210, 360))
    arrow_down(draw, 210, 351)

    text(draw, (900, 300), "Legenda", legend, INK, "ls")
    line(draw, (900, 320), (940, 320))
    arrow_right(draw, 931, 320)
    text(draw, (950, 324), "comunicação obrigatória", box_sub, INK, "ls")

    rounded_rect(draw, (900, 345, 918, 359), 2, PAPER, HONEY, 1)
    text(draw, (926, 352), "módulo desenvolvido", box_sub, INK, "ls")

    rounded_rect(draw, (900, 375, 918, 389), 2, BLUE_FILL, BLUE_STROKE, 1)
    text(draw, (926, 382), "módulo externo consumido", box_sub, INK, "ls")

    web = Path(r"c:\Users\julio\projeto-mvp-backend\colmeia-web\public\architecture.png")
    api = Path(r"c:\Users\julio\projeto-mvp-backend\colmeia-api\docs\architecture.png")
    root = Path(r"c:\Users\julio\projeto-mvp-backend\architecture.png")
    for path in (web, api, root):
        path.parent.mkdir(parents=True, exist_ok=True)
        image.save(path, "PNG", optimize=True)
        print(path)


if __name__ == "__main__":
    main()
