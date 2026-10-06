import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import LeadModal from './LeadModal';
import Navbar from './Navbar';

export default function Layout() {
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

    return (
        <div className="flex min-h-screen flex-col bg-stone-900 text-amber-50">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer onLeadClick={() => setIsLeadModalOpen(true)} />
            <LeadModal open={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} />
        </div>
    );
}
