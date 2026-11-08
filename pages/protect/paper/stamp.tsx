import HeaderTitle from '@/components/HeaderTitle';
import Layout from '@/components/Layout';
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Chip,
  DatePicker,
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
import { Controller, useForm } from 'react-hook-form';
import PageLoading from '@/components/LoadingPage';
import { MenuItem } from '@mui/material';
import { errorRequire } from '@/utils/regex';
import { parseDate } from '@internationalized/date';
import { CircleCheck, Clock, PlusIcon, Search, XIcon } from 'lucide-react';
import CardSummary from '@/components/CardSummary';
import { Notyf } from 'notyf';
import {
  convertDateJsonToDbSingle,
  formatThaiDate,
  formatAmount,
  formatThaiDateTime,
  fetcher,
} from '@/utils';
const initForm = {
  projectId: '',
  reciveDate: null,
  stampDate: null,
  stampAmount: '',
  status: 'pending',
};

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
    control: controlForm,
    formState: { errors: errorsForm },
  } = useForm({
    defaultValues: initForm,
  });

  const [pagination, setPagination] = useState({ pageIndex: 1, pageItem: 20 });
  const { data: stamp } = useSWR(
    `/api/paper/stamp?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: projectDropdown } = useSWR(
    `/api/contract/paper?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: projectPaperSlipDashboard } = useSWR(
    `/api/dashboard?type=paperSlip&companyId=${session?.company?.id}`,
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
            {formMode == 'create' ? 'เพิ่มใบเสร็จตีตราสารใหม่' : 'แก้ไขใบเสร็จ'}
          </ModalHeader>
          <ModalBody>
            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <Select
                label="โครงการ"
                variant="bordered"
                {...registerForm('projectId', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm.projectId}
                errorMessage={`${errorsForm.projectId?.message}`}
              >
                {projectDropdown?.map((item: any) => {
                  return <SelectItem key={item?.id}>{item?.name}</SelectItem>;
                })}
              </Select>

              <Controller
                control={controlForm}
                name="stampDate"
                rules={{
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                }}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <DatePicker
                    showMonthAndYearPickers
                    variant="bordered"
                    label="วันที่ตีตราสาร"
                    className="mb-2"
                    isInvalid={!!error}
                    errorMessage={error?.message}
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                  />
                )}
              />

              <Controller
                control={controlForm}
                name="reciveDate"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    showMonthAndYearPickers
                    variant="bordered"
                    label="วันที่ได้รับใบเสร็จ"
                    className="mb-2"
                    isRequired
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                  />
                )}
              />

              <Input
                variant="bordered"
                label="เงินค่าตราสาร"
                {...registerForm('stampAmount', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm.stampAmount}
                errorMessage={`${errorsForm.stampAmount?.message}`}
              />

              <Select
                variant="bordered"
                label={'สถานะรับใบเสร็จ'}
                {...registerForm('status', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm?.status}
                errorMessage={errorsForm?.status?.message}
              >
                <SelectItem key={'pending'}>ยังไม่ได้รับเอกสาร</SelectItem>
                <SelectItem key={'complete'}>รับเอกสารแล้ว</SelectItem>
              </Select>
            </form>
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-end gap-2 flex-wrap">
              <Button
                radius="full"
                startContent={!isApiLoading && <CircleCheck />}
                className="bg-primary text-white"
                isLoading={isApiLoading}
                onClick={handleSubmitForm(async (data) => {
                  try {
                    setIsApiLoading(true);
                    const paperResponse =
                      formMode == 'create'
                        ? await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/paper/stamp`,
                            {
                              ...data,
                              reciveDate: data?.reciveDate
                                ? convertDateJsonToDbSingle(data?.reciveDate)
                                : null,
                              stampDate: data?.stampDate
                                ? convertDateJsonToDbSingle(data?.stampDate)
                                : null,
                              companyId: session?.company?.id,
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/paper/stamp/${projectSelectId}`,
                            {
                              ...data,
                              reciveDate: data?.reciveDate
                                ? convertDateJsonToDbSingle(data?.reciveDate)
                                : null,
                              stampDate: data?.stampDate
                                ? convertDateJsonToDbSingle(data?.stampDate)
                                : null,
                            }
                          );
                    await mutate(
                      `/api/paper/stamp?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
        header: 'รหัสประจำตัวตีตราสาร',
      },
      {
        accessorKey: 'status',
        header: 'สถานะรับใบเสร็จ',
        Cell: ({ cell }: any) => {
          const status = cell.getValue() || null;

          return status == 'pending' ? (
            <Chip variant="flat" color="warning" startContent={<Clock />}>
              ยังไม่ได้รับเอกสาร
            </Chip>
          ) : status == 'complete' ? (
            <Chip variant="flat" color="success" startContent={<CircleCheck />}>
              รับเอกสารแล้ว
            </Chip>
          ) : (
            '-'
          );
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.project?.name ? row?.project?.name : null;
        },
        accessorKey: 'name',
        header: 'โครงการ',
        size: 450,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'stampDate',
        header: 'วันที่ตีตราสาร',
        Cell: ({ cell }: any) => formatThaiDate(cell.getValue()) || '-',
      },
      {
        accessorKey: 'stampAmount',
        header: 'เงินค่าตราสาร',
        Cell: ({ cell }: any) => formatAmount(cell.getValue()) || '-',
      },
      {
        accessorKey: 'reciveDate',
        header: 'วันที่ได้รับใบเสร็จ',
        Cell: ({ cell }: any) => formatThaiDate(cell.getValue()) || '-',
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
    data: stamp?.data || [],
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
              `${process.env.NEXT_PUBLIC_API_URL}/api/paper/stamp/${id}`
            );

            resetForm({
              ...data,
              reciveDate: data?.reciveDate ? parseDate(data?.reciveDate) : null,
              stampDate: data?.stampDate ? parseDate(data?.stampDate) : null,
            });

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
                `${process.env.NEXT_PUBLIC_API_URL}/api/paper/stamp/${id}`
              );
              await mutate(
                `/api/paper/stamp?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
                `/api/paper/stamp?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
            เพิ่มใบเสร็จตีตราสารใหม่
          </Button>

          {selectedRows.length > 0 && (
            <Button
              radius="full"
              startContent={<XIcon />}
              variant="bordered"
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/paper/stamp/${id}`
                          );
                        })
                      );
                    }

                    await mutate(
                      `/api/paper/stamp?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
                    );
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
    <Layout sitename={'ใบเสร็จตีตราสาร'}>
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
          <BreadcrumbItem>เอกสารใบเสร็จ</BreadcrumbItem>
          <BreadcrumbItem>ใบเสร็จตีตราสาร</BreadcrumbItem>
        </Breadcrumbs>

        <HeaderTitle title="ใบเสร็จตีตราสาร" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          <CardSummary
            label={'ได้รับเอกสารแล้ว'}
            value={projectPaperSlipDashboard?.projectStampSuccessSlipCount}
            suffix={'ฉบับ'}
          />
          <CardSummary
            label={'ยังไม่ได้รับเอกสาร'}
            value={projectPaperSlipDashboard?.projectStampPendingSlipCount}
            suffix={'ฉบับ'}
          />
        </div>

        <MaterialReactTable table={table} />

        <div className="flex justify-end">
          <Pagination
            showControls
            total={stamp?.allPages}
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
