import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import type { CSSProperties, PointerEvent, ReactNode } from 'react';
import { useRef } from 'react';

type ChildrenProps = { children: ReactNode; className?: string; delay?: number; id?: string; 'aria-label'?: string; 'aria-labelledby'?: string };

export function MotionSection({ children, className, delay = 0, ...accessibility }: ChildrenProps) {
 const reduced = useReducedMotion();
 return <motion.section className={className} {...accessibility} initial={reduced ? false : { opacity: 0, y: 42, rotateX: 7, transformPerspective: 1200 }} whileInView={reduced ? {} : { opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true, amount: 0.16 }} transition={{ duration: .86, delay, ease: [.16, 1, .3, 1] }}>{children}</motion.section>;
}

export function MotionPage({ children, className }: Omit<ChildrenProps, 'delay'>) {
 const reduced = useReducedMotion();
 return <motion.main id="main-content" tabIndex={-1} className={className} initial={reduced ? false : { opacity: 0, y: 18, rotateX: 2, transformPerspective: 1600 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: .62, ease: [.16, 1, .3, 1] }}>{children}</motion.main>;
}

function useTiltMotion() {
 const reduced = useReducedMotion();
 const rotateX = useSpring(useMotionValue(0), { stiffness: 155, damping: 19, mass: .45 });
 const rotateY = useSpring(useMotionValue(0), { stiffness: 155, damping: 19, mass: .45 });
 const sheenX = useMotionValue('50%'); const sheenY = useMotionValue('50%');
 const reset = () => { rotateX.set(0); rotateY.set(0); sheenX.set('50%'); sheenY.set('50%'); };
 const move = (event: PointerEvent<HTMLElement>) => { if (reduced || event.pointerType === 'touch') return; const rect = event.currentTarget.getBoundingClientRect(); const x = (event.clientX - rect.left) / rect.width; const y = (event.clientY - rect.top) / rect.height; rotateY.set((x - .5) * 8); rotateX.set((.5 - y) * 8); sheenX.set(`${x * 100}%`); sheenY.set(`${y * 100}%`); };
 const style = reduced ? {} : { rotateX, rotateY, transformPerspective: 1200, '--sheen-x': sheenX, '--sheen-y': sheenY } as CSSProperties;
 return { reduced, move, reset, style };
}

export function TiltArticle({ children, className, delay = 0 }: ChildrenProps) {
 const { reduced, move, reset, style } = useTiltMotion();
 return <motion.article className={`${className || ''} motion-tilt`} style={style} initial={reduced ? false : { opacity: 0, y: 32, rotateX: 8 }} whileInView={reduced ? {} : { opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true, amount: .14 }} transition={{ duration: .7, delay, ease: [.16, 1, .3, 1] }} whileHover={reduced ? {} : { z: 20, scale: 1.012 }} onPointerMove={move} onPointerLeave={reset}>{children}</motion.article>;
}

export function TiltFrame({ children, className, delay = 0, ...accessibility }: ChildrenProps) {
 const { reduced, move, reset, style } = useTiltMotion();
 return <motion.div className={`${className || ''} motion-tilt motion-tilt-frame`} {...accessibility} style={style} initial={reduced ? false : { opacity: 0, y: 28, rotateX: 8, rotateY: -5 }} whileInView={reduced ? {} : { opacity: 1, y: 0, rotateX: 0, rotateY: 0 }} viewport={{ once: true, amount: .18 }} transition={{ duration: .78, delay, ease: [.16, 1, .3, 1] }} whileHover={reduced ? {} : { z: 24, scale: 1.012 }} onPointerMove={move} onPointerLeave={reset}>{children}</motion.div>;
}

export function ParallaxLayer({ children, className, delay = 0 }: ChildrenProps) {
 const reduced = useReducedMotion(); const ref = useRef<HTMLDivElement>(null);
 const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
 const y = useTransform(scrollYProgress, [0, .5, 1], reduced ? [0, 0, 0] : [-28, 0, 28]);
 const rotateY = useTransform(scrollYProgress, [0, .5, 1], reduced ? [0, 0, 0] : [-2.4, 0, 2.4]);
 return <motion.div ref={ref} className={className} style={reduced ? {} : { y, rotateY, transformPerspective: 1500 } as unknown as CSSProperties} initial={reduced ? false : { opacity: 0, scale: .97 }} whileInView={reduced ? {} : { opacity: 1, scale: 1 }} viewport={{ once: true, amount: .18 }} transition={{ duration: .82, delay, ease: [.16, 1, .3, 1] }}>{children}</motion.div>;
}

export function Float({ children, className, delay = 0, ...accessibility }: ChildrenProps) {
 const reduced = useReducedMotion();
 return <motion.div className={className} {...accessibility} initial={reduced ? false : { opacity: 0, scale: .96, rotateY: -6, transformPerspective: 1300 }} whileInView={reduced ? {} : { opacity: 1, scale: 1, rotateY: 0 }} animate={reduced ? {} : { y: [0, -8, 0] }} viewport={{ once: true, amount: .22 }} transition={{ opacity: { duration: .72, delay, ease: [.16, 1, .3, 1] }, scale: { duration: .72, delay, ease: [.16, 1, .3, 1] }, rotateY: { duration: .72, delay, ease: [.16, 1, .3, 1] }, y: { duration: 7.5, delay, repeat: Infinity, ease: 'easeInOut' } }}>{children}</motion.div>;
}
