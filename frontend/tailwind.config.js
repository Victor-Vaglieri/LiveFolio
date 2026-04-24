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
          bg: "var(--background)",
          sidebar: "var(--surface)",
          activityBar: "var(--surface)",
          statusBar: "var(--surface)",
          tab: "var(--surface)",
          tabActive: "var(--background)",
          border: "var(--border)",
          text: "var(--foreground)",
          highlight: "var(--accent)",
          comment: "var(--text-muted)",
          selection: "var(--selection)",
          hover: "var(--surface-hover)",
          success: "var(--success)",
          string: "var(--string)",
          icon: {
            json: "var(--icon-json)",
            md: "var(--icon-md)",
            log: "var(--icon-log)",
            code: "var(--icon-code)",
            stats: "var(--icon-stats)",
            goal: "var(--icon-goal)",
          }
        }
      },
    },
  },
  plugins: [],
};
