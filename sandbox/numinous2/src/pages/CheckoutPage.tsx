import { Link, useParams, useSearchParams } from 'react-router-dom';
import { MotionPage, MotionSection, TiltArticle } from '../components/Motion';
import { productByGate, productById } from '../data';

export function CheckoutPage() {
 const [params] = useSearchParams();
 const { gate } = useParams();
 const product = gate ? productByGate(gate) : productById(params.get('offer') || 'signal');
 return <MotionPage className="checkout-page gate-checkout-page"><MotionSection>
  <p className="eyebrow">The threshold · {product.number}</p>
  <h1>Review the gate <em>before you enter.</em></h1>
  <p className="checkout-page__intro">Know the work and its terms before you continue to Whop. Whop handles checkout, receipts and access.</p>
  {product.id === 'watcher' && <p className="checkout-page__terms">The monthly Watcher begins with 7 days free, then $28 every 28 days. The $280 annual option is separate. If you later make your first payment and it is not for you, request the seven-night return within seven nights of that payment.</p>}
  <TiltArticle className="checkout-offer"><img src={product.image} alt="" /><div><span>{product.label}</span><h2>{product.title}</h2><p>{product.description}</p><b>{product.price}</b><small>{product.fact}</small></div><Link className="checkout-offer__hit" to={`/gates/${product.gate}`} aria-label={`Read details about ${product.title}`} /></TiltArticle>
  {product.checkoutFilm && <figure className="checkout-film"><figcaption><span className="eyebrow">Before entry · briefing film</span><strong>{product.title}, in its own rhythm.</strong><small>Watch before continuing to Whop.</small><small>Soundtrack credit pending review</small></figcaption><video controls preload="metadata" playsInline poster={product.image}><source src={product.checkoutFilm} type="video/mp4" /><track kind="captions" src={`/media/${product.id}-briefing-1440.vtt`} srcLang="en" label="English" default /></video></figure>}
  <ol className="checkout-steps"><li><span>I</span>Review your chosen gate</li><li><span>II</span>Complete the handoff on Whop</li><li><span>III</span>Verify your receipt and account access on Whop</li></ol>
  {product.checkoutOptions ? <div className="checkout-options" aria-label={`${product.title} choices`}>
   {product.id === 'agent' && <a className="checkout-option" href={product.checkout}><span><strong>Join the free Agent app</strong><small>Open the Whop product page; paid Keys are optional</small></span><b>Free entry <i aria-hidden="true">↗</i></b></a>}
   {product.checkoutOptions.map((option) => <a className="checkout-option" href={option.url} key={option.url}><span><strong>{option.label}</strong><small>{option.cadence}</small></span><b>{option.price} <i aria-hidden="true">↗</i></b></a>)}
  </div> : <div className="checkout-page__actions"><a className="button button--light" href={product.checkout}>{product.id === 'signal' ? 'Join The Signal free on Whop' : `Review ${product.title} on Whop`} <b aria-hidden="true">↗</b></a></div>}
  {product.id === 'agent' && <p className="checkout-page__terms">The Keys offers are listed as supplied with this sandbox build. Confirm current prices, Key quantities, eligibility and renewal terms on Whop before subscribing.</p>}
  <p className="checkout-page__note">Check the final price and terms on Whop before you enter. The Whop receipt and order record—not a browser return page—are the source of truth for payment and access.</p>
  <nav className="checkout-page__records" aria-label="Before-entry records"><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link><Link to="/returns">The Pact</Link><a href="mailto:numinous.support@gmail.com">Support</a></nav>
 </MotionSection></MotionPage>;
}
