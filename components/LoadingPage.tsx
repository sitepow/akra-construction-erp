import { Spinner } from '@nextui-org/react';

export default function LoadingPage() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col gap-2.5 items-center justify-center bg-[#ffffffe0] dark:bg-[#000000e0]">
      <Spinner />
      <span>กำลังโหลด...</span>
    </div>
  );
}
