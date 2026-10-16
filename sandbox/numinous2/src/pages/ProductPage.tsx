import { Link, useParams } from 'react-router-dom';
import { MotionPage, MotionSection, ParallaxLayer, TiltArticle, TiltFrame } from '../components/Motion';
import { productByGate, productBySlug } from '../data';

export function ProductPage() {
 const { gate, slug } = useParams();
 const product = gate ? productByGate(gate) : productBySlug(slug);
 const heroAction = <Link className="button button--light" to={`/gates/${product.gate}/enter`}>Review {product.title} <b aria-hidden="true">↗</b></Link>;

 return <MotionPage className={`product-page product-page--${product.id}`}>
  <MotionSection className="product-hero"><div className="product-hero__copy" data-gate={product.gate.toUpperCase()}><p className="eyebrow">{product.number} · {product.label}</p><h1>{product.title}</h1><p className="product-hero__lede">{product.description}</p><p className="product-hero__story">{product.longDescription}</p><div className="product-hero__actions">{heroAction}<span>{product.price} · {product.fact}</span></div></div><TiltFrame className="product-hero__art"><img src={product.image} alt={`${product.title} artwork`} /></TiltFrame></MotionSection>
  <MotionSection className="product-essay section"><header className="section-head"><p className="eyebrow">Inside the gate</p><h2>Made for a slower <em>kind of attention.</em></h2></header><div className="chapter-list">{product.chapters.map((chapter, index) => <TiltArticle key={chapter.title} delay={index * .08}><span>0{index + 1}</span><h3>{chapter.title}</h3><p>{chapter.copy}</p></TiltArticle>)}</div></MotionSection>
  {product.film && <MotionSection className="product-film"><div><p className="eyebrow">Briefing film</p><h2>The mood, the rhythm, <em>the invitation.</em></h2><p>Watch the record as a pause inside the work. The threshold remains above when you are ready to return to it.</p></div><ParallaxLayer className="product-film__frame"><video controls preload="metadata" playsInline poster={product.image}><source src={product.film} type="video/mp4" /><track kind="captions" src={`/media/${product.id}-briefing-1440.vtt`} srcLang="en" label="English" default /></video><small className="film-credit">Soundtrack credit pending review</small></ParallaxLayer></MotionSection>}
  <MotionSection className="product-phenomenon" aria-label={`${product.title} visual afterimage`}><div className="product-phenomenon__artifact" aria-hidden="true"><i /><i /><img src={product.image} alt="" /><span>{product.number.split(' ')[0]}</span></div><div className="product-phenomenon__copy"><p className="eyebrow">The afterimage</p><h2>Let the work leave its <em>mark.</em></h2><p>This is the last frame, not another prompt to buy. A small orbit of the ideas held inside this Gate—left open for the mind to carry beyond the page.</p><ol>{product.chapters.map((chapter, index) => <li key={chapter.title}><span>0{index + 1}</span><b>{chapter.title}</b></li>)}</ol><p className="product-phenomenon__note">The threshold appears once, at the beginning. Everything after it is room to look.</p></div></MotionSection>
 </MotionPage>;
}
