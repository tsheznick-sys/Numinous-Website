import { WorkCard } from "./WorkCard";

type ProductCardProps = {
	title: string;
	slug: string;
	image?: string;
	priceLabel?: string;
	headline?: string;
};

export function ProductCard({
	title,
	slug,
	image,
	priceLabel,
	headline,
}: ProductCardProps) {
	return (
		<WorkCard
			reveal={false}
			item={{
				id: slug,
				title,
				slug,
				image: image ?? null,
				priceLabel: priceLabel ?? null,
				headline: headline ?? null,
			}}
		/>
	);
}
