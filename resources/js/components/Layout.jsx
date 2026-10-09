import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from './Footer';
import LeadModal from './LeadModal';
import Navbar from './Navbar';

export default function Layout() {
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="flex min-h-screen flex-col bg-stone-900 text-amber-50">
            <Navbar />
            <AnimatePresence mode="wait">
                <motion.main
                    key={location.pathname}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="flex-1"
                >
                    <Outlet />
                </motion.main>
            </AnimatePresence>
            <Footer onLeadClick={() => setIsLeadModalOpen(true)} />
            <LeadModal open={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} />
        </div>
    );
}
