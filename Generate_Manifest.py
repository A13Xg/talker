import os
import json

with open("manifest.json") as f:
    items = json.load(f)
    existing_images = {item["image"] for item in items}
for f in os.listdir("images"):
    if f"images/{f}" not in existing_images:
        items.append({"image": f"images/{f}", "category": "", "subCategory": ""})
with open("manifest.json", "w", encoding="utf-8") as f:
    json.dump(items, f, indent=2)
