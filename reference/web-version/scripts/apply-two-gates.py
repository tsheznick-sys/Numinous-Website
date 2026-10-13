#!/usr/bin/env python3
from pathlib import Path
import re

src = Path("/tmp/index.html").read_text()

# 5. Equal two-column gates
src = src.replace(
    ".c-signal{grid-column:span 12;flex-direction:row;min-height:320px}\n"
    ".c-signal .art{width:50%;flex:none}\n"
    ".c-signal .body{padding:clamp(1.6rem,3.4vw,3rem);justify-content:center}\n",
    ".c-signal,.c-watcher{grid-column:span 6}\n"
    ".c-signal{flex-direction:column;min-height:0}\n"
    ".c-signal .art{width:100%;aspect-ratio:4/4.7}\n"
    ".c-signal .body{padding:1.5rem 1.6rem 1.7rem;justify-content:flex-start}\n",
)
src = src.replace(
    ".c-watcher{grid-column:span 4}\n"
    ".c-wall{grid-column:span 4}.c-num{grid-column:span 4}.c-coll{grid-column:span 4}\n",
    "",
)
src = src.replace(
    "  .c-watcher{grid-column:span 6}\n",
    "  .c-signal,.c-watcher{grid-column:span 6}\n",
)

# 6. Close broken nested media query
src = src.replace(
    "@media (max-width:760px){\n  body{font-size:17.5px}\n@media (max-width:760px){\n",
    "@media (max-width:760px){\n  body{font-size:17.5px}\n",
)

# 1. Voices CSS
src = re.sub(
    r"\n/\* ---------- VOICES ---------- \*/.*?(?=\n/\* ---------- FINALE ---------- \*/)",
    "\n",
    src,
    count=1,
    flags=re.S,
)

# 1. Voices HTML
src = re.sub(
    r"\n<!-- ======================= VOICES ======================= -->.*?(?=\n<!-- ======================= FINALE ======================= -->)",
    "\n",
    src,
    count=1,
    flags=re.S,
)

# 7. Cookie line: no em dash
src = src.replace(
    "no trackers follow you here — one small entry in your browser remembers this choice.",
    "no trackers follow you here. One small entry in your browser remembers this choice.",
)

# Ticker: Codex leftover
src = src.replace(
    " NEW REALMS EVERY WEEK <b>✦</b> FIFTEEN BEINGS <b>✦</b> THE SEVEN-NIGHT PACT",
    " NEW REALMS EVERY WEEK <b>✦</b> THE SEVEN-NIGHT PACT",
)

# 2. Collector JS leftovers
src = src.replace(
    "var collBg=$('#collBg'),heroBg=$('#heroBg');\n"
    "function loop(t){\n"
    "  if(!RM)drawStars(t);\n"
    "  if(collBg){var r=collBg.getBoundingClientRect();\n"
    "    if(r.bottom>0&&r.top<innerHeight){var prog=(innerHeight-r.top)/(innerHeight+r.height);collBg.style.transform='translateY('+((prog-.5)*90)+'px) scale(1.14)'}}\n"
    "  requestAnimationFrame(loop);\n"
    "}\n",
    "function loop(t){\n"
    "  if(!RM)drawStars(t);\n"
    "  requestAnimationFrame(loop);\n"
    "}\n",
)
src = re.sub(
    r"\n/\* ---------- tally \(28 marks\) ---------- \*/.*?tally\.setAttribute\('viewBox','0 0 '\+x\+' 50'\);\n\}\n",
    "\n",
    src,
    count=1,
    flags=re.S,
)

# 9. Herald does not store email
src = src.replace(
    '<div class="herald-ok" id="heraldOk" role="status">So it is written. The next vision will find you — confirm the address in your inbox.</div>',
    '<div class="herald-ok" id="heraldOk" role="status">The Signal is open. Enter the gate for the next realm.</div>',
)
src = src.replace(
    "  okMsg.innerHTML='So it is written. The next vision will find you — confirm the address in your inbox. '\n"
    "    +'<a href=\"'+BASE+'/products/the-signal-e6\" target=\"_blank\" rel=\"noopener\" '\n"
    "    +'style=\"color:var(--gold-hi);text-decoration:underline;text-underline-offset:3px\">Open The Signal →</a>';\n",
    "  okMsg.innerHTML='The Signal is open. Enter the gate for the next realm. '\n"
    "    +'<a href=\"'+BASE+'/products/the-signal-e6\" target=\"_blank\" rel=\"noopener\" '\n"
    "    +'style=\"color:var(--gold-hi);text-decoration:underline;text-underline-offset:3px\">Open The Signal →</a>';\n",
)

# 3. Cloudflare email-decode and challenge iframe
src = src.replace(
    '<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script>',
    "",
)
src = re.sub(
    r'<script>\(function\(\)\{function c\(\)\{var b=a\.contentDocument.*?</script>',
    "",
    src,
    count=1,
    flags=re.S,
)

MAIL = '<a href="mailto:numinous.support@gmail.com">numinous.support@gmail.com</a>'
src = re.sub(
    r'<a href="/cdn-cgi/l/email-protection#[^"]+"><span class="__cf_email__" data-cfemail="[^"]+">\[email&#160;protected\]</span></a>',
    MAIL,
    src,
)

TERMS = r'''<template id="doc-terms">
  <div class="doc-meta">LAST&nbsp;UPDATED&nbsp;SEPTEMBER&nbsp;28,&nbsp;2026&nbsp;·&nbsp;NUMINOUS&nbsp;·&nbsp;WHOP&nbsp;STOREFRONT</div>
  <div class="doc-body">
    <h3><span class="n">I.</span>WHO THESE TERMS APPLY TO</h3>
    <p>These Terms of Service (“Terms”) govern your use of the Numinous storefront on Whop, including The Signal (free) and The Watcher (also called The Numinary, $28 every 28 days). By entering a gate, you agree to these Terms.</p>
    <h3><span class="n">II.</span>THE TWO GATES</h3>
    <ul>
      <li><b>The Signal</b> is free, forever. No card is required. Every realm drops there first.</li>
      <li><b>The Watcher</b> is a paid seat. It costs $28 USD every 28 days and renews with the moon until you cancel. Access stays until that cycle ends.</li>
    </ul>
    <h3><span class="n">III.</span>PURCHASES &amp; PAYMENT</h3>
    <ul>
      <li>All paid purchases are processed through Whop. Payment terms, accepted methods, and billing are governed by Whop’s own terms in addition to these Terms.</li>
      <li>Prices are listed in USD. The price you pay at checkout is final for that transaction.</li>
    </ul>
    <h3><span class="n">IV.</span>DELIVERY</h3>
    <p>The Signal opens in your Whop library when you enter. The Watcher opens the room, the cycle, and the live session for as long as the seat is active.</p>
    <h3><span class="n">V.</span>NO PROMISE OF OUTCOME</h3>
    <p>Numinous is cinematic art and a membership room. It does not guarantee any artistic, commercial, or financial result.</p>
    <h3><span class="n">VI.</span>ACCEPTABLE USE</h3>
    <p>You agree not to:</p>
    <ul>
      <li>Resell, redistribute, or publicly share the works themselves (see the <a href="#/eula">EULA</a>)</li>
      <li>Share a Watcher seat or login with anyone who did not pay for it</li>
      <li>Use the works for any unlawful purpose</li>
      <li>Attempt to obtain paid access without payment</li>
    </ul>
    <h3><span class="n">VII.</span>LIMITATION OF LIABILITY</h3>
    <p>To the maximum extent permitted by law, Numinous is not liable for any indirect, incidental, or consequential damages arising from your use of The Signal or The Watcher.</p>
    <h3><span class="n">VIII.</span>CHANGES TO THESE TERMS</h3>
    <p>We may update these Terms from time to time. Continued use after changes take effect constitutes acceptance of the revised Terms.</p>
    <h3><span class="n">IX.</span>GOVERNING LAW</h3>
    <p>These Terms, and any dispute arising from your use of the storefront, are governed by the laws of the State of Wyoming, United States, without regard to conflict-of-law principles. Numinous handles personal data in accordance with the GDPR and the CCPA as the governing privacy standard for this business, regardless of buyer location. See the <a href="#/privacy">Privacy Policy</a>.</p>
    <h3><span class="n">X.</span>CONTACT</h3>
    <p>Questions about these Terms: ''' + MAIL + r'''</p>
  </div>
  <svg class="doc-seal" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="46" fill="#170f04" stroke="#b8912a" stroke-width="2"/>
    <circle cx="50" cy="50" r="39" fill="none" stroke="#d4af37" stroke-width="1" stroke-dasharray="2 3"/>
    <path d="M20 50 Q50 28 80 50 Q50 72 20 50 Z" fill="none" stroke="#f0d98c" stroke-width="1.8"/>
    <circle cx="50" cy="50" r="9" fill="none" stroke="#f0d98c" stroke-width="1.8"/>
    <circle cx="50" cy="50" r="3.2" fill="#f0d98c"/>
  </svg>
  <p class="doc-sign">Bound and set down by the House of Numinous. May it serve your work.</p>
</template>'''

PRIVACY = r'''<template id="doc-privacy">
  <div class="doc-meta">LAST&nbsp;UPDATED&nbsp;SEPTEMBER&nbsp;28,&nbsp;2026&nbsp;·&nbsp;NUMINOUS&nbsp;·&nbsp;WHOP&nbsp;STOREFRONT</div>
  <div class="doc-body">
    <h3><span class="n">I.</span>WHAT THIS COVERS</h3>
    <p>This Privacy Policy explains what personal information is collected when you enter The Signal or The Watcher through our Whop storefront, how it is used, and the rights available to you under the GDPR and the CCPA, applied as the governing privacy standard for this business regardless of buyer location.</p>
    <h3><span class="n">II.</span>INFORMATION WE RECEIVE</h3>
    <p>Purchases and memberships are processed through Whop. We do not collect or store your payment details. Those are handled by Whop under its own privacy and security policies. Information we may receive as the seller includes:</p>
    <ul>
      <li>Your email address, for delivery and support</li>
      <li>Purchase date, amount, and which gate you entered</li>
      <li>Any information you voluntarily send us (for example a support message)</li>
    </ul>
    <h3><span class="n">III.</span>THE HERALD AND COOKIES</h3>
    <p>The Herald form on this site does not store your email. Submitting it opens The Signal, where you may enter for free. The cookie bar writes one small choice to your browser (accepted or declined). No trackers follow you here.</p>
    <h3><span class="n">IV.</span>HOW WE USE THIS INFORMATION</h3>
    <ul>
      <li>To open The Signal or The Watcher for you</li>
      <li>To respond to support and Seven Nights requests</li>
      <li>To keep records required for accounting and tax</li>
      <li>We do not sell, rent, or trade your personal information</li>
    </ul>
    <h3><span class="n">V.</span>LEGAL BASIS FOR PROCESSING (GDPR)</h3>
    <p>If you are located in the EU/EEA, we process personal information under: performance of a contract (delivering the gate you entered), legitimate interest (support and fraud prevention), and legal obligation (tax and accounting records).</p>
    <h3><span class="n">VI.</span>YOUR RIGHTS UNDER GDPR</h3>
    <p>If you are located in the EU/EEA, you have the right to access, correct, delete (subject to legal record-keeping), object to or restrict certain processing, receive a portable copy, and lodge a complaint with your local authority. Contact ''' + MAIL + r'''.</p>
    <h3><span class="n">VII.</span>YOUR RIGHTS UNDER CCPA</h3>
    <p>If you are a California resident, you have the right to know what we have collected and why, to request deletion subject to legal exceptions, to opt out of sale or sharing (we do not sell or share your personal information), and to non-discrimination for exercising those rights. Contact ''' + MAIL + r'''.</p>
    <h3><span class="n">VIII.</span>THIRD-PARTY SERVICES</h3>
    <p>Payment processing and storefront hosting are handled by Whop. Their handling of your data is governed by Whop’s own Privacy Policy.</p>
    <h3><span class="n">IX.</span>DATA RETENTION</h3>
    <p>We retain purchase and membership records as long as necessary to comply with tax and accounting obligations, and to resolve support or refund requests.</p>
    <h3><span class="n">X.</span>CONTACT</h3>
    <p>Questions about this Privacy Policy, or to exercise your data rights: ''' + MAIL + r'''</p>
  </div>
  <svg class="doc-seal" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="46" fill="#170f04" stroke="#b8912a" stroke-width="2"/>
    <circle cx="50" cy="50" r="39" fill="none" stroke="#d4af37" stroke-width="1" stroke-dasharray="2 3"/>
    <path d="M20 50 Q50 28 80 50 Q50 72 20 50 Z" fill="none" stroke="#f0d98c" stroke-width="1.8"/>
    <circle cx="50" cy="50" r="9" fill="none" stroke="#f0d98c" stroke-width="1.8"/>
    <circle cx="50" cy="50" r="3.2" fill="#f0d98c"/>
  </svg>
  <p class="doc-sign">Kept light, kept honest. The House of Numinous.</p>
</template>'''

REFUND = r'''<template id="doc-refund">
  <div class="doc-meta">LAST&nbsp;UPDATED&nbsp;SEPTEMBER&nbsp;28,&nbsp;2026&nbsp;·&nbsp;NUMINOUS&nbsp;·&nbsp;WHOP&nbsp;STOREFRONT</div>
  <div class="doc-body">
    <h3><span class="n">I.</span>THE SIGNAL</h3>
    <p>The Signal is free, forever. There is nothing to refund.</p>
    <h3><span class="n">II.</span>THE WATCHER: SEVEN NIGHTS</h3>
    <p>The Watcher gives you <b>seven nights</b>. If the room does not name what you saw, message within seven days of the first payment and the full amount comes back. Keep what you received.</p>
    <p>After seven days, Watcher payments are final for that cycle. You may cancel any moon. Access stays until the current 28-day cycle ends. Cancelled seats are not refunded for unused days after the Seven Nights window.</p>
    <h3><span class="n">III.</span>OTHER WORKS</h3>
    <p>Any other work, if one is later opened, is final the moment it opens, unless we say otherwise at that gate.</p>
    <h3><span class="n">IV.</span>HOW TO ASK</h3>
    <p>Write within seven days with your order confirmation to ''' + MAIL + r'''. Approved refunds return to your original payment method through Whop. Timing after that depends on Whop and your payment provider.</p>
    <h3><span class="n">V.</span>CHARGEBACKS</h3>
    <p>If you believe you are entitled to a refund, contact us first. Filing a chargeback without first writing to us may close the seat and may affect later purchases.</p>
  </div>
  <svg class="doc-seal" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="46" fill="#170f04" stroke="#b8912a" stroke-width="2"/>
    <circle cx="50" cy="50" r="39" fill="none" stroke="#d4af37" stroke-width="1" stroke-dasharray="2 3"/>
    <path d="M20 50 Q50 28 80 50 Q50 72 20 50 Z" fill="none" stroke="#f0d98c" stroke-width="1.8"/>
    <circle cx="50" cy="50" r="9" fill="none" stroke="#f0d98c" stroke-width="1.8"/>
    <circle cx="50" cy="50" r="3.2" fill="#f0d98c"/>
  </svg>
  <p class="doc-sign">Fair dealing, sealed by the seven nights. The House of Numinous.</p>
</template>'''

EULA = r'''<template id="doc-eula">
  <div class="doc-meta">LAST&nbsp;UPDATED&nbsp;SEPTEMBER&nbsp;28,&nbsp;2026&nbsp;·&nbsp;NUMINOUS&nbsp;·&nbsp;WHOP&nbsp;STOREFRONT</div>
  <div class="doc-body">
    <h3><span class="n">I.</span>GRANT OF LICENSE</h3>
    <p>Numinous grants you a limited, non-exclusive, non-transferable license to access The Signal (free) and, if you take a seat, The Watcher ($28 every 28 days) for your own personal use, subject to the restrictions below.</p>
    <h3><span class="n">II.</span>WHAT YOU MAY DO</h3>
    <ul>
      <li>View, download, and keep Signal files delivered to your library</li>
      <li>Sit in The Watcher, join the cycle, and attend the live session while your seat is active</li>
      <li>Keep a personal backup of files delivered to you</li>
    </ul>
    <h3><span class="n">III.</span>WHAT YOU MAY NOT DO</h3>
    <ul>
      <li>Resell, republish, redistribute, or share the works themselves, in whole or in part, free or paid</li>
      <li>Share a Watcher seat or login</li>
      <li>Claim authorship of Numinous’s written or visual works</li>
      <li>Upload the works to any public repository, marketplace, torrent, or file-sharing service</li>
      <li>Use the works to create content that infringes on third parties’ rights or violates applicable law</li>
    </ul>
    <h3><span class="n">IV.</span>OWNERSHIP</h3>
    <p>Numinous retains all ownership and intellectual property rights in The Signal, The Watcher, and the visions released through them. This license does not transfer ownership. It only grants the right to use the works as described above.</p>
    <h3><span class="n">V.</span>WATCHER ACCESS</h3>
    <p>Watcher access lasts for each 28-day cycle you pay for. When the seat ends, the room closes. Files already in your library remain yours under this license.</p>
    <h3><span class="n">VI.</span>TERMINATION</h3>
    <p>This license terminates automatically if you breach any term of this EULA, including unauthorized redistribution or sharing of a seat.</p>
    <h3><span class="n">VII.</span>NO WARRANTY</h3>
    <p>The works are provided as is, without warranty of any kind, including any warranty of fitness for a particular purpose or a specific creative or commercial outcome.</p>
    <h3><span class="n">VIII.</span>CONTACT</h3>
    <p>Questions about this license: ''' + MAIL + r'''</p>
  </div>
  <svg class="doc-seal" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="46" fill="#170f04" stroke="#b8912a" stroke-width="2"/>
    <circle cx="50" cy="50" r="39" fill="none" stroke="#d4af37" stroke-width="1" stroke-dasharray="2 3"/>
    <path d="M20 50 Q50 28 80 50 Q50 72 20 50 Z" fill="none" stroke="#f0d98c" stroke-width="1.8"/>
    <circle cx="50" cy="50" r="9" fill="none" stroke="#f0d98c" stroke-width="1.8"/>
    <circle cx="50" cy="50" r="3.2" fill="#f0d98c"/>
  </svg>
  <p class="doc-sign">The licence of the Works. Honour it, and it honours you.</p>
</template>'''

def replace_template(html: str, tid: str, new: str) -> str:
    pat = rf'<template id="{tid}">.*?</template>'
    out, n = re.subn(pat, new, html, count=1, flags=re.S)
    if n != 1:
        raise SystemExit(f"template {tid} replacements: {n}")
    return out

src = replace_template(src, "doc-terms", TERMS)
src = replace_template(src, "doc-privacy", PRIVACY)
src = replace_template(src, "doc-refund", REFUND)
src = replace_template(src, "doc-eula", EULA)

# leftover checks
bans = [
    "Numinous Vault",
    "Veo3",
    "Google Flow",
    "email-decode",
    "challenge-platform",
    "id=\"voices\"",
    ".c-wall",
    ".c-coll",
    "#collBg",
    "#tally",
    "bg_collector",
    "XXVIII",
    "$112",
    "quiet-gate",
    "confirm the address in your inbox",
    "@media (max-width:760px){\n  body{font-size:17.5px}\n@media",
]
for ban in bans:
    if ban in src:
        raise SystemExit(f"leftover: {ban!r}")

# Codex on public surfaces
for label, chunk in [
    ("hero", src[src.find('id="hero"'):src.find("<!-- ======================= MARQUEE")]),
    ("ticker", src[src.find("<!-- ======================= MARQUEE"):src.find("<!-- ======================= STATS")]),
    ("works", src[src.find('id="works"'):src.find("<!-- ======================= INTERLUDE")]),
    ("faq", src[src.find('id="faq"'):src.find("<!-- ======================= HERALD")]),
    ("footer", src[src.find("<footer>"):src.find("<!-- ======================= COOKIE")]),
    ("schema", src[src.find("application/ld+json"):src.find("</script>\n</head>")]),
]:
    if re.search(r"Codex", chunk, re.I):
        raise SystemExit(f"Codex still in {label}")

if "grid-column:span 4" in src:
    raise SystemExit("watcher still span 4")

out = Path("/root/apps/app_YYGHDJQJ2JnCku/src/home.html")
out.write_text(src)
print("wrote", out, "bytes", out.stat().st_size)
