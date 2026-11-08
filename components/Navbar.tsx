import {
  NavbarContent,
  NavbarItem,
  Navbar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
  Link,
  Button,
  DropdownSection,
  useDisclosure,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Card,
  CardBody,
} from '@nextui-org/react';
import { useRouter } from 'next/router';
import { ThemeSwitcher } from './ThemeSwitcher';
import { ArrowRight, EllipsisVertical } from 'lucide-react';
import { menu } from '@/utils/menu';
import Icon from '@mdi/react';
import {
  mdiFolderOutline,
  mdiHome,
  mdiLogin,
  mdiThemeLightDark,
} from '@mdi/js';
import getSession from '@/utils/session';
import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function NavbarCustom() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();
  const { session } = getSession() as any;
  const { theme, setTheme } = useNextTheme();
  const [checked, setChecked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [subCategories, setSubCategories] = useState<any>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setChecked(theme === 'dark');
    }
  }, [theme, mounted]);

  const handleChangeTheme = () => {
    const newTheme = checked ? 'light' : 'dark';
    setTheme(newTheme);
    setChecked(!checked);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={() => {
          setSubCategories([]);
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>เมนูย่อย</ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-2 gap-2.5">
                  {subCategories?.map((item: any) => {
                    return (
                      <Card>
                        <CardBody>
                          <div
                            className="flex flex-wrap gap-2.5"
                            onClick={() => {
                              router.push(item?.url);
                            }}
                          >
                            <Icon
                              path={item.icon}
                              className={`fill-current text-neutral-400 dark:text-white`}
                              size={1}
                            />

                            <span>{item?.title}</span>
                          </div>
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              </ModalBody>
              <ModalFooter></ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Navbar maxWidth="full" isBordered isBlurred={false}>
        <NavbarContent>
          <span
            onClick={() => {
              router.push('/');
            }}
            className="font-bold cursor-pointer flex flex-wrap items-center gap-2.5"
          >
            <span>
              {session?.company?.name || 'ห้างหุ้นส่วนจำกัด อัครวิศว์ก่อสร้าง'}
            </span>
          </span>
        </NavbarContent>

        {session && session?.isLoggedIn && (
          <NavbarContent justify="end" className="hidden lg:flex">
            <NavbarItem>
              <div className="flex gap-2 items-center">
                <div className="flex gap-2.5">
                  <ThemeSwitcher />
                  <Button isIconOnly variant="flat" radius="full">
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth={0}
                      viewBox="0 0 16 16"
                      className="text-neutral-400 dark:text-white text-lg"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286zm1.634-.736L5.5 3.956h-.049l-.679 2.022z" />
                      <path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm7.138 9.995q.289.451.63.846c-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6 6 0 0 1-.415-.492 2 2 0 0 1-.94.31" />
                    </svg>
                  </Button>
                </div>

                <Dropdown placement="bottom-end">
                  <DropdownTrigger className="border-none">
                    <User
                      name={session?.name || '-'}
                      description={<Link>{session?.email || '-'}</Link>}
                      avatarProps={{
                        src: '/uploads/profile-no-image.png',
                      }}
                    />
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Profile Actions" variant="flat">
                    <DropdownItem key="profile" className="h-14 gap-2">
                      <p className="font-semibold">เข้าสู่ระบบด้วย</p>
                      <p className="font-semibold">{session?.email}</p>
                    </DropdownItem>
                    <DropdownItem
                      onAction={async () => {
                        await axios.post('/api/user/logout');
                        router.replace('/login');
                      }}
                      key={'logout'}
                    >
                      <span className="text-danger-800">ออกจากระบบ</span>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </NavbarItem>
          </NavbarContent>
        )}

        <NavbarContent className="lg:hidden" justify="end">
          <Dropdown>
            <DropdownTrigger>
              <EllipsisVertical className="cursor-pointer" />
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Static Actions"
              className="max-h-96 overflow-y-auto"
            >
              <DropdownSection showDivider>
                <DropdownItem
                  onAction={() => {
                    router.push('/');
                  }}
                  startContent={
                    <Icon
                      path={mdiHome}
                      className="fill-current text-neutral-400 dark:text-white"
                      size={1}
                    />
                  }
                  key="index"
                >
                  หน้าแรก
                </DropdownItem>
                <DropdownItem
                  onAction={() => {
                    handleChangeTheme();
                  }}
                  startContent={
                    <Icon
                      path={mdiThemeLightDark}
                      className="fill-current text-neutral-400 dark:text-white"
                      size={1}
                    />
                  }
                  key="switchTheme"
                >
                  สลับธีมเว็บไซต์
                </DropdownItem>
                {session && !session?.isLoggedIn ? (
                  <DropdownItem
                    onAction={() => {
                      router.push('/login');
                    }}
                    startContent={
                      <Icon
                        path={mdiLogin}
                        className="fill-current text-neutral-400 dark:text-white"
                        size={1}
                      />
                    }
                    key="login"
                  >
                    เข้าสู่ระบบ
                  </DropdownItem>
                ) : null}
                {session && session?.isLoggedIn ? (
                  <DropdownItem
                    onAction={async () => {
                      await axios.post('/api/user/logout');
                      router.replace('/login');
                    }}
                    startContent={
                      <Icon
                        path={mdiLogin}
                        className="fill-current text-neutral-400 dark:text-white"
                        size={1}
                      />
                    }
                    key="login"
                  >
                    ออกจากระบบ
                  </DropdownItem>
                ) : null}
              </DropdownSection>

              <DropdownSection>
                {menu()?.map((item: any, index: number) => (
                  <DropdownItem
                    onAction={() => {
                      if (
                        Array.isArray(item?.subCategories) &&
                        item?.subCategories.length > 0
                      ) {
                        setSubCategories(item?.subCategories);
                        onOpen();
                      } else if (item?.url) {
                        router.push(item?.url);
                      } else {
                        console.error('Invalid menu item:', item);
                      }
                    }}
                    startContent={
                      <Icon
                        path={item?.icon || mdiFolderOutline}
                        className="fill-current text-neutral-400 dark:text-white"
                        size={1}
                      />
                    }
                    key={index}
                  >
                    {item?.title}
                  </DropdownItem>
                ))}
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>

        {session && !session?.isLoggedIn && (
          <NavbarContent className="hidden lg:flex" justify="end">
            <Button
              radius="full"
              color="primary"
              endContent={<ArrowRight />}
              onClick={() => {
                router.push('/login');
              }}
            >
              เข้าสู่ระบบ
            </Button>
            <div className="flex gap-2.5">
              <ThemeSwitcher />
              <Button isIconOnly variant="flat" radius="full">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth={0}
                  viewBox="0 0 16 16"
                  className="text-neutral-400 dark:text-white text-lg"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286zm1.634-.736L5.5 3.956h-.049l-.679 2.022z" />
                  <path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm7.138 9.995q.289.451.63.846c-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6 6 0 0 1-.415-.492 2 2 0 0 1-.94.31" />
                </svg>
              </Button>
            </div>
          </NavbarContent>
        )}
      </Navbar>
    </>
  );
}
