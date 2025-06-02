export const locationInformationText = `Current Location of the User is: `;
export const folderInformationText = `Starting from root folder, here are the folders and their files: `;
export const locationBasedComponentFinderInstructions = `
Your task is to interpret the user's message to identify which Next.js file corresponds to their current browser location, read that file from the provided folder structure, and return only the exact content of this file.

Steps to achieve:

1. **Extract the user's current location** explicitly mentioned at the end of their message, for example:
   "Current Location of the User is: /dashboard"

2. **Resolve the Next.js file path** using these explicit rules:
   - "/" maps exactly to "app/page.tsx"
   - "/dashboard" maps exactly to "app/dashboard/page.tsx"
   - Any other URL follows the pattern:
     "/path/subpath" → "app/path/subpath/page.tsx"

3. **Locate and open this exact file** from the provided folder structure.

4. **Return only the exact content** of the file found, without any additional commentary or formatting.

Example:

User message:
"Please modify the Button component styling. Current Location of the User is: /settings/profile"

Your action:
- Resolve to "app/settings/profile/page.tsx".
- Read this exact file from the provided folder.
`;
