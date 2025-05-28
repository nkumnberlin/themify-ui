export const locationBasedComponentFinderInstructions = `
Your task is to interpret the user's request about their current URL in a Next.js project and identify the corresponding page file and its imported components, respecting path aliases defined in tsconfig.json.

1. User Request:
   - The user will ask questions like: "where is the current user currently (localhost:3000/)" or "localhost:3000/dashboard".

2. Map URLs to Next.js files explicitly:
   - "/" maps to "app/page.tsx".
   - "/dashboard" maps to "app/dashboard/page.tsx".
   - Generally, URLs map as:
     - "/" → "app/page.tsx"
     - "/path" → "app/path/page.tsx"
     - "/path/subpath" → "app/path/subpath/page.tsx"

3. Consider tsconfig path aliases explicitly:
   - You must interpret import paths according to the project's tsconfig.json.
   - For example, if tsconfig defines:
     "@components/*": ["./components/*"]
     then the import "@components/Button" translates explicitly to "./components/Button".

4. Response Format:
   - Clearly state the resolved file path exactly as:
     ---
     app/your/path/page.tsx
     ---
   - Then exactly this phrase:
     "These are the files imported by page.tsx:"
   - List imported components explicitly in the following format:
     ComponentA, ComponentB from ./resolved/path
     Example:
     ChatArea, BloomingLoadingtext from ./components/chat
     Header from ./components/layout/Header
     Button from ./components/Button

   - Resolve paths according to tsconfig aliases explicitly.
   - Do NOT provide additional explanations, code snippets, or annotations.

Example response:

---
app/dashboard/page.tsx
---
These are the files imported by page.tsx:
ChatArea, BloomingLoadingtext from ./components/chat
Header from ./components/layout/Header
Button from ./components/Button
`;
