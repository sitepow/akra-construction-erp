import { Menu, MenuItem, Sidebar, SubMenu } from 'react-pro-sidebar';
import { useRouter } from 'next/router';
import { ScrollShadow } from '@nextui-org/react';
import { mdiFolderOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';
import { PanelRightOpen } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setRootState } from '@/redux/slice/rootState';

export default function SidebarLayout() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [openSubMenus, setOpenSubMenus] = useState<number[]>([]);
  const isSidebarCollapsed = useSelector(
    (state: any) => state?.rootState?.isSidebarCollapsed
  );
  const menuLists = useSelector((state: any) => state?.rootState?.menuLists);

  const toggleSidebar = () => {
    dispatch(
      setRootState({ key: `isSidebarCollapsed`, value: !isSidebarCollapsed })
    );
  };

  const handleSubMenuClick = (index: number) => {
    setOpenSubMenus((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const renderMenuItems = (items: any[], level = 0) => {
    return items.map((item, index) => {
      if (item.subCategories && item.subCategories.length > 0) {
        return (
          <SubMenu
            key={`${level}-${index}`}
            icon={
              item.icon ? (
                <Icon
                  path={item.icon}
                  className="fill-current text-gray"
                  size={1}
                />
              ) : (
                <Icon
                  path={mdiFolderOutline}
                  className="fill-current text-gray"
                  size={1}
                />
              )
            }
            label={`${item.title}${item?.lock ? ` (ล็อก)` : ''}`}
            open={openSubMenus.includes(index)}
            onOpenChange={() => handleSubMenuClick(index)}
          >
            {renderMenuItems(item.subCategories, level + 1)}
          </SubMenu>
        );
      } else {
        return (
          <MenuItem
            key={`${level}-${index}`}
            className={`${item?.divider && 'border-b dark:border-dark'}`}
            onClick={() => {
              if (item.newTap) {
                window.open(item.url, '_blank');
              } else {
                router.push(item.url);
              }
            }}
            icon={
              item.icon ? (
                <Icon
                  path={item.icon}
                  className={`fill-current text-gray`}
                  size={1}
                />
              ) : (
                <Icon
                  path={mdiFolderOutline}
                  className={`fill-current text-gray`}
                  size={1}
                />
              )
            }
          >
            {item.title}
            {item?.lock ? ` (ล็อก)` : ''}
          </MenuItem>
        );
      }
    });
  };

  return (
    <Sidebar collapsed={isSidebarCollapsed} className="w-full bg-transparent">
      <Menu>
        <ScrollShadow className="max-h-screen">
          <MenuItem
            onClick={toggleSidebar}
            icon={<PanelRightOpen className="text-gray" />}
          >
            ซ่อนเมนู
          </MenuItem>
          {renderMenuItems(menuLists)}
        </ScrollShadow>
      </Menu>
    </Sidebar>
  );
}
