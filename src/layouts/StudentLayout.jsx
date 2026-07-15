import React from 'react'
import Navbar from '../components/layout/Navbar'
import SidebarLeft from '../components/layout/SidebarLeft'
import SidebarRight from '../components/layout/SidebarRight'

export default function StudentLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="max-w-7xl mx-auto flex gap-6 pt-6 px-4">
                <aside className="hidden lg:block w-72 shrink-0">
                    <div className="sticky top-20">
                        <SidebarLeft />
                    </div>
                </aside>

                <main className="flex-1 min-w-0 max-w-2xl mx-auto pb-10">
                    {children}
                </main>

                <SidebarRight />
            </div>
        </div>
    )
}
