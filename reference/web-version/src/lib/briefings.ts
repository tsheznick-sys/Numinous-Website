export type BriefingScene = {
	id: string;
	plate: string;
	duration: number;
	kicker: string;
	title: string;
	copy: string;
};

export type GateBriefing = {
	id: string;
	planId: string;
	productTitle: string;
	library: string;
	endKicker: string;
	endTitle: string;
	cta: string;
	/** Rendered film (2560x1440). When present the briefing plays as real
	    video; the scene plates stay as the loading poster and the fallback. */
	video?: string;
	scenes: BriefingScene[];
};

export const GATE_LIBRARIES = {
	signal: "https://whop.com/joined/the-signal-e6",
	codex: "https://whop.com/joined/the-codex-5c",
	watcher: "https://whop.com/joined/the-numinary-3e",
	collector: "https://whop.com/joined/collector-s-edition-31",
} as const;

const SIGNAL: GateBriefing = {
	id: "signal",
	planId: "plan_5IYhtCsv2Buv1",
	productTitle: "The Signal",
	library: GATE_LIBRARIES.signal,
	endKicker: "THE GATE IS OPEN",
	endTitle: "Your rooms are waiting.",
	cta: "Open your library",
	video: "/assets/briefing/films/signal-briefing-1440.mp4",
	scenes: [
		{
			id: "threshold",
			plate: "/assets/briefing/signal/gate.png",
			duration: 11000,
			kicker: "THE FIRST GATE",
			title: "You are inside.",
			copy: "The Signal has opened. This page is the threshold, not the rooms.",
		},
		{
			id: "happening",
			plate: "/assets/briefing/signal/library.png",
			duration: 13000,
			kicker: "WHAT IS HAPPENING",
			title: "Checkout has finished.",
			copy: "Your seat is now in your Whop library, not on this storefront. Open the library to claim the files and walk the rooms.",
		},
		{
			id: "nocard",
			plate: "/assets/briefing/signal/gate.png",
			duration: 10000,
			kicker: "NO CARD",
			title: "The gate is free, forever.",
			copy: "Nothing was asked of the card. Nothing was taken. The gate stays open.",
		},
		{
			id: "dispatches",
			plate: "/assets/briefing/signal/dispatches.png",
			duration: 14000,
			kicker: "I · DISPATCHES",
			title: "Check here first.",
			copy: "Dispatches is the forum. New realms are posted here twenty-four hours before the feed.",
		},
		{
			id: "vision",
			plate: "/assets/briefing/signal/vision.png",
			duration: 15000,
			kicker: "II · THE FIRST VISION",
			title: "A ten-page gift.",
			copy: "In your files: The First Vision. It names six chambers. Read it before you walk the rooms.",
		},
		{
			id: "rooms",
			plate: "/assets/briefing/signal/chambers.png",
			duration: 11000,
			kicker: "THE ROOMS",
			title: "Six chambers, one gate.",
			copy: "Chats named The Signal, The Realm, The Process, The Records, The Session, and Field Journal.",
		},
		{
			id: "signal-realm",
			plate: "/assets/briefing/signal/chambers.png",
			duration: 16000,
			kicker: "THE SIGNAL · THE REALM",
			title: "The open gate, then the being.",
			copy: "Every realm drops in The Signal first. The Realm is where the month's new being is met.",
		},
		{
			id: "process-records",
			plate: "/assets/briefing/signal/chambers.png",
			duration: 16000,
			kicker: "THE PROCESS · THE RECORDS",
			title: "Behind the veil, then the lore.",
			copy: "The Process shows how the vision was made. The Records hold the story beneath the image.",
		},
		{
			id: "session-journal",
			plate: "/assets/briefing/signal/chambers.png",
			duration: 16000,
			kicker: "THE SESSION · FIELD JOURNAL",
			title: "Live, then write.",
			copy: "The Session is the live build, your questions, the vote. Field Journal is your notes as you travel.",
		},
		{
			id: "sanctuary",
			plate: "/assets/briefing/shared/sanctuary.png",
			duration: 12000,
			kicker: "IV · THE SANCTUARY",
			title: "You are not alone.",
			copy: "A shared room for every Traveller who has entered a gate.",
		},
		{
			id: "calendar",
			plate: "/assets/briefing/watcher/moon.png",
			duration: 13000,
			kicker: "III · THE CALENDAR",
			title: "The moon keeps time.",
			copy: "The moon calendar, the domain polls, and the founding windows are announced in The Signal first.",
		},
		{
			id: "now",
			plate: "/assets/briefing/codex/path.png",
			duration: 16000,
			kicker: "WHAT TO DO NOW",
			title: "Open your library.",
			copy: "Read The First Vision. Keep Dispatches close. Watcher, The Codex, and the Collector's Edition are later gates. They are not required to stay.",
		},
	],
};

const CODEX: GateBriefing = {
	id: "codex",
	planId: "plan_EtmvofR7vSluk",
	productTitle: "The Codex",
	library: GATE_LIBRARIES.codex,
	endKicker: "THE BOOK IS OPEN",
	endTitle: "Read the first three tonight.",
	cta: "Open the Codex",
	scenes: [
		{
			id: "threshold",
			plate: "/assets/briefing/codex/gate.png",
			duration: 11000,
			kicker: "THE BOOK",
			title: "The Codex has opened.",
			copy: "This page is the threshold. The book itself waits in your Whop library.",
		},
		{
			id: "happening",
			plate: "/assets/briefing/codex/files.png",
			duration: 13000,
			kicker: "WHAT IS HAPPENING",
			title: "Checkout has finished.",
			copy: "PDF and EPUB are already in your library. Nothing else ships. Open the library to take the files.",
		},
		{
			id: "offering",
			plate: "/assets/briefing/codex/gate.png",
			duration: 10000,
			kicker: "THE OFFERING",
			title: "Twenty-eight, once.",
			copy: "The Codex is a one-time gate. No moon. No card on a cycle.",
		},
		{
			id: "beings",
			plate: "/assets/briefing/codex/beings.png",
			duration: 16000,
			kicker: "I · FIFTEEN BEINGS",
			title: "The host has names.",
			copy: "Fifteen plates. 101 pages. Ophanim, Seraphim, Cherubim, the Herald, Metatron, the Watchers, the Nephilim, the Anunnaki, and more.",
		},
		{
			id: "keys",
			plate: "/assets/briefing/codex/keys.png",
			duration: 15000,
			kicker: "II · FOUR KEYS",
			title: "Each entry gives four things.",
			copy: "The Encounter. The Records. Recognition. The Protocol. That is how you read a being.",
		},
		{
			id: "nights",
			plate: "/assets/briefing/codex/nights.png",
			duration: 16000,
			kicker: "III · SEVEN NIGHTS",
			title: "Read three tonight.",
			copy: "If the book names nothing you saw, message within seven days and the offering returns. Keep the files.",
		},
		{
			id: "files",
			plate: "/assets/briefing/codex/files.png",
			duration: 12000,
			kicker: "THE FILES",
			title: "Instant, two forms.",
			copy: "PDF and EPUB. There is no print in this gate. The watching continues at @numinous2.0.",
		},
		{
			id: "room",
			plate: "/assets/briefing/codex/files.png",
			duration: 11000,
			kicker: "THE ROOM",
			title: "One files chamber.",
			copy: "Inside the library: The Codex files. That is the book. There is no second download.",
		},
		{
			id: "sanctuary",
			plate: "/assets/briefing/shared/sanctuary.png",
			duration: 12000,
			kicker: "THE SANCTUARY",
			title: "You are not alone.",
			copy: "A shared room for every Traveller who has entered a gate.",
		},
		{
			id: "now",
			plate: "/assets/briefing/codex/path.png",
			duration: 16000,
			kicker: "WHAT TO DO NOW",
			title: "Open the library.",
			copy: "Take PDF and EPUB. Read the first three entries tonight. Watcher and the Collector's Edition are later gates. They are not required to keep the book.",
		},
	],
};

const WATCHER: GateBriefing = {
	id: "watcher",
	planId: "plan_PQnMYNixMTjRQ",
	productTitle: "Watcher",
	library: GATE_LIBRARIES.watcher,
	endKicker: "THE SEAT IS TAKEN",
	endTitle: "The moon has started.",
	cta: "Open your seat",
	video: "/assets/briefing/films/watcher-briefing-1440.mp4",
	scenes: [
		{
			id: "threshold",
			plate: "/assets/briefing/watcher/moon.png",
			duration: 11000,
			kicker: "WATCHER · $28 A MOON",
			title: "You have taken a seat.",
			copy: "This page is the threshold. The Numinary itself waits in your Whop library.",
		},
		{
			id: "happening",
			plate: "/assets/briefing/signal/library.png",
			duration: 13000,
			kicker: "WHAT IS HAPPENING",
			title: "Checkout has finished.",
			copy: "Your membership is in the library, not on this storefront. Open it to walk the rooms and take the files.",
		},
		{
			id: "cycle",
			plate: "/assets/briefing/watcher/moon.png",
			duration: 13000,
			kicker: "THE CYCLE",
			title: "Every twenty-eight days.",
			copy: "One full cycle of the realms. Four weeks. Then the moon turns and a new being arrives.",
		},
		{
			id: "realm",
			plate: "/assets/briefing/watcher/realm.png",
			duration: 14000,
			kicker: "WEEK I · THE REALM",
			title: "The month's new being.",
			copy: "Week one is first contact. The being is met here before it is anywhere else.",
		},
		{
			id: "process",
			plate: "/assets/briefing/watcher/process.png",
			duration: 14000,
			kicker: "WEEK II · THE PROCESS",
			title: "Behind the veil.",
			copy: "Week two shows how the vision was made. The craft, not only the image.",
		},
		{
			id: "records",
			plate: "/assets/briefing/watcher/records.png",
			duration: 14000,
			kicker: "WEEK III · THE RECORDS",
			title: "The lore deep-dive.",
			copy: "Week three is the story beneath the image. Names, history, the record.",
		},
		{
			id: "session",
			plate: "/assets/briefing/watcher/session.png",
			duration: 14000,
			kicker: "WEEK IV · THE SESSION",
			title: "Live, then the vote.",
			copy: "Week four is the live build, your questions, and the vote that turns the next moon.",
		},
		{
			id: "inside",
			plate: "/assets/briefing/watcher/vault.png",
			duration: 16000,
			kicker: "INSIDE THE ROOM",
			title: "Files that stay with the seat.",
			copy: "The Vault. Twelve studio cards. Fifteen realms of wallpaper. Member Files. They live in the library as long as the moon is paid.",
		},
		{
			id: "rooms",
			plate: "/assets/briefing/watcher/session.png",
			duration: 13000,
			kicker: "THE ROOMS",
			title: "Chat, forum, sanctuary.",
			copy: "The Numinary chat. The Numinary forum. The Sanctuary, shared with every Traveller.",
		},
		{
			id: "codex",
			plate: "/assets/briefing/codex/gate.png",
			duration: 12000,
			kicker: "THE CODEX",
			title: "The book stays its own gate.",
			copy: "The Codex is not inside Watcher. If you want the book, it remains a separate offering.",
		},
		{
			id: "volume",
			plate: "/assets/briefing/collector/volume2.png",
			duration: 12000,
			kicker: "VOLUME II",
			title: "The name you gave.",
			copy: "At checkout you were asked for a name. That name is bound into the Volume II credits. Cancel any moon.",
		},
		{
			id: "now",
			plate: "/assets/briefing/codex/path.png",
			duration: 16000,
			kicker: "WHAT TO DO NOW",
			title: "Open your seat.",
			copy: "Walk The Vault, the cards, and the wallpaper. Keep the forum close. The first week is The Realm. Cancel any moon if you must leave.",
		},
	],
};

const COLLECTOR: GateBriefing = {
	id: "collector",
	planId: "plan_Ba7RP5OIbNcbE",
	productTitle: "Collector's Edition",
	library: GATE_LIBRARIES.collector,
	endKicker: "YOUR NUMBER IS CLAIMED",
	endTitle: "The edition has your name.",
	cta: "Open the edition",
	scenes: [
		{
			id: "threshold",
			plate: "/assets/briefing/collector/shelf.png",
			duration: 12000,
			kicker: "TWENTY-EIGHT COPIES",
			title: "Your number is claimed.",
			copy: "Hand-numbered. Once they are gone, they are gone. This page is the threshold.",
		},
		{
			id: "happening",
			plate: "/assets/briefing/codex/files.png",
			duration: 13000,
			kicker: "WHAT IS HAPPENING",
			title: "Checkout has finished.",
			copy: "Instant Codex files are already in your library. The numbered page is made by hand.",
		},
		{
			id: "codex",
			plate: "/assets/briefing/codex/gate.png",
			duration: 13000,
			kicker: "THE CODEX",
			title: "The whole book, now.",
			copy: "Everything in The Codex is yours: fifteen beings, 101 pages, PDF and EPUB, instant.",
		},
		{
			id: "name",
			plate: "/assets/briefing/collector/name.png",
			duration: 14000,
			kicker: "YOUR NAME",
			title: "Bound into Volume I.",
			copy: "The name given at checkout is bound into the credits of Volume I's numbered edition.",
		},
		{
			id: "number",
			plate: "/assets/briefing/collector/number.png",
			duration: 14000,
			kicker: "THE NUMBER",
			title: "Within forty-eight hours.",
			copy: "The personalized numbered PDF goes out by hand within 48 hours. Watch the library, then your messages.",
		},
		{
			id: "wallpaper",
			plate: "/assets/briefing/collector/wallpaper.png",
			duration: 13000,
			kicker: "WALLPAPER VAULT",
			title: "Fifteen realms, included.",
			copy: "The Wallpaper Vault is inside this edition. Fifteen realms, cropped for every screen.",
		},
		{
			id: "vision",
			plate: "/assets/briefing/signal/vision.png",
			duration: 11000,
			kicker: "THE FIRST VISION",
			title: "The ten-page gift as well.",
			copy: "The First Vision sits in your files beside the Codex. Read it if you have not walked a gate before.",
		},
		{
			id: "volume2",
			plate: "/assets/briefing/collector/volume2.png",
			duration: 13000,
			kicker: "VOLUME II",
			title: "First claim, before it opens.",
			copy: "This number holds first claim on Volume II before the gate opens to anyone else.",
		},
		{
			id: "binding",
			plate: "/assets/briefing/collector/binding.png",
			duration: 12000,
			kicker: "THE BINDING",
			title: "A private room.",
			copy: "The Binding is the Collector chat. Use it if the numbered page needs a name corrected.",
		},
		{
			id: "sanctuary",
			plate: "/assets/briefing/shared/sanctuary.png",
			duration: 11000,
			kicker: "THE SANCTUARY",
			title: "You are not alone.",
			copy: "A shared room for every Traveller who has entered a gate.",
		},
		{
			id: "final",
			plate: "/assets/briefing/collector/shelf.png",
			duration: 12000,
			kicker: "SALES ARE FINAL",
			title: "This gate does not return.",
			copy: "Collector copies are final. The Seven Nights belong to The Codex alone, not to a numbered edition.",
		},
		{
			id: "now",
			plate: "/assets/briefing/codex/path.png",
			duration: 16000,
			kicker: "WHAT TO DO NOW",
			title: "Open the edition.",
			copy: "Take the Codex files and the Wallpaper Vault now. The numbered PDF follows within 48 hours. Watcher is a later moon. It is not required to keep this number.",
		},
	],
};

export const GATE_BRIEFINGS: GateBriefing[] = [SIGNAL, CODEX, WATCHER, COLLECTOR];

const SIGNAL_INVITE: GateBriefing = {
	id: "signal-invite",
	planId: "plan_5IYhtCsv2Buv1",
	productTitle: "The Signal",
	library: GATE_LIBRARIES.signal,
	endKicker: "THE FIRST GATE",
	endTitle: "Enter, then the rooms.",
	cta: "Enter the Signal",
	video: "/assets/briefing/films/signal-invite-1440.mp4",
	scenes: [
		{
			id: "open",
			plate: "/assets/briefing/signal/gate.png",
			duration: 10000,
			kicker: "THE FIRST GATE",
			title: "The Signal is open.",
			copy: "Free, forever. No card. This is the threshold. The rooms wait on the other side.",
		},
		{
			id: "dispatches",
			plate: "/assets/briefing/signal/dispatches.png",
			duration: 12000,
			kicker: "I · DISPATCHES",
			title: "Check here first.",
			copy: "New realms are posted here twenty-four hours before the feed.",
		},
		{
			id: "vision",
			plate: "/assets/briefing/signal/vision.png",
			duration: 12000,
			kicker: "II · THE FIRST VISION",
			title: "A ten-page gift.",
			copy: "It names six chambers. Read it before you walk the rooms.",
		},
		{
			id: "rooms",
			plate: "/assets/briefing/signal/chambers.png",
			duration: 12000,
			kicker: "THE ROOMS",
			title: "Six chambers, one gate.",
			copy: "The Signal, The Realm, The Process, The Records, The Session, and Field Journal.",
		},
		{
			id: "calendar",
			plate: "/assets/briefing/watcher/moon.png",
			duration: 10000,
			kicker: "III · THE CALENDAR",
			title: "The moon keeps time.",
			copy: "The moon calendar, the domain polls, and the founding windows are announced here first.",
		},
		{
			id: "sanctuary",
			plate: "/assets/briefing/shared/sanctuary.png",
			duration: 10000,
			kicker: "IV · THE SANCTUARY",
			title: "You are not alone.",
			copy: "A shared room for every Traveller who has entered a gate.",
		},
		{
			id: "now",
			plate: "/assets/briefing/codex/path.png",
			duration: 14000,
			kicker: "WHAT TO DO NOW",
			title: "Enter the Signal.",
			copy: "Nothing is asked of the card. After you enter, a briefing opens the rooms in your library.",
		},
	],
};

const CODEX_INVITE: GateBriefing = {
	id: "codex-invite",
	planId: "plan_EtmvofR7vSluk",
	productTitle: "The Codex",
	library: GATE_LIBRARIES.codex,
	endKicker: "THE BOOK",
	endTitle: "Open the Codex.",
	cta: "Open the Codex",
	scenes: [
		{
			id: "open",
			plate: "/assets/briefing/codex/gate.png",
			duration: 10000,
			kicker: "THE BOOK",
			title: "The Codex waits.",
			copy: "Fifteen beings. 101 pages. Twenty-eight, once. No moon. No card on a cycle.",
		},
		{
			id: "beings",
			plate: "/assets/briefing/codex/beings.png",
			duration: 14000,
			kicker: "I · FIFTEEN BEINGS",
			title: "The host has names.",
			copy: "Ophanim, Seraphim, Cherubim, the Herald, Metatron, the Watchers, the Nephilim, the Anunnaki, and more.",
		},
		{
			id: "keys",
			plate: "/assets/briefing/codex/keys.png",
			duration: 12000,
			kicker: "II · FOUR KEYS",
			title: "Each entry gives four things.",
			copy: "The Encounter. The Records. Recognition. The Protocol. That is how you read a being.",
		},
		{
			id: "nights",
			plate: "/assets/briefing/codex/nights.png",
			duration: 14000,
			kicker: "III · SEVEN NIGHTS",
			title: "Read three tonight.",
			copy: "If the book names nothing you saw, message within seven days and the offering returns. Keep the files.",
		},
		{
			id: "files",
			plate: "/assets/briefing/codex/files.png",
			duration: 10000,
			kicker: "THE FILES",
			title: "Instant, two forms.",
			copy: "PDF and EPUB. There is no print in this gate. They land in your library the moment the offering passes.",
		},
		{
			id: "now",
			plate: "/assets/briefing/codex/path.png",
			duration: 14000,
			kicker: "WHAT TO DO NOW",
			title: "Open the Codex.",
			copy: "After the offering, a briefing opens the book. Watcher and the Collector's Edition are later gates.",
		},
	],
};

const WATCHER_INVITE: GateBriefing = {
	id: "watcher-invite",
	planId: "plan_PQnMYNixMTjRQ",
	productTitle: "Watcher",
	library: GATE_LIBRARIES.watcher,
	endKicker: "WATCHER · $28 A MOON",
	endTitle: "Take a seat.",
	cta: "Take a seat",
	video: "/assets/briefing/films/watcher-invite-1440.mp4",
	scenes: [
		{
			id: "open",
			plate: "/assets/briefing/watcher/moon.png",
			duration: 10000,
			kicker: "WATCHER · $28 A MOON",
			title: "The seat is open.",
			copy: "One full cycle of the realms. Four weeks. Then the moon turns and a new being arrives.",
		},
		{
			id: "weeks",
			plate: "/assets/briefing/watcher/realm.png",
			duration: 14000,
			kicker: "THE FOUR WEEKS",
			title: "Realm, Process, Records, Session.",
			copy: "Week one is first contact. Week two is the craft. Week three is the lore. Week four is the live build, your questions, the vote.",
		},
		{
			id: "inside",
			plate: "/assets/briefing/watcher/realm.png",
			duration: 14000,
			kicker: "THE FOUR WEEKS",
			title: "Four parts make one moon.",
			copy: "The Realm. The Process. The Records. The Session. One cycle runs for twenty-eight days.",
		},
		{
			id: "rooms",
			plate: "/assets/briefing/watcher/session.png",
			duration: 11000,
			kicker: "THE SESSION",
			title: "Join the live build.",
			copy: "Week four brings the live build, member questions, and the vote for the next moon.",
		},
		{
			id: "cycle",
			plate: "/assets/briefing/watcher/records.png",
			duration: 10000,
			kicker: "THE MEMBERSHIP",
			title: "One Watcher cycle.",
			copy: "Follow the same four weekly chapters each moon. Cancel any moon.",
		},
		{
			id: "now",
			plate: "/assets/briefing/watcher/session.png",
			duration: 14000,
			kicker: "WHAT TO DO NOW",
			title: "Start with seven nights.",
			copy: "Begin your 7-night trial. Then Watcher is $28 every 28 days. Cancel any moon.",
		},
	],
};

const COLLECTOR_INVITE: GateBriefing = {
	id: "collector-invite",
	planId: "plan_Ba7RP5OIbNcbE",
	productTitle: "Collector's Edition",
	library: GATE_LIBRARIES.collector,
	endKicker: "TWENTY-EIGHT COPIES",
	endTitle: "Claim a number.",
	cta: "Claim a number",
	scenes: [
		{
			id: "open",
			plate: "/assets/briefing/collector/shelf.png",
			duration: 12000,
			kicker: "TWENTY-EIGHT COPIES",
			title: "Hand-numbered.",
			copy: "Once they are gone, they are gone. Instant Codex files. The numbered page is made by hand.",
		},
		{
			id: "codex",
			plate: "/assets/briefing/codex/gate.png",
			duration: 12000,
			kicker: "THE CODEX",
			title: "The whole book, included.",
			copy: "Fifteen beings, 101 pages, PDF and EPUB, the moment the offering passes.",
		},
		{
			id: "name",
			plate: "/assets/briefing/collector/name.png",
			duration: 12000,
			kicker: "YOUR NAME",
			title: "Bound into Volume I.",
			copy: "The name given at the gate is bound into the credits of Volume I's numbered edition.",
		},
		{
			id: "number",
			plate: "/assets/briefing/collector/number.png",
			duration: 12000,
			kicker: "THE NUMBER",
			title: "Within forty-eight hours.",
			copy: "The personalized numbered PDF goes out by hand within 48 hours.",
		},
		{
			id: "vault",
			plate: "/assets/briefing/collector/wallpaper.png",
			duration: 12000,
			kicker: "THE VAULT · VOLUME II",
			title: "Wallpaper, and first claim.",
			copy: "Fifteen realms of wallpaper, included. This number holds first claim on Volume II.",
		},
		{
			id: "final",
			plate: "/assets/briefing/collector/shelf.png",
			duration: 10000,
			kicker: "SALES ARE FINAL",
			title: "This gate does not return.",
			copy: "Collector copies are final. The Seven Nights belong to The Codex alone.",
		},
		{
			id: "now",
			plate: "/assets/briefing/codex/path.png",
			duration: 14000,
			kicker: "WHAT TO DO NOW",
			title: "Claim a number.",
			copy: "After you enter, a briefing opens the edition. Codex files wait in your library tonight.",
		},
	],
};

export const GATE_INVITES: GateBriefing[] = [
	SIGNAL_INVITE,
	CODEX_INVITE,
	WATCHER_INVITE,
	COLLECTOR_INVITE,
];

export function briefingForPlan(planId: string | undefined): GateBriefing | null {
	if (!planId) return null;
	return GATE_BRIEFINGS.find((entry) => entry.planId === planId) ?? null;
}

export function inviteForPlan(planId: string | undefined): GateBriefing | null {
	if (!planId) return null;
	return GATE_INVITES.find((entry) => entry.planId === planId) ?? null;
}

export function briefingDuration(briefing: GateBriefing): number {
	return briefing.scenes.reduce((total, scene) => total + scene.duration, 0);
}

export function sceneAt(
	briefing: GateBriefing,
	ms: number,
): { index: number; start: number; scene: BriefingScene } {
	const first = briefing.scenes[0];
	if (!first) {
		throw new Error("Briefing has no scenes");
	}
	let start = 0;
	for (let i = 0; i < briefing.scenes.length; i++) {
		const scene = briefing.scenes[i];
		if (!scene) continue;
		const next = start + scene.duration;
		if (ms < next || i === briefing.scenes.length - 1) {
			return { index: i, start, scene };
		}
		start = next;
	}
	return { index: 0, start: 0, scene: first };
}

export function formatFilmTime(ms: number): string {
	const total = Math.max(0, Math.floor(ms / 1000));
	const minutes = Math.floor(total / 60);
	const seconds = total % 60;
	return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
