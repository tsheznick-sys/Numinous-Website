import { Link } from "@tanstack/react-router";
import { Sigil } from "../brand/Sigil";
import { PRODUCT_ROUTES, SITE } from "../../lib/site";

export function Footer() {
	return (
		<footer>
			<div className="wrap">
				<div className="foot-grid">
					<div className="foot-brand">
						<Sigil size={46} />
						<p>
							The realms, opened. Cinematic visions of the divine and mythical,
							new realms every week.
						</p>
						<div className="wk">SIGNAL · WATCHER</div>
					</div>
					<div>
						<h5>THE GATES</h5>
						<ul>
							<li>
								<Link
									to="/products/$slug"
									params={{ slug: PRODUCT_ROUTES.signal }}
									data-hover
								>
									The Signal · Free
								</Link>
							</li>
							<li>
								<Link
									to="/products/$slug"
									params={{ slug: PRODUCT_ROUTES.numinary }}
									data-hover
								>
									Watcher · $28 / moon
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<h5>FURTHER DEPTHS</h5>
						<ul>
							<li>
								<Link to="/returns" data-hover>
									The Pact · returns
								</Link>
							</li>
							<li>
								<a href={SITE.instagram} target="_blank" rel="noreferrer" data-hover>
									{SITE.instagramHandle}
								</a>
							</li>
							<li>
								<Link to="/privacy" data-hover>
									Privacy
								</Link>
							</li>
							<li>
								<Link to="/cookies" data-hover>
									Cookies
								</Link>
							</li>
							<li>
								<Link to="/terms" data-hover>
									Terms
								</Link>
							</li>
						</ul>
					</div>
				</div>
				<div className="foot-bar">
					<span>
						© MMXXVI <b>NUMINOUS</b> · ALL VISIONS RESERVED
					</span>
					<span>
						WITNESS THE IMPOSSIBLE <b>✦</b> NEW REALMS EVERY WEEK
					</span>
				</div>
			</div>
		</footer>
	);
}
