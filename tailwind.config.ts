import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#063B00",
        lagoon: "#266210",
        leaf: "#266210",
        sun: "#ee8d3b",
        sand: "#f5f2e9",
        mist: "#f8faf8"
      },
      fontFamily: { sans: ["Poppins", "Arial", "sans-serif"], display: ["Poppins", "Arial", "sans-serif"] },
      boxShadow: { card: "0 14px 40px rgba(13, 37, 48, .08)", soft: "0 8px 30px rgba(13, 37, 48, .06)" },
      backgroundImage: { "hero-glow": "none" }
    }
  },
  plugins: []
};

export default config;
