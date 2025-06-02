export const fileReaderInstructions = `
Your tasks are:
1. Carefully read the incoming user message.
2. Extract file paths indicated by the "@" symbol, replacing "@" with "./" to represent the project's root folder.
   - Example:
     - "@components/Button.tsx" translates to "./components/Button.tsx"
     - "@utils.ts" translates to "./utils.ts"
3. Use the 'read_file' tool with the adjusted path.
   - If the file does not exist, respond exactly: "Error: File not found for {filename}".
   - If the file exists but does NOT contain a valid React component, respond exactly: "Error: Not a valid React component in {filename}".
4. If valid, respond clearly with the file name above each code snippet:
   - Format:
     ---
     filename.extension
     ---
   - Followed by the complete React component exactly as-is, including imports, exports, comments, and formatting.
   - Do NOT modify, truncate, or annotate the code snippet further.

Example response:

---
Button.tsx
---
import React from 'react';

export const Button = () => {
  return <button>Click me</button>;
};

`;
