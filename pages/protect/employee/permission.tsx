import HeaderTitle from '@/components/HeaderTitle';
import Layout from '@/components/Layout';
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Checkbox,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Select,
  SelectItem,
  useDisclosure,
} from '@nextui-org/react';
import router from 'next/router';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { useEffect, useMemo, useState } from 'react';

import { mdiFilterOffOutline, mdiFilterOutline } from '@mdi/js';
import axios from 'axios';
import useSWR, { mutate } from 'swr';
import Icon from '@mdi/react';
import { useForm } from 'react-hook-form';
import PageLoading from '@/components/LoadingPage';
import { MenuItem } from '@mui/material';
import { errorRequire } from '@/utils/regex';
import { CircleCheck, Key, PlusIcon, Search, XIcon } from 'lucide-react';
import CardSummary from '@/components/CardSummary';
const initForm = {
  name: '',
};
import { Notyf } from 'notyf';
import { menu } from '@/utils/menu';
import { formatThaiDateTime, fetcher } from '@/utils';

import getSession from '@/utils/session';

export default function Page() {
  const { session } = getSession() as any;
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
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [modalScreenLoading, setModalScreenLoading] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [permissions, setPermissions] = useState<any[]>([]);

  const handlePermissionChange = (id: any, action: string, value: boolean) => {
    setPermissions((prev) => {
      const existingMenu = prev.find((item) => item.id === id);
      if (existingMenu) {
        return prev.map((item) =>
          item.id === id
            ? {
                ...item,
                permissions: {
                  ...item.permissions,
                  [action]: value,
                },
              }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id,
            permissions: { [action]: value },
          },
        ];
      }
    });
  };

  const [projectSelectId, setProjectSelectId] = useState<any>();
  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    reset: resetForm,
    formState: { errors: errorsForm },
  } = useForm({
    defaultValues: initForm,
  });

  const [pagination, setPagination] = useState({ pageIndex: 1, pageItem: 20 });
  const { data: companies } = useSWR(
    `/api/employee/permission?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: bankDashboard } = useSWR(
    `/api/dashboard?type=bank&companyId=${session?.company?.id}`,
    fetcher
  );

  const {
    isOpen: isOpenModal,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure();

  const formModal = () => {
    return (
      <Modal
        size="xl"
        scrollBehavior="inside"
        isOpen={isOpenModal}
        isDismissable={false}
        onClose={() => {
          resetForm(initForm);
          onCloseModal();
        }}
      >
        <ModalContent>
          <ModalHeader>
            <h2 className="text-xl font-bold text-foreground">
              {formMode === 'create'
                ? 'เพิ่มสิทธิ์การเข้าถึงใหม่'
                : 'แก้ไขสิทธิ์การเข้าถึง'}
            </h2>
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-2.5">
              <Input
                variant="bordered"
                label="ชื่อสิทธิ์การเข้าถึง"
                {...registerForm('name', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm.name}
                errorMessage={`${errorsForm.name?.message}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {menu()?.map((item: any) => (
                <div
                  key={item.id}
                  className="border dark:border-dark rounded-large p-3 flex flex-col gap-2 bg-gray-50 dark:bg-gray-800"
                >
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {item.title}
                  </h4>
                  <div className="flex flex-col gap-2">
                    {['read', 'write', 'update', 'delete'].map((action) => {
                      const actionPermissionMap: Record<string, string> = {
                        read: 'r--',
                        write: '-w-',
                        update: '-wx',
                        delete: 'rwx',
                      };

                      const permissionNumber = actionPermissionMap[action] || 0;

                      return (
                        <label key={action} className="flex items-center gap-2">
                          <Checkbox
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                            onChange={(e) =>
                              handlePermissionChange(
                                item.id,
                                action,
                                e.target.checked
                              )
                            }
                            isSelected={
                              permissions?.find((p) => p.id === item.id)
                                ?.permissions[action] || false
                            }
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {action.charAt(0).toUpperCase() + action.slice(1)} (
                            {permissionNumber})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-end gap-2">
              <Button
                radius="full"
                color="primary"
                isLoading={isApiLoading}
                startContent={!isApiLoading && <CircleCheck />}
                onClick={handleSubmitForm(async (data) => {
                  try {
                    setIsApiLoading(true);
                    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/employee/permission`;
                    const response =
                      formMode === 'create'
                        ? await axios.post(apiUrl, {
                            ...data,
                            permissions,
                            companyId: session?.company?.id,
                          })
                        : await axios.put(`${apiUrl}/${projectSelectId}`, {
                            ...data,
                            permissions,
                          });
                    notyf.success(response?.data?.message);
                    await mutate(
                      `/api/employee/permission?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
                    );
                    onCloseModal();
                    resetForm(initForm);
                  } catch (error: any) {
                    notyf.error('เกิดข้อผิดพลาด');
                    console.error(error);
                  } finally {
                    setIsApiLoading(false);
                  }
                })}
              >
                {formMode === 'create' ? 'บันทึก' : 'อัปเดต'}
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'รหัสประจำตัวสิทธิ์',
      },
      {
        accessorKey: 'name',
        header: 'ชื่อสิทธิ์การเข้าถึง',
        size: 200,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'permissions',
        size: 450,
        header: 'สิทธิ์ที่ใช้งานได้',
        Cell: ({ cell }: any) => {
          const permissions = JSON.parse(cell.getValue()) || {};
          const menuList = menu();

          const calculatePermissionNumber = (perm: any) => {
            const owner =
              (perm.read ? 4 : 0) +
              (perm.write ? 2 : 0) +
              (perm.update ? 1 : 0);

            const group = owner;
            const others = 0;

            return `${owner}${group}${others}`;
          };

          const permissionMenus = Object.keys(permissions)?.map((id: any) => {
            const menu = menuList?.find(
              (item: any) => item.id === permissions[id]?.id
            );

            if (
              !permissions[id]?.permissions?.write &&
              !permissions[id]?.permissions?.update &&
              !permissions[id]?.permissions?.read &&
              !permissions[id]?.permissions?.delete
            ) {
              return null;
            } else {
              const permissionNumber = calculatePermissionNumber(
                permissions[id]?.permissions
              );
              return menu ? `${menu.title} (${permissionNumber})` : null;
            }
          });

          return permissionMenus?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {permissionMenus?.map((menu, index) => {
                return (
                  menu && (
                    <Chip key={index} variant="flat" startContent={<Key />}>
                      {menu}
                    </Chip>
                  )
                );
              })}
            </div>
          ) : (
            '-'
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'วันที่สร้างข้อมูล',
        Cell: ({ cell }: any) => formatThaiDateTime(cell.getValue()) || '-',
      },
      {
        accessorKey: 'updatedAt',
        header: 'วันที่แก้ไขข้อมูล',
        Cell: ({ cell }: any) => formatThaiDateTime(cell.getValue()) || '-',
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    enablePagination: false,
    enableBottomToolbar: false,
    data: companies?.data || [],
    enableGlobalFilter: true,
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableGrouping: true,
    enableRowSelection: true,
    enableColumnPinning: true,
    enableRowActions: true,
    enableFacetedValues: true,
    initialState: {
      showGlobalFilter: true,
      columnVisibility: {
        id: false,
      },
      columnPinning: {
        left: ['mrt-row-expand', 'mrt-row-select'],
        right: ['mrt-row-actions'],
      },
    },
    paginationDisplayMode: 'custom',
    renderRowActionMenuItems: ({ row, closeMenu }) => [
      <MenuItem
        onClick={async () => {
          try {
            closeMenu();
            const id = row.getValue('id');
            setModalScreenLoading(true);
            setFormMode('update');
            setProjectSelectId(id);
            const { data } = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/employee/permission/${id}`
            );

            resetForm(data);
            setPermissions(JSON.parse(data?.permissions));

            onOpenModal();
            setModalScreenLoading(false);
          } catch (error) {
            setModalScreenLoading(false);
            console.log(error);
          }
        }}
        sx={{ m: 0 }}
      >
        แก้ไขข้อมูล
      </MenuItem>,
      <MenuItem
        onClick={async () => {
          closeMenu();
          const id = row.getValue('id');
          if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้ออกจากระบบ?')) {
            try {
              setModalScreenLoading(true);
              await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/api/employee/permission/${id}`
              );
              await mutate(
                `/api/employee/permission?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
              );
              setModalScreenLoading(false);
            } catch (error) {
              setModalScreenLoading(false);
              console.log(error);
            }
          }
        }}
        sx={{ m: 0 }}
      >
        <span className="text-danger-800">ลบข้อมูล</span>
      </MenuItem>,
    ],
    renderTopToolbar: ({ table }) => {
      const selectedRows = table.getSelectedRowModel().flatRows;

      return (
        <div className="flex justify-end flex-wrap gap-[0.5rem] p-[8px] items-center">
          <Input
            endContent={
              table.getState().globalFilter ? (
                <XIcon
                  className="cursor-pointer"
                  onClick={() => {
                    table.setGlobalFilter('');
                  }}
                />
              ) : (
                <Search />
              )
            }
            label="ค้นหาในตาราง"
            variant="bordered"
            className="w-fit dark:text-white"
            value={table.getState().globalFilter ?? ''}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
          />

          <div
            className="cursor-pointer"
            onClick={() =>
              table.setShowColumnFilters(!table.getState().showColumnFilters)
            }
          >
            {!table.getState().showColumnFilters ? (
              <Icon
                path={mdiFilterOutline}
                className="fill-current opacity-20 hover:opacity-100 dark:text-white"
                size={1}
              />
            ) : (
              <Icon
                path={mdiFilterOffOutline}
                className="fill-current opacity-20 hover:opacity-100 dark:text-white"
                size={1}
              />
            )}
          </div>

          <Select
            variant="bordered"
            label="รายการต่อหน้า"
            defaultSelectedKeys={['20']}
            onChange={async (e) => {
              setPagination((old: any) => ({
                ...old,
                pageItem: e.target.value,
              }));

              await mutate(
                `/api/employee/permission?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
              );
            }}
            className="max-w-32 dark:text-white"
          >
            <SelectItem key={'20'}>20 รายการ</SelectItem>
            <SelectItem key={'50'}>50 รายการ</SelectItem>
            <SelectItem key={'100'}>100 รายการ</SelectItem>
          </Select>

          <Button
            radius="full"
            startContent={<PlusIcon />}
            onClick={() => {
              setFormMode('create');
              onOpenModal();
            }}
            className="bg-primary text-white"
          >
            เพิ่มสิทธ์การเข้าถึงใหม่
          </Button>

          {selectedRows.length > 0 && (
            <Button
              radius="full"
              variant="bordered"
              startContent={<XIcon />}
              className="border-primary text-primary"
              onClick={async () => {
                if (
                  window.confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้ออกจากระบบ?')
                ) {
                  try {
                    setModalScreenLoading(true);

                    if (selectedRows && selectedRows?.length > 0) {
                      await Promise.all(
                        selectedRows?.map(async (item: any) => {
                          const id = item?.getValue('id');

                          await axios.delete(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/employee/permission/${id}`
                          );
                        })
                      );
                    }

                    await mutate(
                      `/api/employee/permission?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
                    );
                    await mutate(`/api/project?type=dashboard`);
                    table.resetRowSelection();
                    setModalScreenLoading(false);
                  } catch (error) {
                    setModalScreenLoading(false);
                    console.log(error);
                  }
                }
              }}
            >
              ลบข้อมูล
            </Button>
          )}
        </div>
      );
    },
  });

  return (
    <Layout sitename={'สิทธิ์การเข้าถึง'}>
      {formModal()}
      {modalScreenLoading && PageLoading()}

      <section className="flex flex-col gap-5">
        <Breadcrumbs>
          <BreadcrumbItem
            onClick={() => {
              router.push('/');
            }}
          >
            หน้าแรก
          </BreadcrumbItem>
          <BreadcrumbItem>พนักงาน</BreadcrumbItem>
          <BreadcrumbItem>สิทธิ์การเข้าถึง</BreadcrumbItem>
        </Breadcrumbs>

        <HeaderTitle title="สิทธิ์การเข้าถึง" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          <CardSummary
            label={'ทั้งหมด'}
            value={bankDashboard?.bankAccountCount}
            suffix={'รายการ'}
          />
        </div>

        <MaterialReactTable table={table} />

        <div className="flex justify-end">
          <Pagination
            showControls
            total={companies?.allPages}
            initialPage={1}
            onChange={async (e) => {
              setPagination((old) => ({ ...old, pageIndex: e }));
            }}
          />
        </div>
      </section>
    </Layout>
  );
}
