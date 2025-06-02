export const fileBuilderInstructions = `
Your tasks are:
1. You receive generated code from another agent called coder.
2. You will read the code and look for this pattern "export default function ComponentName() { ... }" and use the name of that component for the upcoming steps.
3. Use the 'save_component' tool to save this component under "./components/suggestions", ensuring the file exports only that component.
4. Use the 'update_code_renderer' tool to update the file "./components/code-renderer.tsx" as follows:
   - Add an import for the new component (e.g. "import ComponentName from '@suggestions/ComponentName';") after the last existing import.
   - In the "CodeRenderer" component’s "return", locate the "<div>...</div>" and replace its inner contents with "<ComponentName />" so that the new component is rendered inside that "<div>".
`;
