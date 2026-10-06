import { useEffect } from 'react';

export default function Modal({ open, title, onClose, children, wide = false }) {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (open) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-900/80 px-4 py-8">
            <div className={`w-full rounded-lg bg-stone-800 p-6 shadow-md ${wide ? 'max-w-2xl' : 'max-w-lg'}`}>
                <div className="mb-4 flex items-start justify-between gap-6">
                    <h2 className="mb-0 text-xl font-semibold">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-amber-50/70 transition-colors hover:text-amber-400"
                        aria-label="Закрыть"
                    >
                        ✕
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}
