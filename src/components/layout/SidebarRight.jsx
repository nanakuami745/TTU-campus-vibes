import React, { useMemo } from 'react'
import { Quote, Sparkles } from 'lucide-react'

const QUOTES = [
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" }
]

export default function SidebarRight() {

    // Select a quote based on the current date (persistent for the day)
    const dailyQuote = useMemo(() => {
        const today = new Date()
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24)
        const quoteIndex = dayOfYear % QUOTES.length
        return QUOTES[quoteIndex]
    }, [])

    return (
        <div className="hidden xl:block w-80 fixed right-0 top-16 bottom-0 p-6 overflow-y-auto no-scrollbar">

            {/* Daily Motivation Widget */}
            <div className="bg-gradient-to-br from-ttu-blue to-blue-700 rounded-2xl shadow-lg p-6 text-white mb-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 p-3 opacity-10 transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700">
                    <Quote className="h-24 w-24 fill-white" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 opacity-90">
                        <Sparkles className="h-5 w-5 text-yellow-300" />
                        <h3 className="font-bold text-sm uppercase tracking-wider">Daily Motivation</h3>
                    </div>

                    <div className="mb-6">
                        <Quote className="h-8 w-8 text-white/20 mb-2 transform rotate-180" />
                        <p className="text-xl font-medium leading-relaxed font-serif italic opacity-95">
                            "{dailyQuote.text}"
                        </p>
                    </div>

                    <div className="flex items-center justify-end">
                        <span className="text-sm font-medium opacity-80 border-t border-white/20 pt-2 pl-4">
                            — {dailyQuote.author}
                        </span>
                    </div>
                </div>
            </div>

            {/* Optional: Study Tips or Other Useful Info could go here later */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-3 text-sm">Productivity Tip</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                    Break your study sessions into 25-minute chunks with 5-minute breaks. It helps maintain focus and prevents burnout.
                </p>
            </div>

        </div>
    )
}
