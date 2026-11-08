import { useDispatch, useSelector } from 'react-redux';
import NavbarLayout from './Navbar';
import FooterLayout from './Footer';
import SidebarLayout from './Sidebar';
import { useMediaQuery } from 'react-responsive';
import { ReactNode, RefObject, useEffect } from 'react';
import getSession from '@/utils/session';
import { setRootState } from '@/redux/slice/rootState';
import { NextSeo } from 'next-seo';

interface LayoutProps {
  children?: ReactNode;
  mainRef?: RefObject<HTMLElement>;
  sitename?: any;
}

export default function Layout({ children, mainRef, sitename }: LayoutProps) {
  const { session } = getSession();
  const dispatch = useDispatch();
  const rawPermissions = session?.permissions;
  const isMobile = useMediaQuery({ maxWidth: 1020 });
  const isSidebarCollapsed = useSelector(
    (state: any) => state?.rootState?.isSidebarCollapsed
  );
  const rawMenuLists = useSelector((state: any) => state?.rootState?.menuLists);

  useEffect(() => {
    if (rawPermissions && rawPermissions?.length !== 0) {
      const permissions = JSON.parse(rawPermissions || '[]');
      const menuLists = rawMenuLists;

      const isLocked = (menuId: number | undefined): boolean => {
        const permission = permissions.find((perm: any) => perm.id == menuId);
        return permission?.permissions?.read === true;
      };

      const applyLock = (menuItems: any) => {
        return menuItems.map((menuItem: any) => {
          const lockedMenuItem = {
            ...menuItem,
            lock: !isLocked(menuItem.id),
          };

          if (menuItem.subCategories) {
            if (!isLocked(menuItem.id)) {
              lockedMenuItem.subCategories = applyLock(menuItem.subCategories);
            }
          }

          return lockedMenuItem;
        });
      };

      const applyLockMenuLists = applyLock(menuLists);
      dispatch(setRootState({ key: `menuLists`, value: applyLockMenuLists }));
    }
  }, [rawPermissions]);

  return (
    <>
      <NextSeo
        title={
          !sitename
            ? `${session?.company?.name || 'ห้างหุ้นส่วนจำกัด อัครวิศว์ก่อสร้าง'}`
            : `${sitename} - ${session?.company?.name || 'ห้างหุ้นส่วนจำกัด อัครวิศว์ก่อสร้าง'}`
        }
      />

      <div className={`flex h-screen ${!isMobile && 'overflow-hidden'}`}>
        <div className={`${isMobile ? 'w-full h-full' : 'flex flex-1'}`}>
          {!isMobile && (
            <aside className="h-full sticky top-0 z-50 border-r dark:border-dark">
              <SidebarLayout />
            </aside>
          )}

          <main
            ref={mainRef}
            className={`${
              isSidebarCollapsed
                ? 'w-[calc(100vw-80px)]'
                : 'w-[calc(100vw-250px)]'
            } ${isMobile && 'w-full'} flex flex-col overflow-y-auto dark:bg-[#121212]`}
          >
            <NavbarLayout />
            <div className={`px-6 py-2.5 flex flex-col gap-5`}>{children}</div>
            <FooterLayout />
          </main>
        </div>
      </div>
    </>
  );
}
