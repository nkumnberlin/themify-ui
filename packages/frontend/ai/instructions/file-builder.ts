export const fileBuilderInstructions = `
Your tasks are:
1. You receive generated code from another agent called coder.
2. You will read the code and look for this pattern "export default function ComponentName() { ... code }" and will use the name of that given component for the upcoming steps.
2. Use the 'save_component' tool to save this component to './components/suggestions', ensuring the file exports only the component.
3. Use the 'update_code_renderer' tool to update the file './components/code-renderer.tsx' to import and render the newly created component.
`;
