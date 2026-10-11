import { selectManifest } from "@whop/template-kit";

export const MANIFEST = selectManifest([
	"listProducts",
	"retrieveProduct",
	"listPlans",
	"retrievePlan",
]);
