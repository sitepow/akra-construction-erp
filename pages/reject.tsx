import Layout from '@/components/Layout';
import LoadingPage from '@/components/LoadingPage';
import { autoRedirectCurrentPermission } from '@/utils';
import getSession, { SessionData, sessionOptions } from '@/utils/session';
import { Button } from '@nextui-org/react';
import { getIronSession } from 'iron-session';
import { CircleAlert } from 'lucide-react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Page() {
  const { session } = getSession();
  const router = useRouter();
  const [screenLoading, setScreenLoading] = useState(false);

  useEffect(() => {
    if (session && !session?.isLoggedIn) {
      router.replace('/login');
    }
  }, []);

  return (
    <Layout sitename={'การเข้าถึงถูกปฏิเสธ'}>
      {screenLoading && <LoadingPage />}

      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-100 text-center">
        <CircleAlert size={50} className="text-red-600 mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-4">
          Access Denied / การเข้าถึงถูกปฏิเสธ
        </h1>
        <p className="text-lg md:text-xl text-gray-700">
          You do not have permission to view this page.
        </p>
        <p className="text-lg md:text-xl text-gray-700 mb-6">
          คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้
        </p>
        <p className="text-sm md:text-base text-gray-500">
          Please contact the administrator if you believe this is an error.{' '}
          <br />
          โปรดติดต่อผู้ดูแลระบบหากคุณเชื่อว่านี่คือข้อผิดพลาด
        </p>

        <Button
          radius="full"
          color="primary"
          className="mt-6"
          onClick={() => {
            try {
              setScreenLoading(true);
              autoRedirectCurrentPermission(session, router);
            } catch (error) {
              console.error(error);
            }
          }}
        >
          Go to Homepage / กลับหน้าแรก
        </Button>
      </div>
    </Layout>
  );
}

export const getServerSideProps = (async (context) => {
  const session = await getIronSession<SessionData>(
    context.req,
    context.res,
    sessionOptions
  );

  if (!session.isLoggedIn) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return { props: { session } };
}) satisfies GetServerSideProps<{
  session: SessionData;
}>;
