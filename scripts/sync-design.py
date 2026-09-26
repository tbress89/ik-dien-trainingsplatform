#!/usr/bin/env python3
"""Sync the design files in design/ with the app's exercise data and diagrams.

Usage (from anywhere):

    python3 scripts/sync-design.py

What it updates:
  * design/Pitch.dc.html  – regenerated from the diagrams in codebase/src/components/Pitch.tsx
                            (every variant, with all arrows shown).
  * design/Main.dc.html   – the `var EX = [...]` exercise list, plus the board height so every card fits.
  * design/Builder.dc.html – the `var EX = [...]` library list (with themes and materials).
  * design/canvas.json    – the Main board height; the "Bouwstenen" note and the Nav/Pitch component
                            boards below it move along so they keep the same distance.

The source of truth is codebase/src/data/exercises.ts and Pitch.tsx; nothing in codebase/ is changed.
Running it twice in a row changes nothing the second time.
"""
import ast
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXERCISES_TS = ROOT / 'codebase/src/data/exercises.ts'
PITCH_TSX = ROOT / 'codebase/src/components/Pitch.tsx'
DESIGN = ROOT / 'design'

# ---------------------------------------------------------------------------
# Exercise data
# ---------------------------------------------------------------------------

def read_exercises():
    """Parse the EXERCISES array in exercises.ts into dicts (only the fields the designs use)."""
    src = EXERCISES_TS.read_text()
    body = src[src.index('export const EXERCISES'):src.index('export const EXERCISE_BY_ID')]
    entries = re.split(r'\n  \{\n', body)[1:]

    def field(e, key):
        m = re.search(rf"\n    {key}: '((?:[^'\\]|\\.)*)'", e)
        return m.group(1).replace("\\'", "'") if m else None

    def number(e, key):
        return int(re.search(rf"\n    {key}: (\d+)", e).group(1))

    def strings(e, key):
        return re.findall(r"'([^']+)'", re.search(rf"\n    {key}: \[([^\]]*)\]", e).group(1))

    exercises = []
    for e in entries:
        e = '\n' + e
        exercises.append({
            'id': field(e, 'id'), 'title': field(e, 'title'), 'variant': field(e, 'variant'), 'type': field(e, 'type'),
            'phase': field(e, 'phase'), 'themes': strings(e, 'themes'), 'ages': strings(e, 'ages'),
            'ageLabel': field(e, 'ageLabel'), 'diff': number(e, 'diff'), 'pmin': number(e, 'pmin'),
            'players': field(e, 'players'), 'min': number(e, 'min'),
            'materials': re.findall(r"\{ name: '([^']+)', qty: '([^']+)' \}", e),
        })
    expected = len(re.findall(r"\n    id: '", body))
    if len(exercises) != expected or any(x['id'] is None for x in exercises):
        raise SystemExit(f'Could not parse exercises.ts: found {len(exercises)} of {expected} entries')
    return exercises


def material_names(ex):
    """Mirrors materialNames() in exercises.ts: the short names shown in the builder's material list."""
    names = []
    for name, qty in ex['materials']:
        if re.match(r'^Grote? doel', name) and qty != '1':
            names.append(f'{qty} doelen')
        elif name == 'Doeltjes':
            names.append(f'{qty} doeltjes')
        else:
            names.append(name)
    return names


def js(value):
    """Format a value as a JS literal in the designs' style (single quotes, `, ` separators)."""
    if isinstance(value, list):
        return '[' + ', '.join(js(v) for v in value) + ']'
    if isinstance(value, int):
        return str(value)
    return "'" + value.replace('\\', '\\\\').replace("'", "\\'") + "'"


def js_object(pairs):
    return '  { ' + ', '.join(f'{k}: {js(v)}' for k, v in pairs) + ' }'


def replace_ex_list(html, rows):
    start = html.index('var EX = [\n')
    end = html.index('\n];\n', start)
    return html[:start] + 'var EX = [\n' + ',\n'.join(rows) + html[end:]


# Dashboard layout, measured in the app at 1440px wide: the card grid starts 294px down, a row of
# cards is about 410px including the 24px gap, and the page ends 48px below the grid.
CARDS_PER_ROW = 3
ROW_HEIGHT = 410
LAYOUT_OVERHEAD = 294 - 24 + 48


def main_board_height(card_count):
    rows = math.ceil(card_count / CARDS_PER_ROW)
    return math.ceil((LAYOUT_OVERHEAD + rows * ROW_HEIGHT) / 100) * 100


def sync_exercise_lists(exercises):
    main_path = DESIGN / 'Main.dc.html'
    main = replace_ex_list(main_path.read_text(), [js_object([
        ('id', x['id']), ('title', x['title']), ('variant', x['variant']), ('type', x['type']), ('phase', x['phase']),
        ('themes', x['themes']), ('ages', x['ages']), ('ageLabel', x['ageLabel']), ('diff', x['diff']),
        ('pmin', x['pmin']), ('players', x['players']), ('min', x['min']),
    ]) for x in exercises])

    height = main_board_height(len(exercises))
    board = re.search(r'<div style="width: 1440px; height: (\d+)px; overflow: hidden;', main)
    old_height = int(board.group(1))
    main = main.replace(board.group(0), board.group(0).replace(f'height: {old_height}px', f'height: {height}px'), 1)
    main = main.replace(f'"$preview":{{"width":1440,"height":{old_height}}}', f'"$preview":{{"width":1440,"height":{height}}}', 1)
    main_path.write_text(main)

    builder_path = DESIGN / 'Builder.dc.html'
    builder_path.write_text(replace_ex_list(builder_path.read_text(), [js_object([
        ('id', x['id']), ('title', x['title']), ('variant', x['variant']), ('type', x['type']),
        ('ageLabel', x['ageLabel'].replace(' – U', '–')), ('themes', x['themes']), ('players', x['players']),
        ('min', x['min']), ('mat', material_names(x)),
    ]) for x in exercises]))

    canvas_path = DESIGN / 'canvas.json'
    canvas = json.loads(canvas_path.read_text())
    delta = height - canvas['boards']['Main.dc.html']['h']
    canvas['boards']['Main.dc.html']['h'] = height
    for board_name in ('Nav.dc.html', 'Pitch.dc.html'):
        canvas['boards'][board_name]['y'] += delta
    canvas['notes']['t2']['y'] += delta
    canvas_path.write_text(json.dumps(canvas, indent=2, ensure_ascii=False) + '\n')
    return height


# ---------------------------------------------------------------------------
# Diagrams: Pitch.tsx -> Pitch.dc.html
# ---------------------------------------------------------------------------

PURPLE, ORANGE, INK, ZONE, CONE, WHITE = '#5B2BC4', '#F2A541', '#1A1033', '#C7B6EF', '#A98BE8', '#FFFFFF'


def svg_primitive(name, args):
    """SVG markup for one Pitch.tsx primitive call, matching what the React component renders."""
    if name in ('P', 'O'):
        x, y = args
        fill = PURPLE if name == 'P' else ORANGE
        return f'<circle cx="{x}" cy="{y}" r="8" fill="{fill}" stroke="{WHITE}" stroke-width="2"></circle>'
    if name == 'N':
        x, y = args
        return f'<circle cx="{x}" cy="{y}" r="7" fill="{WHITE}" stroke="{PURPLE}" stroke-width="2.5"></circle>'
    if name == 'Ball':
        x, y = args
        return f'<circle cx="{x}" cy="{y}" r="4" fill="{WHITE}" stroke="{INK}" stroke-width="1.5"></circle>'
    if name == 'Cone':
        x, y = args
        return f'<polygon points="{x},{y} {x + 5},{y + 10} {x - 5},{y + 10}" fill="{CONE}"></polygon>'
    if name == 'Goal':
        x, y, w, h = args
        return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{WHITE}" stroke="{INK}" stroke-width="1.5"></rect>'
    if name == 'Box':
        x, y, w, h = args[:4]
        color = ZONE if len(args) > 4 else WHITE
        width = 1.5 if color == ZONE else 2
        return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="none" stroke="{color}" stroke-width="{width}"></rect>'
    if name == 'Line':
        x1, y1, x2, y2 = args[:4]
        if len(args) > 4 and args[4]:
            return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{ZONE}" stroke-width="1.5" stroke-dasharray="5 4"></line>'
        return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{WHITE}" stroke-width="2"></line>'
    if name == 'Pass':  # the optional 5th argument is the reveal step; the design shows every arrow
        x1, y1, x2, y2 = args[:4]
        return (f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{INK}" stroke-width="1.5" '
                f'stroke-dasharray="4 4" marker-end="url(#arK)"></line>')
    if name == 'Run':
        return (f'<path d="{args[0]}" fill="none" stroke="{PURPLE}" stroke-width="2" stroke-linecap="round" '
                f'marker-end="url(#arP)"></path>')
    raise SystemExit(f'Unknown diagram primitive in Pitch.tsx: {name}()')


def parse_args(text):
    """Parse primitive arguments like `90, 30, 140, 140, ZONE` or `'M150 140 Q190 135 224 114', 2`."""
    text = re.sub(r'\bZONE\b', "'ZONE'", text)
    text = re.sub(r'\btrue\b', 'True', text)
    text = re.sub(r'\bfalse\b', 'False', text)
    return list(ast.literal_eval(f'({text},)'))


CIRCLE_JSX = (r'<circle key="\w+" cx=\{(\d+)\} cy=\{(\d+)\} r=\{(\d+)\} fill="none" stroke=(?:"#fff"|\{(ZONE)\}) '
              r'strokeWidth=\{([\d.]+)\}(?: strokeDasharray="([^"]+)")? />')
CALL = r'(\w+)\(((?:[^()\']|\'[^\']*\')*)\)'


def read_diagrams():
    src = PITCH_TSX.read_text()
    body = src[src.index('const content: Record<Variant, ReactNode[]> = {'):]
    body = body[body.index('{') + 1:body.index('\n  };')]
    diagrams = {}
    for m in re.finditer(r'\n    (\w+): \[(.*?)\n    \],', body, re.S):
        parts = []
        for tok in re.finditer(f'{CIRCLE_JSX}|{CALL}', m.group(2)):
            if tok.group(1):  # a literal <circle> (centre circles, the circle-rondo ring)
                cx, cy, r, zone, width, dash = tok.group(1, 2, 3, 4, 5, 6)
                dash_attr = f' stroke-dasharray="{dash}"' if dash else ''
                parts.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{ZONE if zone else WHITE}" '
                             f'stroke-width="{width}"{dash_attr}></circle>')
            else:
                parts.append(svg_primitive(tok.group(7), parse_args(tok.group(8))))
        diagrams[m.group(1)] = ''.join(parts)
    if not diagrams:
        raise SystemExit('Could not find any diagrams in Pitch.tsx')
    return diagrams


PITCH_BACKGROUND = (
    '<rect x="0" y="0" width="320" height="200" fill="#F1ECFB"></rect><rect x="0" y="0" width="53" height="200" fill="#EBE3F9"></rect>'
    '<rect x="107" y="0" width="53" height="200" fill="#EBE3F9"></rect><rect x="213" y="0" width="53" height="200" fill="#EBE3F9"></rect>'
    '<rect x="10" y="10" width="300" height="180" rx="2" fill="none" stroke="#FFFFFF" stroke-width="2"></rect>'
    '<defs><marker id="arP" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">'
    '<path d="M0 0L10 5L0 10z" fill="#5B2BC4"></path></marker>'
    '<marker id="arK" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">'
    '<path d="M0 0L10 5L0 10z" fill="#1A1033"></path></marker></defs>'
)


def write_pitch_design(diagrams):
    branches = '\n'.join(
        f'<sc-if value="{{{{is.{name}}}}}" hint-placeholder-val="{{{{false}}}}"><svg width="{{{{w}}}}" height="{{{{h}}}}" '
        f'viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" style="display: block" aria-hidden="true">'
        f'{PITCH_BACKGROUND}{content}</svg></sc-if>'
        for name, content in diagrams.items())
    names = list(diagrams)
    props = json.dumps({'variant': {'editor': 'enum', 'options': names, 'default': 'rondo'}, 'w': {'editor': None, 'default': 320},
                        'h': {'editor': None, 'default': 200}, '$preview': {'width': 320, 'height': 200}}, separators=(',', ':'))
    names_js = '[' + ', '.join(f"'{n}'" for n in names) + ']'
    (DESIGN / 'Pitch.dc.html').write_text(f'''<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<title>Tactisch diagram</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<style>body{{margin:0}}</style>
</helmet>
<div style="width: {{{{w}}}}px; height: {{{{h}}}}px; overflow: hidden; background: #F1ECFB">
{branches}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{props}'>
class Component extends DCLogic {{
renderVals() {{
const v = this.props.variant || 'rondo';
const names = {names_js};
const is = {{}};
names.forEach(function (n) {{ is[n] = n === v; }});
return {{ is: is, w: this.props.w || 320, h: this.props.h || 200 }};
}}
}}
</script>
</body>
</html>
''')


def main():
    exercises = read_exercises()
    diagrams = read_diagrams()
    missing = sorted({x['variant'] for x in exercises} - set(diagrams))
    if missing:
        raise SystemExit(f'Exercises use diagrams that Pitch.tsx does not define: {", ".join(missing)}')
    write_pitch_design(diagrams)
    height = sync_exercise_lists(exercises)
    print(f'Synced {len(exercises)} exercises and {len(diagrams)} diagrams into design/ (Main board: {height}px).')


if __name__ == '__main__':
    main()
