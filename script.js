
const sourceLang = document.getElementById("sourceLang");
const targetLang = document.getElementById("targetLang");
const sourceText = document.getElementById("sourceText");
const resultText = document.getElementById("resultText");
const translateBtn = document.getElementById("translateBtn");
const swapBtn = document.getElementById("swapBtn");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const charCount = document.getElementById("charCount");
const statusText = document.getElementById("status");
const resultLanguage = document.getElementById("resultLanguage");

const languageNames = {
    auto: "Detect language",
    en: "English",
    ny: "Chichewa",
    fr: "French",
    es: "Spanish",
    pt: "Portuguese",
    de: "German",
    it: "Italian",
    sw: "Swahili",
    ar: "Arabic",
    hi: "Hindi",
    "zh-CN": "Chinese",
    ja: "Japanese",
    ru: "Russian",
    af: "Afrikaans"
};

function updateCharacterCount() {
    charCount.textContent = `${sourceText.value.length} / 5000`;
}

function updateTargetLabel() {
    resultLanguage.textContent =
        languageNames[targetLang.value] || targetLang.value;
}

sourceText.addEventListener("input", updateCharacterCount);
targetLang.addEventListener("change", updateTargetLabel);

async function translateText() {
    const text = sourceText.value.trim();

    if (!text) {
        statusText.textContent = "Please enter some text.";
        sourceText.focus();
        return;
    }

    if (
        sourceLang.value !== "auto" &&
        sourceLang.value === targetLang.value
    ) {
        statusText.textContent =
            "Choose two different languages, or use detection.";
        return;
    }

    translateBtn.disabled = true;
    translateBtn.textContent = "Translating...";
    statusText.textContent = "Connecting to translation service...";

    try {
        const params = new URLSearchParams({
            client: "gtx",
            sl: sourceLang.value,
            tl: targetLang.value,
            dt: "t",
            q: text
        });

        const response = await fetch(
            `https://translate.googleapis.com/translate_a/single?${params}`
        );

        if (!response.ok) {
            throw new Error("Translation service is unavailable.");
        }

        const data = await response.json();

        if (!Array.isArray(data[0])) {
            throw new Error("Unexpected translation response.");
        }

        const translation = data[0]
            .map(segment => segment[0] || "")
            .join("");

        if (!translation) {
            throw new Error("No translation was returned.");
        }

        resultText.textContent = translation;
        resultText.classList.remove("placeholder");
        statusText.textContent = "Translation completed";

        if (sourceLang.value === "auto" && data[2]) {
            const detected = data[2];
            statusText.textContent =
                `Detected: ${languageNames[detected] || detected}`;
        }
    } catch (error) {
        statusText.textContent = "Translation failed";
        resultText.textContent =
            error.message +
            " Check your internet connection and try again.";
        resultText.classList.add("placeholder");
    } finally {
        translateBtn.disabled = false;
        translateBtn.innerHTML = "<span>✦</span> Translate Text";
    }
}

translateBtn.addEventListener("click", translateText);

swapBtn.addEventListener("click", () => {
    if (sourceLang.value === "auto") {
        statusText.textContent =
            "Translate once first to identify the source language.";
        return;
    }

    const oldSource = sourceLang.value;
    sourceLang.value = targetLang.value;
    targetLang.value = oldSource;

    const oldText = sourceText.value;
    sourceText.value =
        resultText.classList.contains("placeholder")
            ? ""
            : resultText.textContent;

    resultText.textContent = oldText || "Your translation will appear here...";
    resultText.classList.toggle("placeholder", !oldText);

    updateCharacterCount();
    updateTargetLabel();
    statusText.textContent = "Languages swapped";
});

clearBtn.addEventListener("click", () => {
    sourceText.value = "";
    resultText.textContent = "Your translation will appear here...";
    resultText.classList.add("placeholder");
    statusText.textContent = "Ready to translate";
    updateCharacterCount();
});

copyBtn.addEventListener("click", async () => {
    if (resultText.classList.contains("placeholder")) {
        statusText.textContent = "There is no translation to copy.";
        return;
    }

    try {
        await navigator.clipboard.writeText(resultText.textContent);
        statusText.textContent = "Translation copied!";
    } catch {
        statusText.textContent =
            "Copy unavailable. Select and copy the text manually.";
    }
});

function speakText(text, language) {
    if (!text.trim()) {
        statusText.textContent = "There is no text to read.";
        return;
    }

    if (!("speechSynthesis" in window)) {
        statusText.textContent = "Text-to-speech is not supported.";
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "auto" ? "en" : language;
    window.speechSynthesis.speak(utterance);
}

document.getElementById("speakSourceBtn").addEventListener("click", () => {
    speakText(sourceText.value, sourceLang.value);
});

document.getElementById("speakResultBtn").addEventListener("click", () => {
    if (!resultText.classList.contains("placeholder")) {
        speakText(resultText.textContent, targetLang.value);
    }
});

updateCharacterCount();
updateTargetLabel();
