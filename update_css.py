import re

css_path = r'c:\Users\chethana\OneDrive\Desktop\idp\frontend\app\globals.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Replace CSS Variables in :root
css = re.sub(r'--bg-deep:\s*#020408;', '--bg-deep: #050002;', css)
css = re.sub(r'--bg-base:\s*#050b14;', '--bg-base: #0a0003;', css)
css = re.sub(r'--bg-surface:\s*#080f1c;', '--bg-surface: #0f0005;', css)
css = re.sub(r'--bg-raised:\s*#0c1526;', '--bg-raised: #140007;', css)
css = re.sub(r'--bg-overlay:\s*rgba\(8, 15, 28, 0\.85\);', '--bg-overlay: rgba(15, 0, 5, 0.85);', css)

css = re.sub(r'--border-subtle:\s*rgba\(99, 102, 241, 0\.08\);', '--border-subtle: rgba(255, 23, 56, 0.15);', css)
css = re.sub(r'--border-dim:\s*rgba\(99, 102, 241, 0\.15\);', '--border-dim: rgba(255, 23, 56, 0.3);', css)
css = re.sub(r'--border-glow:\s*rgba\(99, 102, 241, 0\.4\);', '--border-glow: rgba(255, 23, 56, 0.6);', css)

css = re.sub(r'--indigo-400:\s*#818cf8;', '--indigo-400: #ff4d6d;', css)
css = re.sub(r'--indigo-500:\s*#6366f1;', '--indigo-500: #ff1738;', css)
css = re.sub(r'--indigo-600:\s*#4f46e5;', '--indigo-600: #cc0022;', css)
css = re.sub(r'--violet-500:\s*#8b5cf6;', '--violet-500: #880015;', css)
css = re.sub(r'--cyan-400:\s*#22d3ee;', '--cyan-400: #ff8c9a;', css)
css = re.sub(r'--emerald-400:\s*#34d399;', '--emerald-400: #ff1738;', css)

css = re.sub(r'--glow-indigo:\s*0 0 40px rgba\(99, 102, 241, 0\.25\);', '--glow-indigo: 0 0 40px rgba(255, 23, 56, 0.4);', css)
css = re.sub(r'--glow-cyan:\s*0 0 30px rgba\(34, 211, 238, 0\.2\);', '--glow-cyan: 0 0 30px rgba(255, 23, 56, 0.3);', css)

css = re.sub(r"--font-sans:\s*'Inter', system-ui, -apple-system, sans-serif;", "--font-sans: 'Orbitron', system-ui, -apple-system, sans-serif;", css)

# Add @theme for tailwind overriding at the top of the file
theme_block = """
@theme {
  --color-indigo-300: #ff6b81;
  --color-indigo-400: #ff4d6d;
  --color-indigo-500: #ff1738;
  --color-indigo-600: #cc0022;
  --color-violet-400: #aa001a;
  --color-violet-500: #880015;
  --color-cyan-400: #ff8c9a;
  --color-emerald-400: #ff1738;
}
"""
if "@theme" not in css:
    css = css.replace('@import "tailwindcss";', f'@import "tailwindcss";\n{theme_block}')

# Update Body Background
bg_str = """body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  background:
    url('/spider-login/bg.png') center/cover no-repeat,
    radial-gradient(ellipse at center, rgba(15,0,5,0.7) 0%, rgba(5,0,2,0.95) 100%);
  background-blend-mode: overlay;
  pointer-events: none;
}"""
css = re.sub(r'body::before \{[\s\S]*?\}', bg_str, css)

# Grid drift animation opacity reduction
css = re.sub(r'rgba\(99,102,241,0\.03\)', 'rgba(255,23,56,0.08)', css)

# Glassmorphism
css = re.sub(r'rgba\(8, 15, 28, 0\.7\)', 'rgba(15, 0, 5, 0.7)', css)
css = re.sub(r'rgba\(12, 21, 38, 0\.8\)', 'rgba(20, 0, 5, 0.8)', css)

# Gradients
css = css.replace('#818cf8 0%, #c084fc 50%, #22d3ee 100%', '#ff8c9a 0%, #ff1738 50%, #cc0022 100%')
css = css.replace('#a5b4fc 0%, #818cf8 100%', '#ff8c9a 0%, #ff4d6d 100%')
css = css.replace('rgba(99,102,241,0.5), rgba(139,92,246,0.3), rgba(34,211,238,0.4)', 'rgba(255,23,56,0.6), rgba(204,0,34,0.4), rgba(255,140,154,0.4)')
css = css.replace('rgba(99,102,241,0.08)', 'rgba(255,23,56,0.15)')

# Pulse Ring
css = css.replace('rgba(99,102,241,0.5)', 'rgba(255,23,56,0.6)')

# Badges
css = css.replace('rgba(99,102,241,0.15)', 'rgba(255,23,56,0.15)')
css = css.replace('rgba(99,102,241,0.3)', 'rgba(255,23,56,0.3)')
css = css.replace('#818cf8', '#ff4d6d')

# Button Ripple
css = css.replace('#4f46e5 0%, #6366f1 50%, #818cf8 100%', '#cc0022 0%, #ff1738 50%, #ff4d6d 100%')

# Replace exact RGB occurrences
css = css.replace('99,102,241', '255,23,56')
css = css.replace('129, 140, 248', '255, 77, 109')

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)
print("Updated globals.css")
