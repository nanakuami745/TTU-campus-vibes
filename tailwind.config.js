/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                ttu: {
                    blue: '#0F2A4A',
                    gold: '#F2B705',
                    sky: '#EEF3FB',
                }
            }
        },
    },
    plugins: [],
}
