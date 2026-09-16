from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from autocorrect import Speller
import re
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__)
CORS(app)

spell = Speller(lang="en")

PHRASE_RULES = {
    r"\bim\b": "I'm", r"\bi m\b": "I'm",
    r"\bcant\b": "can't", r"\bdont\b": "don't",
    r"\bwont\b": "won't", r"\bdoesnt\b": "doesn't",
    r"\bdidnt\b": "didn't", r"\bisnt\b": "isn't",
    r"\bwasnt\b": "wasn't", r"\bwerent\b": "weren't",
    r"\bshouldnt\b": "shouldn't", r"\bcouldnt\b": "couldn't",
    r"\bwouldnt\b": "wouldn't", r"\bteh\b": "the",
    r"\brecieve\b": "receive", r"\bseperate\b": "separate",
    r"\bdefinately\b": "definitely", r"\boccured\b": "occurred",
    r"\bacommodate\b": "accommodate", r"\benviroment\b": "environment",
    r"\buntill\b": "until", r"\btomorow\b": "tomorrow",
    r"\bthier\b": "their", r"\bwich\b": "which", r"\bwierd\b": "weird",
}

def preserve_case(original, corrected):
    if original.isupper():
        return corrected.upper()
    if original[:1].isupper():
        return corrected[:1].upper() + corrected[1:]
    return corrected

def correct_text(text):
    changes = []
    corrected = text

    for pattern, replacement in PHRASE_RULES.items():
        def repl(match):
            old = match.group(0)
            new = preserve_case(old, replacement)
            if old.lower() != new.lower():
                changes.append({"original": old, "corrected": new, "type": "grammar/spelling"})
            return new
        corrected = re.sub(pattern, repl, corrected, flags=re.IGNORECASE)

    def spell_repl(match):
        word = match.group(0)
        fixed = spell(word)
        fixed = preserve_case(word, fixed)
        if fixed.lower() != word.lower():
            changes.append({"original": word, "corrected": fixed, "type": "spelling"})
        return fixed

    corrected = re.sub(r"\b[A-Za-z]{2,}\b", spell_repl, corrected)
    corrected = re.sub(r"\s+([,.!?])", r"\1", corrected)
    corrected = re.sub(r"([,.!?])([A-Za-z])", r"\1 \2", corrected)
    corrected = re.sub(r"\s{2,}", " ", corrected).strip()

    if corrected and corrected[0].isalpha():
        corrected = corrected[0].upper() + corrected[1:]

    unique = []
    seen = set()
    for item in changes:
        key = (item["original"].lower(), item["corrected"].lower(), item["type"])
        if key not in seen:
            seen.add(key)
            unique.append(item)

    return corrected, unique

@app.get("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")

@app.post("/api/correct")
def api_correct():
    data = request.get_json(silent=True) or {}
    text = str(data.get("text", "")).strip()
    if not text:
        return jsonify({"error": "Please enter some text."}), 400
    corrected, changes = correct_text(text)
    return jsonify({
        "original": text,
        "corrected": corrected,
        "changes": changes,
        "change_count": len(changes)
    })

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
