import HeaderTitle from '@/components/HeaderTitle';
import Layout from '@/components/Layout';
import {
  Alert,
  BreadcrumbItem,
  Breadcrumbs,
  Button,
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
import { CircleCheck, PlusIcon, Search, XIcon } from 'lucide-react';
import CardSummary from '@/components/CardSummary';
import { errorRequire } from '@/utils/regex';
const initForm = {
  supplierId: '',
  bankName: '',
  bankType: '',
  bankBranch: '',
  bankAccount: '',
};
import { Notyf } from 'notyf';
import { banks, accountTypes, formatThaiDateTime, fetcher } from '@/utils';

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
  const { data: suppliers } = useSWR(
    `/api/supplier/bank?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: supplierDropdown } = useSWR(
    `/api/supplier?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: supplierDashboard } = useSWR(
    `/api/dashboard?type=supplier&companyId=${session?.company?.id}`,
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
        size="4xl"
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
            {formMode == 'create' ? 'เพิ่มธนาคารใหม่' : 'แก้ไขธนาคาร'}
          </ModalHeader>
          <ModalBody>
            {supplierDropdown?.length == 0 && (
              <Alert
                title="แจ้งเตือน"
                color="danger"
                description={
                  <>
                    <span>ขณะนี้ยังไม่มีข้อมูลของซัพพลายเออร์</span>{' '}
                    <span
                      className="underline cursor-pointer"
                      onClick={() => {
                        window.open('/supplier', '_blank');
                      }}
                    >
                      เพิ่มซัพพลายเออร์ใหม่
                    </span>
                  </>
                }
              />
            )}

            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <Select
                label="ซัพพลายเออร์"
                variant="bordered"
                {...registerForm('supplierId', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm.supplierId}
                errorMessage={`${errorsForm.supplierId?.message}`}
              >
                {supplierDropdown?.map((item: any) => {
                  return <SelectItem key={item?.id}>{item?.name}</SelectItem>;
                })}
              </Select>

              <Select
                label="ธนาคาร"
                variant="bordered"
                {...registerForm('bankName', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm?.bankName}
                errorMessage={errorsForm?.bankName?.message}
              >
                {banks.map((bank: any) => (
                  <SelectItem key={bank}>{bank}</SelectItem>
                ))}
              </Select>

              <Input
                variant="bordered"
                label="สาขา"
                {...registerForm('bankBranch', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm.bankBranch}
                errorMessage={errorsForm.bankBranch?.message}
              />

              <Select
                label="ประเภทบัญชี"
                variant="bordered"
                {...registerForm('bankType', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm?.bankType}
                errorMessage={errorsForm?.bankType?.message}
              >
                {accountTypes.map((account: any) => (
                  <SelectItem key={account}>{account}</SelectItem>
                ))}
              </Select>

              <Input
                variant="bordered"
                label="เลขบัญชี"
                {...registerForm('bankAccount', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm.bankAccount}
                errorMessage={errorsForm.bankAccount?.message}
              />
            </form>
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-end gap-2 flex-wrap">
              <Button
                radius="full"
                className="bg-primary text-white"
                isLoading={isApiLoading}
                startContent={!isApiLoading && <CircleCheck />}
                onClick={handleSubmitForm(async (data) => {
                  try {
                    setIsApiLoading(true);
                    const fullBank = `${data?.bankAccount} ${data?.bankName}`;
                    const paperResponse =
                      formMode == 'create'
                        ? await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/supplier/bank`,
                            {
                              ...data,
                              companyId: session?.company?.id,
                              fullBank,
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/supplier/bank/${projectSelectId}`,
                            { ...data, fullBank }
                          );
                    await mutate(
                      `/api/supplier/bank?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
                    );
                    notyf.success(paperResponse?.data?.message);
                    setIsApiLoading(false);
                    onCloseModal();
                    resetForm(initForm);
                  } catch (error: any) {
                    notyf.error(error?.response?.data);
                    setIsApiLoading(false);
                    console.log(error);
                  }
                })}
              >
                {formMode == 'create' ? 'บันทึกข้อมูล' : 'แก้ไขข้อมูล'}
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
        header: 'รหัสประจำตัวซัพพลายเออร์',
        size: 50,
      },
      {
        accessorFn: (row: any) => {
          return row?.supplier?.name ? row?.supplier?.name : null;
        },
        header: 'ชื่อซัพพลายเออร์',
        size: 250,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'bankName',
        header: 'ธนาคาร',
        size: 250,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'bankBranch',
        header: 'สาขา',
        size: 250,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'bankType',
        header: 'ประเภทบัญชี',
        size: 250,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'bankAccount',
        header: 'เลขที่บัญชี',
        size: 250,
        Cell: ({ cell }: any) => cell.getValue() || '-',
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
    data: suppliers?.data || [],
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
              `${process.env.NEXT_PUBLIC_API_URL}/api/supplier/bank/${id}`
            );

            resetForm(data);

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
                `${process.env.NEXT_PUBLIC_API_URL}/api/supplier/bank/${id}`
              );
              await mutate(
                `/api/supplier/bank?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
                `/api/supplier/bank?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
            เพิ่มธนาคารใหม่
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/supplier/bank/${id}`
                          );
                        })
                      );
                    }

                    await mutate(
                      `/api/supplier/bank?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
    <Layout sitename={'ธนาคารและบัญชี'}>
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
          <BreadcrumbItem>รายชื่อผู้ติดต่อ</BreadcrumbItem>
          <BreadcrumbItem>จัดการซัพพลายเออร์</BreadcrumbItem>
          <BreadcrumbItem>ธนาคารและบัญชี</BreadcrumbItem>
        </Breadcrumbs>

        <HeaderTitle title="ธนาคารและบัญชี" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          <CardSummary
            label={'ทั้งหมด'}
            value={supplierDashboard?.supplierAccountBankCount}
            suffix={'รายการ'}
          />
        </div>

        <MaterialReactTable table={table} />

        <div className="flex justify-end">
          <Pagination
            showControls
            total={suppliers?.allPages}
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
