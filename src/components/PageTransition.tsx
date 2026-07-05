import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router';

export default function PageTransition() {
    const location = useLocation();
    const outlet = useOutlet();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
                {outlet}
            </motion.div>
        </AnimatePresence>
    );
}