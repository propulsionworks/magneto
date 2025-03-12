import propulsionworks, { config } from "@propulsionworks/eslint-config";

export default config(
  {
    ignores: ["out/", "coverage/"],
  },
  {
    files: ["src/**/*.js", "src/**/*.ts"],
    extends: [propulsionworks.configs["js"]],
  },
  {
    files: ["src/**/*.ts"],
    extends: [propulsionworks.configs["ts"]],
  },
  {
    files: ["src/**/*.test.*"],
    extends: [propulsionworks.configs["ts-relaxed-any"]],

    rules: {
      // `describe` and `it` return promises
      "@typescript-eslint/no-floating-promises": [
        "warn",
        {
          allowForKnownSafeCalls: [
            { from: "package", name: ["describe", "it"], package: "node:test" },
          ],
        },
      ],

      // easier for testing
      "no-constructor-return": "off",
      "@typescript-eslint/explicit-member-accessibility": "off",
      "@typescript-eslint/no-extraneous-class": "off",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/unbound-method": "off",
      "n/no-unsupported-features/node-builtins": "off",
      "unicorn/no-abusive-eslint-disable": "off",
      "unicorn/no-await-expression-member": "off",
    },
  }
);
