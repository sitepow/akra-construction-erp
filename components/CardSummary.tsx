import { Card } from '@nextui-org/react';
import { formatAmount } from '@/utils';

type CardSummaryProps = {
  label: string;
  value?: number;
  suffix?: string;
  className?: string;
  isMoney?: boolean;
  icon?: JSX.Element;
};

export default function CardSummary({
  label,
  value,
  className = '',
  suffix = '',
  isMoney = false,
}: CardSummaryProps) {
  const hasValue =
    value !== null && value !== undefined && !isNaN(value) && value !== 0;

  const formattedValue = hasValue
    ? isMoney
      ? `฿${formatAmount(value)}`
      : value.toLocaleString()
    : '-';

  return (
    <Card
      className={`h-full border dark:border-dark shadow-small p-5 flex flex-col sm:text-center`}
    >
      <span className="font-bold">{label}</span>
      <span className={`font-bold text-lg ${className} text-primary`}>
        {formattedValue}
      </span>
      {suffix && <span className="opacity-80">{suffix}</span>}
    </Card>
  );
}
