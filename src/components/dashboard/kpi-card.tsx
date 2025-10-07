import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type KPICardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeDescription?: string;
};

export default function KPICard({
  title,
  value,
  icon,
  change,
  changeDescription,
}: KPICardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground">
            <span className="text-primary font-semibold">{change}</span> {changeDescription}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
