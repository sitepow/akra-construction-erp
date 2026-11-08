import HeaderTitle from '@/components/HeaderTitle';
import Layout from '@/components/Layout';
import { errorEmail, errorRequire, regexEmail } from '@/utils/regex';
import { Button, Card, Input, Select, SelectItem } from '@nextui-org/react';
import { ArrowRight, CircleCheck, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ForgotPasswordTempleteEmail from '@/components/template/ForgotPassword';
import { Notyf } from 'notyf';
import Image from 'next/image';
import axios from 'axios';
import useSWR from 'swr';
import { autoRedirectCurrentPermission, fetcher } from '@/utils';

function FeatureList(content: any) {
  return (
    <div className="flex gap-2 items-center text-wrap opacity-80">
      <CircleCheck />
      <span>{content}</span>
    </div>
  );
}

function LoginForm({ setIsResetPasswordPage, notyf, setScreenLoading }: any) {
  const router = useRouter();
  const { handleSubmit, control } = useForm();
  const [apiLoading, setApiLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const { data: company } = useSWR(`/api/dropdown?category=company`, fetcher);

  return (
    <Card
      className={`w-full sm:w-[70%] lg:w-[50%] xl:w-[45%] rounded-t-none justify-center rounded-b-large sm:rounded-r-large sm:rounded-l-none p-5`}
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={handleSubmit(async (data) => {
          try {
            setApiLoading(true);
            const { data: resData } = await axios.post(`/api/user/login`, data);
            setApiLoading(false);
            notyf.success(resData?.message);

            setScreenLoading(true);
            autoRedirectCurrentPermission(resData?.permissions, router);
          } catch (error: any) {
            console.log(error);
            setApiLoading(false);
            notyf.error(error?.response?.data?.message);
          }
        })}
      >
        <HeaderTitle title="เข้าสู่ระบบ" className="text-start" type="h1" />

        <Controller
          control={control}
          name="companyId"
          rules={{
            required: {
              value: true,
              message: errorRequire(),
            },
          }}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <Select
              variant="bordered"
              label="บริษัท"
              value={value as any}
              onChange={(range: any) => {
                onChange(range);
              }}
              isInvalid={!!error}
              errorMessage={error?.message}
            >
              {company?.map((item: any) => {
                return <SelectItem key={item?.id}>{item?.name}</SelectItem>;
              })}
            </Select>
          )}
        />

        <Controller
          control={control}
          name="email"
          rules={{
            required: {
              value: true,
              message: errorRequire(),
            },
            pattern: {
              value: regexEmail(),
              message: errorEmail(),
            },
          }}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <Input
              variant="bordered"
              label="อีเมล"
              value={value as any}
              onChange={(range: any) => {
                onChange(range);
              }}
              isInvalid={!!error}
              errorMessage={error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{
            required: {
              value: true,
              message: errorRequire(),
            },
          }}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <Input
              variant="bordered"
              type={showPassword ? 'password' : ''}
              endContent={
                showPassword ? (
                  <Eye
                    className="cursor-pointer opacity-50"
                    onClick={() => {
                      setShowPassword(false);
                    }}
                  />
                ) : (
                  <EyeOff
                    className="cursor-pointer opacity-50"
                    onClick={() => {
                      setShowPassword(true);
                    }}
                  />
                )
              }
              label="รหัสผ่าน"
              value={value as any}
              onChange={(range: any) => {
                onChange(range);
              }}
              isInvalid={!!error}
              errorMessage={error?.message}
            />
          )}
        />

        <div className="flex flex-col gap-2.5">
          <span>
            ลืมรหัสผ่านใช่หรือไม่?{' '}
            <span
              className="text-main cursor-pointer hover:underline font-bold"
              onClick={() => {
                setIsResetPasswordPage(true);
              }}
            >
              ขอรหัสผ่านใหม่
            </span>
          </span>
        </div>

        <div className="flex justify-center">
          <Button
            radius="full"
            startContent={!apiLoading && <ArrowRight className="opacity-50" />}
            type="submit"
            variant="bordered"
            isLoading={apiLoading}
          >
            {apiLoading ? 'กำลังติดต่อเซิฟเวอร์' : 'เข้าสู่ระบบ'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function ResetPasswordForm({ setIsResetPasswordPage, notyf }: any) {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();
  const [apiLoading, setApiLoading] = useState(false);

  return (
    <Card
      className={`w-full sm:w-[70%] lg:w-[50%] xl:w-[45%] rounded-t-none justify-center rounded-b-large sm:rounded-r-large sm:rounded-l-none p-5`}
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={handleSubmit(async (data) => {
          try {
            setApiLoading(true);

            // const forgotResponse = await axios.post(
            //   `/api/user/forgotPassword`,
            //   data
            // );

            const { email } = getValues();
            await axios.post('/api/user/sendEmail', {
              email: email,
              subject: `คำร้องขอรหัสผ่านใหม่ไซต์พาว`,
              message: ForgotPasswordTempleteEmail({
                host: process.env.NEXT_PUBLIC_API_URL,
                email: email,
                // password: forgotResponse?.data?.data?.password,
                password: 'test',
              }),
            });

            notyf.success(
              'ส่งอีเมลสำเร็จแล้ว โปรดตรวจสอบในอีเมลของคุณ หากไม่พบอีเมลในบัญชีของคุณโปรดรอ 1 - 2 นาที ค่อยขออีเมลใหม่อีกครั้ง'
            );

            setApiLoading(false);
            setTimeout(() => {
              setIsResetPasswordPage(false);
            }, 3000);
          } catch (error: any) {
            console.error(error);
            setApiLoading(false);
            notyf.error(error?.response?.data?.message);
          }
        })}
      >
        <HeaderTitle title="ลืมรหัสผ่าน?" className="text-start" type="h1" />
        <Input
          variant="bordered"
          label="อีเมล"
          {...register('email', {
            required: {
              value: true,
              message: errorRequire(),
            },
            pattern: {
              value: regexEmail(),
              message: errorEmail(),
            },
          })}
          isInvalid={!!errors.email}
          errorMessage={`${errors.email?.message}`}
        />
        <span className="opacity-80">
          เมื่อคุณกดดำเนินการต่อ ระบบจะส่งอีเมลพร้อมรหัสผ่านใหม่ไปให้ท่านในอีเมล
          โปรดตรวจสอบในถังขยะหากไม่พบอีเมลที่ระบบส่งไป
        </span>
        <span>
          ต้องการเข้าสู่ระบบหรือไม่?{' '}
          <span
            className="text-main cursor-pointer hover:underline font-bold"
            onClick={() => {
              setIsResetPasswordPage(false);
            }}
          >
            ไปที่หน้าเข้าสู่ระบบ
          </span>
        </span>

        <div className="flex justify-center">
          <Button
            radius="full"
            startContent={!apiLoading && <ArrowRight className="opacity-50" />}
            type="submit"
            variant="bordered"
            isLoading={apiLoading}
          >
            {apiLoading ? 'กำลังติดต่อเซิฟเวอร์' : 'ขอรหัสผ่านใหม่'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

import { SessionData, sessionOptions } from '@/utils/session';
import { getIronSession } from 'iron-session';
import { GetServerSideProps } from 'next';
import LoadingPage from '@/components/LoadingPage';

export default function Page() {
  const [notyf, setNotyf] = useState<any>(null);
  useEffect(() => {
    setNotyf(
      new Notyf({
        position: {
          x: 'right',
          y: 'top',
        },
        dismissible: true,
      })
    );
  }, []);
  const [isResetPasswordPage, setIsResetPasswordPage] = useState(false);
  const [screenLoading, setScreenLoading] = useState(false);

  return (
    <Layout sitename={'เข้าสู่ระบบ'}>
      {screenLoading && <LoadingPage />}

      <div className="flex justify-center">
        <div className="flex flex-col sm:flex-row w-full sm:w-[80%] xl:w-[65%]">
          <div className="overflow-hidden h-96 w-full lg:w-[70%] shadow-medium rounded-t-large sm:rounded-l-large sm:rounded-tr-none relative">
            <div className="w-full h-full bg-gradient-to-r flex flex-col gap-2.5 text-white p-5 from-black via-black absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="text-lg xl:text-xl font-bold">
                เข้าสู่ระบบในเว็บไซต์แล้วได้อะไรบ้าง?
              </span>
              <div className="gap-2.5 flex flex-col">
                {FeatureList(
                  'สามารถจัดการโครงการก่อสร้างได้อย่างมีประสิทธิภาพ'
                )}
                {FeatureList('ตรวจสอบและติดตามสถานะของงานได้ตลอดเวลา')}
                {FeatureList('บริหารจัดการทรัพยากรและงบประมาณได้อย่างแม่นยำ')}
                {FeatureList(
                  'เชื่อมต่อกับทีมงานและผู้เกี่ยวข้องได้อย่างรวดเร็ว'
                )}
                {FeatureList('รายงานและวิเคราะห์ข้อมูลโครงการได้แบบเรียลไทม์')}
              </div>
            </div>
            <Image
              src={'/uploads/auth.jpg'}
              width={500}
              height={500}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          {!isResetPasswordPage ? (
            <LoginForm
              setIsResetPasswordPage={setIsResetPasswordPage}
              notyf={notyf}
              setScreenLoading={setScreenLoading}
            />
          ) : (
            <ResetPasswordForm
              setIsResetPasswordPage={setIsResetPasswordPage}
              notyf={notyf}
            />
          )}
        </div>
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

  if (session.isLoggedIn) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return { props: { session } };
}) satisfies GetServerSideProps<{
  session: SessionData;
}>;
