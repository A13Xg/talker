import os
import json

items = []
for f in os.listdir("images"):
    items.append({"image": f"images/{f}", "category": "", "subCategory": ""})
with open("manifest.json", "w", encoding="utf-8") as f:
    json.dump(items, f, indent=2)
