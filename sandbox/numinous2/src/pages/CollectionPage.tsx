import { Link } from 'react-router-dom';
import { MotionPage, MotionSection, TiltArticle } from '../components/Motion';
import { products } from '../data';

export function CollectionPage() {
 return <MotionPage className="collection-page"><MotionSection className="collection-hero"><p className="eyebrow">The works</p><h1>Four gates. <em>One living record.</em></h1><p>Begin with the Signal, move with the Watcher, carry the Vault, or consult the Numinary Agent.</p></MotionSection><section className="collection-grid">{products.map((product, index) => <TiltArticle className="collection-card" key={product.id} delay={index * .08}><img src={product.image} alt="" /><div><span>{product.number} · {product.label}</span><h2>{product.title}</h2><p>{product.description}</p><b>{product.price}</b><span className="collection-grid__enter" aria-hidden="true">Open gate <i>↗</i></span></div><Link className="collection-card__hit" to={`/gates/${product.gate}`} aria-label={`View ${product.title} details`} /></TiltArticle>)}</section></MotionPage>;
}
