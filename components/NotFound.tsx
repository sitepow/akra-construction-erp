import { Button } from '@nextui-org/react';
import { ArrowUpLeft, Frown } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push('/');
    }, 3000);
  }, []);

  return (
    <div className="flex items-center p-5 justify-center">
      <div className="text-center">
        <div className="flex flex-col gap-2 items-center">
          <Frown size={80} className="text-danger-800" />
          <h1 className="text-4xl font-bold text-danger-800">
            404 Page Not Found
          </h1>
        </div>

        <p className="mt-4 text-lg text-gray-600">
          Sorry, we couldn't find the post you were looking for.
        </p>
        <p className="mt-2 text-lg text-gray-600">
          ขอโทษค่ะ ไม่สามารถค้นหาบทความที่คุณกำลังมองหาได้
        </p>
        <Button
          radius="full"
          startContent={<ArrowUpLeft />}
          className="mt-5"
          onClick={() => {
            router.push('/');
          }}
        >
          กลับไปหน้าแรก
        </Button>
      </div>
    </div>
  );
}
