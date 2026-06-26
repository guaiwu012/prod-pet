import { PageHeader } from "./PageHeader";

interface EmptyPageProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function EmptyPage({ eyebrow, title, description }: EmptyPageProps) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <section className="panel empty-page">
        <span>施工中</span>
        <h2>这个房间下一轮开放</h2>
        <p>{description}</p>
      </section>
    </>
  );
}
