type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 max-w-2xl text-slate-600">{description}</p>
      <p className="mt-4 text-sm text-slate-500">
        Esta área será implementada nas próximas fases.
      </p>
    </section>
  );
}
