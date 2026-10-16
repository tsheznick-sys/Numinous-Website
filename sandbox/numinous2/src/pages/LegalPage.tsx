import { useParams } from 'react-router-dom';
import { MotionPage, MotionSection } from '../components/Motion';
import { legalRecords } from '../data';

export function LegalPage() {
 const key = useParams().record ?? 'terms'; const record = legalRecords[key] ?? legalRecords.terms;
 return <MotionPage className="legal-page"><header><p className="eyebrow">{record.kicker}</p><h1>{record.title}</h1><p>{record.introduction}</p></header><div className="legal-page__body">{record.sections.map((section, index) => <MotionSection key={section.heading} delay={index * .06}><span>{String(index + 1).padStart(2, '0')}</span><div><h2>{section.heading}</h2><p>{section.copy}</p></div></MotionSection>)}</div></MotionPage>;
}
