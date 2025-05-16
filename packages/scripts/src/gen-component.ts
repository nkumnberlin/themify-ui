
import { config } from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

function formatTokens(tokens: Record<string, any>, prefix = ''): string {
    let result = '';
    for (const key in tokens) {
        const value = tokens[key];
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
            result += formatTokens(value, newPrefix);
        } else {
            result += `${newPrefix}: ${value};\n`;
        }
    }
    return result;
}


// 1. Load environment variables (expect OPENROUTER_API_KEY in .env)
config();

const template = `
You are an expert React engineer.
Given the following CSS-token mapping:
{{tokens}}

Generate a React functional component in TypeScript that:
- Imports and uses Headless UI’s Button element.
- Applies each token in its className.
- Renders a button with the text "{{label}}".
- Component should be designed following the users request "{{request}}".
- Returns only the TSX code (no explanations).
`;

const prompt = new PromptTemplate({
    template,
            inputVariables: ["tokens", "label", "request"],
});

console.log( process.env.OPENROUTER_API_KEY);

const llm = new ChatOpenAI({

    model: "deepseek/deepseek-chat-v3-0324:free",
    apiKey: process.env.OPENROUTER_API_KEY,
    configuration: {
    baseURL: "https://openrouter.ai/api/v1",
    }
});

export async function generateHeadlessUIButton({tokens, label, request}: {tokens:any, label:string, request:string}) {
    const chain = prompt.pipe(llm);
    const _tokens = formatTokens(tokens);

    const response = await chain.invoke({
        tokens: _tokens,
        label,
        request
    });

    console.log(response?.content);
    return response?.content;

}

