export type ProductId = 'signal' | 'watcher' | 'vault' | 'agent';

type CheckoutOption = {
  label: string;
  price: string;
  cadence: string;
  url: string;
};

export type Product = {
  id: ProductId;
  slug: string;
  gate: string;
  number: string;
  title: string;
  label: string;
  price: string;
  fact: string;
  description: string;
  longDescription: string;
  image: string;
  film?: string;
  invitationFilm?: string;
  checkoutFilm?: string;
  confirmationFilm?: string;
  filmRecord?: { title: string; copy: string; caption: string; checkoutCopy: string; invitationCopy?: string };
  facts: { label: string; value: string }[];
  ritual?: { label: string; title: string; copy: string };
  checkout: string;
  access: string;
  checkoutOptions?: CheckoutOption[];
  chapters: { title: string; copy: string }[];
};

export const products: Product[] = [
  {
    id: 'signal', slug: 'the-signal-e6', gate: 'signal', number: 'I / IV', title: 'The Signal', label: 'The first gate · free forever', price: 'Free · $0', fact: 'No card. No renewal.',
    description: 'The first vision, Dispatches, the calendar, and the Sanctuary — the open beginning of the house.',
    longDescription: 'Every realm arrives here before it reaches the wider feed. The Signal is a free room for meeting the work slowly, then deciding for yourself how far to go.',
    image: '/media/signal.jpg', film: '/media/signal-briefing-1440.mp4', invitationFilm: '/media/signal-invite-1440.mp4', checkoutFilm: '/media/signal-briefing-1440.mp4', confirmationFilm: '/media/signal-invite-1440.mp4', filmRecord: { title: 'A first signal, not a sales reel.', copy: 'This briefing introduces the open room: the first vision, Dispatches, the calendar, and the Sanctuary. Watch it as a quiet orientation before choosing whether the wider house is for you.', caption: 'The Signal briefing · an orientation to the free first Gate', checkoutCopy: 'A short orientation to the free room before you open it.', invitationCopy: 'A return to the first room, its Dispatches, and the path ahead.' }, checkout: 'https://whop.com/checkout/ch_wYXFulML0v6LIoJ/', access: 'https://whop.com/joined/the-signal-e6',
    facts: [{ label: 'Access', value: 'Whop library' }, { label: 'Delivery', value: 'First vision, Dispatches, calendar, Sanctuary' }, { label: 'Return', value: 'Free forever · no card' }],
    chapters: [{ title: 'The First Vision', copy: 'A ten-page work offered as the first threshold.' }, { title: 'Dispatches', copy: 'Small transmissions from the room as new work takes shape.' }, { title: 'The Sanctuary', copy: 'A quiet place to return to the calendar and the signal.' }],
  },
  {
    id: 'watcher', slug: 'the-numinary-3e', gate: 'watcher', number: 'II / IV', title: 'The Watcher', label: 'The room that runs on the moon', price: '$28 / 28 days · $280 / year', fact: 'Monthly plan: 7 days free, then $28 every 28 days.',
    description: 'One new being, unfolded in four chapters across every 28-day moon.',
    longDescription: 'The Watcher is a paced room rather than an endless feed: enter the Realm, follow the Process, gather the Records, and return for a live Session with every new being.',
    image: '/media/watcher.jpg', film: '/media/watcher-briefing-1440.mp4', checkoutFilm: '/media/watcher-briefing-1440.mp4', confirmationFilm: '/media/watcher-invite-1440.mp4', checkoutOptions: [{ label: 'Monthly Watcher · 7 days free', price: '$28', cadence: 'every 28 days after trial', url: 'https://whop.com/checkout/plan_PQnMYNixMTjRQ?quantity=1&items=plan_PQnMYNixMTjRQ:1' }, { label: 'Annual Watcher', price: '$280', cadence: 'per year; no trial stated', url: 'https://whop.com/checkout/plan_Imfk0oedwYn7v' }], filmRecord: { title: 'The rhythm of one being, revealed in four turns.', copy: 'This briefing shows how The Watcher moves through a 28-day moon: enter the Realm, follow the Process, gather the Records, and return for the Session. It is a view of the pace, not a promise of an endless feed.', caption: 'The Watcher briefing · the four-part rhythm of a 28-day cycle', checkoutCopy: 'A look at the four-part rhythm before you begin the next cycle.', invitationCopy: 'A quiet invitation back to the Realm, the Records, and the next Session.' }, checkout: 'https://whop.com/checkout/plan_PQnMYNixMTjRQ?quantity=1&items=plan_PQnMYNixMTjRQ:1', access: 'https://whop.com/joined/the-numinary-3e',
    facts: [{ label: 'Access', value: 'Whop member room' }, { label: 'Delivery', value: 'One being · four chapters · every 28 days' }, { label: 'Trial & return', value: 'Monthly: 7 days free, then $28 every 28 days; seven-night return after first payment' }],
    chapters: [{ title: 'Week I · The Realm', copy: 'Meet the being and enter the atmosphere it inhabits.' }, { title: 'Week II · The Process', copy: 'Follow the choices, fragments and construction of the work.' }, { title: 'Week III · The Records', copy: 'Gather the lore, visual studies and written traces.' }, { title: 'Week IV · The Session', copy: 'Return for the live build, Q&A and the next turn of the cycle.' }],
  },
  {
    id: 'vault', slug: 'wallpaper-vault', gate: 'vault', number: 'III / IV', title: 'Wallpaper Vault', label: 'A permanent collection', price: '$12 · one time', fact: 'Fifteen works.',
    description: 'Fifteen Numinous worlds, composed for phone, portrait, and desktop.',
    longDescription: 'A permanent library of fifteen wallpapers drawn from the work, prepared to alter the atmosphere of the screens you return to every day.',
    image: '/media/vault.jpg', checkout: 'https://whop.com/checkout/plan_Aew5DdipP3fKY?quantity=1&items=plan_Aew5DdipP3fKY:1', access: 'https://whop.com/thenuminouses/',
    facts: [{ label: 'Access', value: 'Whop download library' }, { label: 'Delivery', value: '15 works · phone · portrait · desktop' }, { label: 'Return', value: 'Final once opened' }],
    ritual: { label: 'The visual record', title: 'The images are the film.', copy: 'A still ritual for a collected work: fifteen scenes prepared to live with you, rather than a borrowed film presented as the Vault.' },
    chapters: [{ title: 'Phone', copy: 'Fifteen works prepared for the screen you keep closest.' }, { title: 'Portrait', copy: 'Vertical compositions prepared for taller screens and quiet spaces.' }, { title: 'Desktop', copy: 'Wide compositions built to change the atmosphere of a room.' }],
  },
  {
    id: 'agent', slug: 'numinary-agent', gate: 'numinary-agent', number: 'IV / IV', title: 'The Numinary Agent', label: 'Private lore guide for Watchers', price: 'Free access · Keys from $19.99 / month', fact: 'Failed replies do not spend a Key.',
    description: 'A private lore guide for Watchers of The Numinary.',
    longDescription: 'Ask about the Moon Watcher, the Vault, and the symbols woven through the realms. Each question uses one Key; a failed reply does not spend one. The Agent stays with Watchers of The Numinary.',
    image: '/media/numinary.jpg', checkout: 'https://whop.com/thenuminouses/numinary-agent/', access: 'https://whop.com/thenuminouses/numinary-agent/',
    checkoutOptions: [
      { label: 'Numinary Keys', price: '$29.99', cadence: 'per month', url: 'https://whop.com/checkout/plan_DfdY0zchDNFfd' },
      { label: 'Numinary Keys', price: '$359.88', cadence: 'per year', url: 'https://whop.com/checkout/plan_1D3t48PqoC0VO' },
      { label: '60-Key pack', price: '$19.99', cadence: 'per month', url: 'https://whop.com/checkout/plan_JVsIaspu0MCOs' },
      { label: '60-Key pack', price: '$199.99', cadence: 'per year', url: 'https://whop.com/checkout/plan_adTlNP9y9zjvP' },
    ],
    facts: [{ label: 'Access', value: 'Whop app · join free' }, { label: 'Delivery', value: 'Private lore answers for the realms' }, { label: 'Keys', value: 'One question · one Key · failed replies are not spent' }],
    ritual: { label: 'The agent record', title: 'Ask the lore. Keep the thread.', copy: 'The Numinary Agent is a private guide within the house: a direct way to ask about the Moon Watcher, the Vault, and the symbols that connect the realms.' },
    chapters: [{ title: 'Ask', copy: 'Bring a question about the Moon Watcher, the Vault, or a symbol in the work.' }, { title: 'Receive', copy: 'The Agent returns a private lore-guided response inside the Whop app.' }, { title: 'Continue', copy: 'Use Keys only when you need a deeper thread; failed replies do not consume one.' }],
  },
];

export const productById = (id?: string) => products.find((product) => product.id === (id === 'herald' ? 'agent' : id)) ?? products[0];
export const productByGate = (gate?: string) => products.find((product) => product.gate === gate) ?? products[0];
export const productBySlug = (slug?: string) => products.find((product) => product.slug === slug) ?? products[0];

export const legalRecords: Record<string, { kicker: string; title: string; introduction: string; sections: { heading: string; copy: string }[] }> = {
  returns: { kicker: 'The seven nights', title: 'The Pact', introduction: 'The monthly Watcher begins with a 7-day free trial, then $28 every 28 days. The Pact also explains the seven-night return window after the first payment. It also records how final-download works are handled and how to ask for help.', sections: [{ heading: 'The Watcher · seven nights', copy: 'The monthly Watcher begins with 7 days free, then $28 every 28 days. If you make your first payment after the trial and it is not for you, email within seven nights of that payment and the full first payment returns. There is no ritual of persuasion: send the request plainly, keep what you received, and let support confirm the record through Whop.' }, { heading: 'What the Pact covers', copy: 'The seven-night guarantee applies to the first Watcher payment. It is a specific promise for that membership, not a replacement for the terms shown on other offers. Whop’s receipt and purchase record remain the source of truth for payment and access.' }, { heading: 'One-time works', copy: 'Wallpaper Vault downloads are final once opened because the work is delivered immediately. Support can still help with a delivery failure, a corrupted file, a duplicate charge, or a material listing error.' }, { heading: 'How to ask', copy: 'Write to numinous.support@gmail.com with the receipt and the email used at checkout. Include the product name and a short note about the request so the correct Whop order can be located.' }] },
  refunds: { kicker: 'The pact', title: 'Refund policy', introduction: 'The Pact’s working record for a Watcher return: the window, the first payment it covers, and the simple information support needs to locate the order.', sections: [{ heading: 'The seven-night window', copy: 'The monthly Watcher starts with 7 days free. Once the first payment is made, a Watcher refund request must be sent within seven nights of that payment, not a later visit to the room.' }, { heading: 'What returns', copy: 'An eligible request returns the full first Watcher payment. Access remains through the relevant completed period as confirmed by Whop; the receipt and Whop order record are the authoritative account records.' }, { heading: 'What does not change', copy: 'Wallpaper Vault downloads remain final once opened, except for delivery failures, corrupted files, duplicate charges, or a material listing error. Other offer terms are shown with their individual Gate before checkout.' }, { heading: 'How to ask', copy: 'Email numinous.support@gmail.com with the order receipt, the email used at checkout, the product name, and a short note. This lets support locate the correct Whop order without asking for unnecessary information.' }] },
  terms: { kicker: 'The records', title: 'Terms of service', introduction: 'The shared terms for entering, using, and protecting the works.', sections: [{ heading: 'The works', copy: 'The Signal, The Watcher, Wallpaper Vault, and The Numinary Agent are delivered through Whop. By purchasing or accessing a work, you agree to the applicable terms.' }, { heading: 'Your use', copy: 'You may use the creative ideas and methods in your own practice. You may not resell, republish, redistribute, or share the original product files or written records.' }, { heading: 'Contact', copy: 'For a question about an order or these terms, contact numinous.support@gmail.com.' }] },
  privacy: { kicker: 'The records', title: 'Privacy', introduction: 'A clear note about account and purchase information.', sections: [{ heading: 'Whop', copy: 'Whop provides the account, payment, checkout, and purchase-record systems for the storefront.' }, { heading: 'Support requests', copy: 'When you write for support, use the receipt and email from your Whop order so the request can be located.' }, { heading: 'Controls', copy: 'See Whop privacy controls for account-level information and data management.' }] },
  eula: { kicker: 'The license', title: 'EULA', introduction: 'Honor the work, and it honors you.', sections: [{ heading: 'License', copy: 'Numinous grants a limited, non-exclusive license to use the creative ideas, prompts, workflow information, and techniques in the works for personal or commercial creative projects.' }, { heading: 'Restrictions', copy: 'Do not resell, republish, redistribute, upload, or share the original product files, written records, or compiled guides.' }, { heading: 'Ownership', copy: 'Numinous retains ownership and intellectual-property rights in the product itself.' }] },
  cookies: { kicker: 'The records', title: 'Cookies', introduction: 'A short note on browser storage and services.', sections: [{ heading: 'Essential services', copy: 'The storefront uses browser and service functionality required to deliver Whop checkout, account access, and site preferences.' }, { heading: 'Your controls', copy: 'You can manage stored browser data through your browser settings and use Whop controls for your account.' }] },
};
