import { ReactNode } from 'react';

export default function HeaderTitle({
  title,
  className,
  type,
  control,
}: {
  title: string;
  className?: string;
  type?: string;
  control?: ReactNode;
}) {
  return (
    <>
      {type === 'h1' ? (
        <div className="flex items-center justify-between w-full flex-wrap gap-5">
          <h1 className={`font-bold z-30 text-lg ${className}`}>{title}</h1>
          {control}
        </div>
      ) : (
        <div className="flex items-center justify-between w-full flex-wrap gap-5">
          <h2 className={`font-bold z-30 text-lg ${className}`}>{title}</h2>
          {control}
        </div>
      )}
    </>
  );
}
