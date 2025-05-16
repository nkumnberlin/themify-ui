import { globalIgnores } from "eslint/config";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import eslintConfigPrettier from "eslint-config-prettier";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  eslintPluginUnicorn.configs.recommended,
  eslintConfigPrettier,
  globalIgnores([
    "node_modules",
    "dist",
    "build",
    "coverage",
    "out",
    "lib",
    "es5",
    "es6",
    "esnext",
    ".turbo",
    ".next",
    "tailwind.config.js",
    "*.d.ts",
  ]),
  {
    rules: {
      "unicorn/better-regex": "warn",
      "react/react-in-jsx-scope": "off",
    },
  },
];

export default eslintConfig;
