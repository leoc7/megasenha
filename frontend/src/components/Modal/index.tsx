import React from 'react';
import { AnimatePresence, AnimateSharedLayout, motion } from 'framer-motion';

import './styles.css';

interface IProps {
    isVisible: boolean;
    width?: string;
}

const wrapperVariants = {
    open: { opacity: 1, display: 'flex' },
    closed: {
        opacity: 0,

        transitionEnd: {
            display: 'none',
        },
    },
};

const containerVariants = {
    open: { opacity: 1, translateY: 0 },
    closed: { opacity: 0, translateY: 200 },
};

const Modal: React.FC<IProps> = ({ children, isVisible, width }) => {
    return (
        <AnimateSharedLayout type='crossfade'>
            <AnimatePresence>
                <motion.div
                    className='modal-wrapper'
                    initial={{ display: 'none' }}
                    animate={isVisible ? 'open' : 'closed'}
                    variants={wrapperVariants}>
                    <motion.div
                        className='modal-container'
                        animate={isVisible ? 'open' : 'closed'}
                        variants={containerVariants}
                        style={{ width: width ? width : '300px' }}>
                        {children}
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </AnimateSharedLayout>
    );
};

export default Modal;
