import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

export const CTABanner = () => {
    return (
        <section className="w-full bg-accent">
            <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-[72px]">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-8 text-center lg:text-left">

                    {/* Left Side */}
                    <motion.div
                        className="flex flex-col"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true, amount: 0.5 }}
                    >
                        <span className="text-[11px] text-black/50 uppercase tracking-[0.2em] font-[700] mb-2">
                            GAMEMETER
                        </span>
                        <h2 className="font-syne text-[36px] lg:text-[52px] font-[900] text-black leading-none mb-3">
                            Stop Scrolling. Start Playing.
                        </h2>
                        <p className="text-[16px] text-black/60 font-[500] max-w-xl">
                            Join our growing community and share your verdicts with players who care.
                        </p>
                    </motion.div>

                    {/* Right Side */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <button className="flex items-center gap-2 bg-black text-accent font-syne font-[800] text-[16px] px-[40px] py-[18px] rounded-[8px] hover:bg-[#1a1a1a] hover:-translate-y-[2px] transition-all whitespace-nowrap shadow-xl">
                            Get Started <FiArrowRight size={18} aria-hidden="true" />
                        </button>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};
