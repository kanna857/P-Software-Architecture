import os
import re

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace inline RGB backgrounds
    content = content.replace('rgba(8,15,28', 'rgba(15,0,5')
    content = content.replace('rgba(12,21,38', 'rgba(20,0,5')
    
    # Replace inline RGB brand colors
    content = content.replace('rgba(99,102,241', 'rgba(255,23,56') # indigo
    content = content.replace('rgba(139,92,246', 'rgba(204,0,34') # violet
    content = content.replace('rgba(34,211,238', 'rgba(255,140,154') # cyan

    # Replace HEX colors
    content = content.replace('#818cf8', '#ff4d6d') # indigo-400
    content = content.replace('#6366f1', '#ff1738') # indigo-500
    content = content.replace('#4f46e5', '#cc0022') # indigo-600
    content = content.replace('#c084fc', '#aa001a') # violet
    content = content.replace('#22d3ee', '#ff8c9a') # cyan
    
    # Replace Tailwind color classes
    # We use regex to match word boundaries so we don't accidentally replace part of another word
    content = re.sub(r'\bindigo-', 'red-', content)
    content = re.sub(r'\bcyan-', 'red-', content)
    content = re.sub(r'\bviolet-', 'red-', content)

    # In page.tsx, we have text "AI Software Architect 2.0"
    content = content.replace('bg-slate-900', 'bg-black')
    content = content.replace('bg-slate-950', 'bg-[#0a0003]')
    content = content.replace('border-slate-800', 'border-red-900/30')
    content = content.replace('border-slate-850', 'border-red-900/40')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

dirs = [r'c:\Users\chethana\OneDrive\Desktop\idp\frontend\app', r'c:\Users\chethana\OneDrive\Desktop\idp\frontend\components']

for d in dirs:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                update_file(os.path.join(root, file))

print("Updated TSX files")
