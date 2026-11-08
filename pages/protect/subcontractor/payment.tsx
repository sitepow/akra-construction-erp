import HeaderTitle from '@/components/HeaderTitle';
import Layout from '@/components/Layout';
import {
  Alert,
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
import { parseDate } from '@internationalized/date';
import { CircleAlert, CircleCheck, Search, XIcon } from 'lucide-react';
import CardSummary from '@/components/CardSummary';
const initForm = {
  subcontractorId: '',
  paymentFromBankId: null,
  status: '',
  paymentType: 'cash',
  paymentDate: null,
};
import { Notyf } from 'notyf';
import {
  convertDateJsonToDbSingle,
  fetcher,
  formatAmount,
  formatThaiDate,
  formatThaiDateTime,
} from '@/utils';

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

  const [selectId, setSelectId] = useState<any>();
  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    reset: resetForm,
    watch: watchForm,
    control: controlForm,
  } = useForm({
    defaultValues: initForm,
  });

  const [pagination, setPagination] = useState({ pageIndex: 1, pageItem: 20 });
  const { data: transferContracts } = useSWR(
    `/api/subcontractor/payment?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: companyBankDropdown } = useSWR(
    `/api/company/bank?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: subcontractorDropdown } = useSWR(
    `/api/subcontractor?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: subcontractorDashboard } = useSWR(
    `/api/dashboard?type=subcontractorPayment&companyId=${session?.company?.id}`,
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
          <ModalHeader>แก้ไขการจ่ายค่าจ้าง</ModalHeader>
          <ModalBody>
            {subcontractorDropdown?.length == 0 && (
              <Alert
                title="แจ้งเตือน"
                color="danger"
                description={
                  <>
                    <span>ขณะนี้ยังไม่มีข้อมูลจ่ายค่าจ้าง</span>{' '}
                    <span
                      className="underline cursor-pointer"
                      onClick={() => {
                        window.open('/subcontractor', '_blank');
                      }}
                    >
                      เพิ่มจ่ายค่าจ้างใหม่
                    </span>
                  </>
                }
              />
            )}

            {watchForm('paymentType') !== 'cash' &&
              companyBankDropdown?.length == 0 && (
                <Alert
                  title="แจ้งเตือน"
                  color="danger"
                  description={
                    <>
                      <span>
                        ขณะนี้ยังไม่มีข้อมูลธนาคารของบริษัท{' '}
                        <span
                          className="underline cursor-pointer"
                          onClick={() => {
                            window.open('/company/bank', '_blank');
                          }}
                        >
                          เพิ่มธนาคารบริษัท
                        </span>
                      </span>
                    </>
                  }
                />
              )}

            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <Select
                variant="bordered"
                isDisabled
                {...registerForm('subcontractorId', {
                  required: true,
                })}
                label="เลขที่รับเหมา"
                isRequired
              >
                {subcontractorDropdown &&
                  subcontractorDropdown?.map((item: any) => {
                    return <SelectItem key={item?.id}>{item?.no}</SelectItem>;
                  })}
              </Select>

              <Select
                variant="bordered"
                label="สถานะการชำระเงิน"
                {...registerForm('status')}
                defaultSelectedKeys={['complete']}
              >
                <SelectItem key={'pending'}>ยังไม่ได้จ่ายค่าจ้าง</SelectItem>
                <SelectItem key={'complete'}>จ่ายค่าจ้างแล้ว</SelectItem>
              </Select>

              <Select
                variant="bordered"
                label="การชำระเงิน"
                {...registerForm('paymentType')}
              >
                <SelectItem key={'cash'}>เงินสด</SelectItem>
                <SelectItem key={'bank'}>เงินโอน</SelectItem>
              </Select>

              {watchForm('paymentType') !== 'cash' && (
                <Select
                  variant="bordered"
                  label="บัญชีที่โอน"
                  {...registerForm('paymentFromBankId')}
                >
                  {companyBankDropdown &&
                    companyBankDropdown?.map((item: any) => {
                      return (
                        <SelectItem key={item?.id}>{item?.fullBank}</SelectItem>
                      );
                    })}
                </Select>
              )}

              <Controller
                control={controlForm}
                name="paymentDate"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    showMonthAndYearPickers
                    variant="bordered"
                    label="วันที่จ่ายค่าจ้าง"
                    isRequired
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                  />
                )}
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
                    const paperResponse =
                      formMode == 'create'
                        ? await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/subcontractor/payment`,
                            {
                              ...data,
                              companyId: session?.company?.id,
                              paymentDate: convertDateJsonToDbSingle(
                                data?.paymentDate
                              ),
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/subcontractor/payment/${selectId}`,
                            {
                              ...data,
                              paymentDate: convertDateJsonToDbSingle(
                                data?.paymentDate
                              ),
                            }
                          );
                    await mutate(
                      `/api/subcontractor/payment?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
        header: 'รหัสประจำตัวจ่ายค่าจ้าง',
      },
      {
        accessorKey: 'status',
        header: 'สถานะจ่ายค่าจ้าง',
        Cell: ({ cell }: any) => {
          const status = cell.getValue() || null;

          return status == 'notComplete' ? (
            <Chip variant="flat" color="warning" startContent={<CircleAlert />}>
              ยังไม่ได้จ่ายค่าจ้าง
            </Chip>
          ) : status == 'complete' ? (
            <Chip variant="flat" color="success" startContent={<CircleCheck />}>
              จ่ายค่าจ้างแล้ว
            </Chip>
          ) : (
            <Chip variant="flat" startContent={<CircleAlert />} color="danger">
              ยังไม่ได้ดำเนินการ
            </Chip>
          );
        },
      },
      {
        accessorKey: 'no',
        header: 'เลขที่จ่ายค่าจ้าง',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorFn: (row: any) => {
          return row?.subcontractor?.no ? row?.subcontractor?.no : null;
        },
        accessorKey: 'subcontractorNo',
        header: 'เลขที่จ้างช่วง',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorFn: (row: any) => {
          return row?.subcontractor?.project?.name
            ? row?.subcontractor?.project?.name
            : null;
        },
        header: 'โครงการ',
        size: 450,
        accessorKey: 'name',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorFn: (row: any) => {
          return `${row?.subcontractor?.employee?.prefix}${row?.subcontractor?.employee?.firstname} ${row?.subcontractor?.employee?.lastname}`;
        },
        header: 'ชื่อผู้รับเหมาช่วง',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorFn: (row: any) => {
          return row?.subcontractor?.duty ? row?.subcontractor?.duty : null;
        },
        header: 'รายละเอียดงาน',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorFn: (row: any) => {
          return row?.subcontractor?.wage ? row?.subcontractor?.wage : null;
        },
        header: 'ค่าจ้าง',
        Cell: ({ cell }: any) => formatAmount(cell.getValue()) || '-',
      },
      {
        accessorKey: 'paymentType',
        header: 'การชำระเงิน',
        Cell: ({ cell }: any) => {
          const status = cell.getValue();
          return status == 'cash' ? (
            <span>เงินสด</span>
          ) : status == 'bank' ? (
            <span>เงินโอน</span>
          ) : (
            '-'
          );
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.fromBank?.fullBank ? row?.fromBank?.fullBank : null;
        },
        header: 'บัญชีที่โอน',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'paymentDate',
        header: 'วันที่จ่ายค่าจ้าง',
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
    data: transferContracts?.data || [],
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
            setSelectId(id);
            const { data } = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/subcontractor/payment/${id}`
            );

            resetForm({
              ...data,
              paymentDate: data?.paymentDate
                ? parseDate(data?.paymentDate)
                : null,
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
                `${process.env.NEXT_PUBLIC_API_URL}/api/subcontractor/payment/${id}`
              );
              await mutate(
                `/api/subcontractor/payment?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
                `/api/subcontractor/payment?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
              );
            }}
            className="max-w-32 dark:text-white"
          >
            <SelectItem key={'20'}>20 รายการ</SelectItem>
            <SelectItem key={'50'}>50 รายการ</SelectItem>
            <SelectItem key={'100'}>100 รายการ</SelectItem>
          </Select>

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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/subcontractor/payment/${id}`
                          );
                        })
                      );
                    }

                    await mutate(
                      `/api/subcontractor/payment?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
    <Layout sitename={'จ่ายค่าจ้าง'}>
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
          <BreadcrumbItem>การจ้างเหมาช่วง</BreadcrumbItem>
          <BreadcrumbItem>จ่ายค่าจ้าง</BreadcrumbItem>
        </Breadcrumbs>

        <HeaderTitle title="จ่ายค่าจ้าง" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          <CardSummary
            label={'ทั้งหมด'}
            value={subcontractorDashboard?.subcontractorPaymentCount}
            suffix={'รายการ'}
          />
        </div>

        <MaterialReactTable table={table} />

        <div className="flex justify-end">
          <Pagination
            showControls
            total={transferContracts?.allPages}
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
