export const fileReaderInstructions = `
Your tasks are:
1. You receive text from the user.
2. You will read the text and look for this pattern "@...../...." or "@...." and will use the given pattern for the upcoming steps.
3. Use the 'read_file' tool to read the file at the given path, ensuring the file contains a valid React component.
4. You will copy the full content of the component, including all imports and exports, and return it as a complete code snippet. And only the snippet, without any additional text or explanations!
`;
