import { Link, useSearchParams } from 'react-router-dom';
import { MotionPage, MotionSection } from '../components/Motion';
import { productById, products } from '../data';

type ReturnState = 'completed' | 'failed' | 'canceled' | 'pending' | 'unverified';
function returnState(value: string | null): ReturnState {
 switch (value?.toLowerCase()) {
  case 'success': case 'completed': return 'completed';
  case 'failed': case 'error': case 'declined': return 'failed';
  case 'canceled': case 'cancelled': return 'canceled';
  case 'pending': case 'processing': return 'pending';
  default: return 'unverified';
 }
}

export function ConfirmationPage() {
 const [params] = useSearchParams();
 const offer = params.get('offer');
 const known = products.some((product) => product.id === offer) || offer === 'herald';
 const product = productById(offer || 'signal');
 const state = returnState(params.get('status'));
 const heading = !known ? 'The return needs a known gate.' : {
  completed: `Whop returned a completed status for ${product.title}.`,
  failed: 'This checkout did not complete.',
  canceled: 'You left checkout without completing it.',
  pending: `${product.title} is still processing.`,
  unverified: `${product.title} is waiting for a provider status.`,
 }[state];
 const copy = !known ? 'We cannot identify the work from this link. Check your Whop receipt or choose the gate again.' : {
  completed: 'This is a browser-return presentation, not proof of payment. Check the Whop receipt and sign in with the account used at checkout to verify access.',
  failed: 'Whop did not return a completed status. No access is being claimed here. You can review the gate and try again, or ask support to locate a receipt.',
  canceled: 'Nothing was confirmed by this return. You can revisit the gate whenever you are ready.',
  pending: 'Do not retry payment just because this page is waiting. Check your Whop receipt and account status first; support can help if it remains unresolved.',
  unverified: 'No recognized checkout status was supplied. This page cannot confirm a purchase. Your Whop receipt and account record are authoritative.',
 }[state];
 const reference = params.get('order_id') || params.get('payment_id') || params.get('receipt_id');
 return <MotionPage className="confirmation-page gate-confirmation-page"><MotionSection>
  <p className="eyebrow">Browser return · {known ? product.title : 'unknown gate'}</p>
  <h1>{heading}</h1><p>{copy}</p>
  {reference && <small>Provider reference for support: {reference}</small>}
  {known && state === 'completed' && product.confirmationFilm && <figure className="confirmation-film"><figcaption><span className="eyebrow">The invitation</span><strong>The next room is ready when Whop grants access.</strong><small>Watch, then verify with Whop.</small><small>Soundtrack credit pending review</small></figcaption><video controls preload="metadata" playsInline poster={product.image}><source src={product.confirmationFilm} type="video/mp4" /><track kind="captions" src={`/media/${product.id}-invite-1440.vtt`} srcLang="en" label="English" default /></video></figure>}
  <div className="confirmation-page__actions">
   {known && state === 'completed' && <Link className="button button--light" to={`/access?offer=${product.id}&from=confirmation`}>Verify library access with Whop</Link>}
   <a className="button" href="https://whop.com/thenuminouses/">Check my Whop account</a>
   <Link className="button" to={known ? `/gates/${product.gate}` : '/gates'}>{known ? `Return to ${product.title}` : 'Explore the gates'}</Link>
  </div>
  <p className="confirmation-page__support">A query string is never a receipt or an entitlement. Whop controls the account and purchase record. Need a person? Write to <a href="mailto:numinous.support@gmail.com">numinous.support@gmail.com</a> with your receipt.</p>
 </MotionSection></MotionPage>;
}
