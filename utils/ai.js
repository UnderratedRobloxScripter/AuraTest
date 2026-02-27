
async function generateAIResponse(messages, modelMode = "Auto") {
    try {
        const response = await fetch("https://auraxz.vercel.app/api/groq", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages, modelMode })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        return data.result;

    } catch (error) {
        console.error("Primary AI path failed:", error.message);

        try {
            return await callInternalAgent(messages, modelMode);
        } catch (fallbackError) {
            return `System Error: Unable to generate response (${fallbackError.message || "Service Unavailable"})`;
        }
    }
}

async function callInternalAgent(messages, modelMode) {
    const recentMessages = messages.slice(-10);
    const lastMsg = recentMessages[recentMessages.length - 1];
    const lastContent = lastMsg.content || "";
    const hasImages = lastMsg.images && lastMsg.images.length > 0;

    const chatHistoryStr = recentMessages.map(msg =>
        `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content || "[Multimodal Content]"}`
    ).join("\n");

    const systemPrompt = `${getSystemPrompt(modelMode, hasImages)}\n\nContext:\n${chatHistoryStr}`;

    if (typeof invokeAIAgent !== "undefined") {
        const resp = await invokeAIAgent(systemPrompt, lastContent);
        if (resp) return resp;
    }

    return mockResponse(lastContent, modelMode);
}

function getSystemPrompt(modelMode, hasImages = false) {
    let prompt = `You are Aura, an advanced AI assistant. Mode: ${modelMode}.`;
    if (hasImages) prompt += ` You can analyze images and extract visual details.`;

    const instructions = {
        Thinking: "Provide step-by-step analytical reasoning.",
        Fast: "Provide concise and direct responses.",
        Auto: "Balance personality, humor, and technical accuracy."
    };

    prompt += `\n${instructions[modelMode] || instructions.Auto}`;
    return prompt;
}

function mockResponse(input, mode) {
    const responses = [
        `[${mode}] Offline mode active.`,
        "AI processing temporarily unavailable.",
        "System busy; try again shortly."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

export { generateAIResponse };