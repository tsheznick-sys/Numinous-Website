import { useEffect, useLayoutEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { legalRecords, productByGate, productById, productBySlug, products } from './data';
import { SiteFrame } from './components/Layout';
import { CollectionPage } from './pages/CollectionPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { Home } from './pages/Home';
import { AccessPage } from './pages/AccessPage';
import { LegalPage } from './pages/LegalPage';
import { ProductPage } from './pages/ProductPage';

function RouteMeta() {
 const location = useLocation();
 useEffect(() => {
  const path = location.pathname; const query = new URLSearchParams(location.search); const segments = path.split('/').filter(Boolean);
  let title = 'Numinous 2.0 — Witness the Impossible'; let description = 'Cinematic visions of the divine and mythical. Four gates into a living record.';
  if (path === '/gates' || path === '/collections/all') { title = 'The Four Gates — Numinous'; description = 'Enter The Signal, The Watcher, Wallpaper Vault, or The Numinary Agent.'; }
  if (path.startsWith('/gates/')) {
   const product = productByGate(segments[1]);
   if (segments[1] === 'confirmed') { const offer = query.get('offer'); const returned = products.find((p) => p.id === offer) || (offer === 'herald' ? productById('agent') : null); title = returned ? `${returned.title} return status — Numinous` : 'Return status — Numinous'; description = returned ? `Browser return and Whop verification guidance for ${returned.title}.` : 'Check your Whop receipt and account to verify an order.'; }
   else if (segments[2] === 'enter') { title = `Enter ${product.title} — Numinous`; description = `Review ${product.title} before secure checkout through Whop.`; }
   else { title = `${product.title} — Numinous`; description = product.longDescription; }
  }
  if (path.startsWith('/products/')) { const product = productBySlug(segments[1]); title = `${product.title} — Numinous`; description = product.longDescription; }
  if (path === '/checkout') { const product = productById(query.get('offer') || 'signal'); title = `Enter ${product.title} — Numinous`; description = `Review ${product.title} before secure checkout through Whop.`; }
  if (segments.length === 1 && legalRecords[segments[0]]) { const record = legalRecords[segments[0]]; title = `${record.title} — Numinous`; description = record.introduction; }
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
 }, [location.pathname, location.search]);
 return null;
}

function RouteScroll() {
 const location = useLocation();
 const firstRoute = useRef(true);
 useLayoutEffect(() => {
  // In-page anchors keep their native behavior; route changes begin at the new page's start.
  if (location.hash) return;
  const initial = firstRoute.current;
  firstRoute.current = false;
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, 0);
  root.style.scrollBehavior = previous;
  if (!initial) document.getElementById('main-content')?.focus({ preventScroll: true });
 }, [location.pathname, location.search, location.hash]);
 return null;
}

function LegacyProductRedirect() { const { slug } = useParams(); return products.some((p) => p.slug === slug) ? <Navigate to={`/gates/${productBySlug(slug).gate}`} replace /> : <Navigate to="/gates" replace />; }
const legacyPlans: Record<string, string> = {
 ch_wYXFulML0v6LIoJ: 'signal', plan_PQnMYNixMTjRQ: 'watcher',
 plan_Imfk0oedwYn7v: 'watcher', plan_Aew5DdipP3fKY: 'vault',
 plan_hIKLCR4hGiv9B: 'agent',
};
export function legacyOffer(value: string | null) {
 if (!value) return null;
 const plan = value.match(/(?:^|\/)checkout\/([^/?#]+)/)?.[1] || value;
 const candidate = legacyPlans[plan] || (plan === 'herald' ? 'agent' : plan);
 return products.find((p) => p.id === candidate || p.gate === candidate) || null;
}
function LegacyCheckoutRedirect() {
 const [params] = useSearchParams();
 const product = legacyOffer(params.get('offer') || params.get('from') || params.get('plan'));
 return <Navigate to={!product ? '/gates' : `/gates/${product.gate}/enter`} replace />;
}
function LegacyPlanRedirect() { const { planId } = useParams(); const product = legacyOffer(planId || ''); return <Navigate to={!product ? '/gates' : `/gates/${product.gate}/enter`} replace />; }
function ValidProductRoute({ checkout = false }: { checkout?: boolean }) { const { gate } = useParams(); if (!products.some((p) => p.gate === gate)) return <Navigate to="/gates" replace />; return checkout ? <CheckoutPage /> : <ProductPage />; }
function ValidLegalRoute() { const { record } = useParams(); return record && legalRecords[record] ? <LegalPage /> : <Navigate to="/gates" replace />; }
function LegacyConfirmationRedirect() {
 const [params] = useSearchParams();
 const product = legacyOffer(params.get('offer') || params.get('gate') || params.get('work') || params.get('plan'));
 const target = new URLSearchParams({ offer: product?.id || 'unknown' });
 const status = params.get('status');
 if (status) target.set('status', status);
 return <Navigate to={`/gates/confirmed?${target}`} replace />;
}

export default function App() {
 return <SiteFrame><RouteMeta /><RouteScroll /><Routes>
  <Route path="/" element={<Home />} />
  <Route path="/gates" element={<CollectionPage />} />
  <Route path="/gates/herald" element={<Navigate to="/gates/numinary-agent" replace />} />
  <Route path="/gates/herald/enter" element={<Navigate to="/gates/numinary-agent/enter" replace />} />
  <Route path="/gates/confirmed" element={<ConfirmationPage />} />
  <Route path="/gates/:gate/enter" element={<ValidProductRoute checkout />} />
  <Route path="/gates/:gate" element={<ValidProductRoute />} />
  <Route path="/collections/all" element={<Navigate to="/gates" replace />} />
  <Route path="/products/herald-app" element={<Navigate to="/gates/numinary-agent" replace />} />
  <Route path="/products/:slug" element={<LegacyProductRedirect />} />
  <Route path="/checkout" element={<LegacyCheckoutRedirect />} />
  <Route path="/checkout/:planId" element={<LegacyPlanRedirect />} />
  <Route path="/welcome" element={<LegacyConfirmationRedirect />} />
  <Route path="/order-complete" element={<LegacyConfirmationRedirect />} />
  <Route path="/access" element={<AccessPage />} />
  <Route path="/:record" element={<ValidLegalRoute />} />
  <Route path="*" element={<Navigate to="/" replace />} />
 </Routes></SiteFrame>;
}
