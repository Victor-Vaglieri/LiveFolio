/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        vscode: {
          bg: "#0d1117",
          sidebar: "#161b22",
          activityBar: "#010409",
          statusBar: "#0d1117",
          tab: "#161b22",
          tabActive: "#0d1117",
          border: "#30363d",
          text: "#c9d1d9",
          highlight: "#58a6ff",
          string: "#a5d6ff",
          comment: "#8b949e",
          success: "#3fb950",
        }
      },
    },
  },
  plugins: [],
};
