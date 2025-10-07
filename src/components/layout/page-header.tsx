type PageHeaderProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export default function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <header className="p-4 sm:p-6 border-b">
      <div className="flex items-center justify-between">
        <div className="grid gap-1">
            <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
            {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {children && <div>{children}</div>}
      </div>
    </header>
  );
}
