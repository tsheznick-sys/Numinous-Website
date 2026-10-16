import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const mark = <img src="/media/logo_alpha.webp" alt="" />;

function AmbientCosmos() {
 const reduced = useReducedMotion();
 return <motion.div className="site-cosmos" aria-hidden="true" initial={false} animate={reduced ? {} : { scale: [1, 1.035, 1], rotate: [0, .28, 0] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }} />;
}

export function SiteNav() {
 const reduced = useReducedMotion();
 const location = useLocation();
 const [open, setOpen] = useState(false);
 const menuButton = useRef<HTMLButtonElement>(null);
 const menu = useRef<HTMLElement>(null);
 useEffect(() => { setOpen(false); }, [location.pathname, location.search]);
 useEffect(() => {
  if (!open) return;
  const onKeyDown = (event: KeyboardEvent) => {
   if (event.key === 'Escape') { setOpen(false); menuButton.current?.focus(); }
   if (event.key !== 'Tab' || !menu.current) return;
   const links = Array.from(menu.current.querySelectorAll<HTMLElement>('a[href]'));
   if (!links.length) return;
   if (event.shiftKey && document.activeElement === links[0]) { event.preventDefault(); links[links.length - 1].focus(); }
   else if (!event.shiftKey && document.activeElement === links[links.length - 1]) { event.preventDefault(); links[0].focus(); }
  };
  const onResize = () => { if (window.innerWidth > 800) setOpen(false); };
  document.addEventListener('keydown', onKeyDown);
  window.addEventListener('resize', onResize);
  menu.current?.querySelector<HTMLElement>('a[href]')?.focus();
  return () => { document.removeEventListener('keydown', onKeyDown); window.removeEventListener('resize', onResize); };
 }, [open]);
 return <motion.header className={`site-nav site-nav--minimal liquid-glass-strong${open ? ' site-nav--menu-open' : ''}`} initial={reduced ? false : { y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .7, ease: [.16, 1, .3, 1] }}>
  <Link className="site-nav__brand" to="/" aria-label="Numinous home">{mark}<span><b>Numinous</b><small>The Gates · 02</small></span></Link>
  <nav className="site-nav__desktop-links" aria-label="Primary navigation"><NavLink end to="/gates">The works</NavLink><NavLink to="/gates/signal">The Signal</NavLink><NavLink to="/gates/watcher">The Watcher</NavLink><NavLink to="/returns">The Pact</NavLink></nav>
  <div className="site-nav__actions"><a className="site-nav__support" href="mailto:numinous.support@gmail.com">Human support</a><Link className="site-nav__watcher" to="/gates/signal">Explore Signal <b aria-hidden="true">↗</b></Link></div>
  <button ref={menuButton} type="button" className="site-nav__menu" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-gates-menu" onClick={() => setOpen(!open)}><i /><i /><i /></button>
  <nav ref={menu} id="mobile-gates-menu" className="site-nav__mobile-menu" aria-label="Mobile navigation" hidden={!open} onClick={(event) => { if ((event.target as HTMLElement).closest('a')) setOpen(false); }}>
   <p>Explore Numinous</p>
   <Link to="/gates">All four gates</Link><Link to="/gates/signal">The Signal · Free</Link><Link to="/gates/watcher">The Watcher</Link><Link to="/gates/vault">Wallpaper Vault</Link><Link to="/gates/numinary-agent">The Numinary Agent</Link><Link to="/returns">The Pact & returns</Link>
   <a className="site-nav__mobile-support" href="mailto:numinous.support@gmail.com" onClick={() => setOpen(false)}>Speak to a person ↗</a>
  </nav>
 </motion.header>;
}

export function SiteFooter() {
 return <footer className="site-footer"><div><Link className="site-footer__brand" to="/">{mark}<span>Numinous</span></Link><p>The realms, opened. Cinematic visions of the divine and mythical.</p></div><div className="site-footer__links"><span>The gates</span><Link to="/gates/signal">The Signal</Link><Link to="/gates/watcher">The Watcher</Link><Link to="/gates/vault">Wallpaper Vault</Link><Link to="/gates/numinary-agent">The Numinary Agent</Link></div><div className="site-footer__links"><span>The records</span><Link to="/returns">Returns</Link><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link><a href="mailto:numinous.support@gmail.com">Contact</a></div><div className="site-footer__bar"><small>© 2026 Numinous · All visions reserved</small><small>Witness the impossible ✦ New realms every week</small></div></footer>;
}

export function SiteFrame({ children }: { children: ReactNode }) {
 return <div className="site-frame"><AmbientCosmos /><SiteNav />{children}<SiteFooter /></div>;
}
