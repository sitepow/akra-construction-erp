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
import { errorRequire } from '@/utils/regex';
import {
  CircleAlert,
  CircleCheck,
  Clock,
  PlusIcon,
  Search,
  XIcon,
} from 'lucide-react';
import CardSummary from '@/components/CardSummary';
const initForm = {
  projectId: '',
  employeeId: '',
  duty: '',
  wage: '',
  status: 'pending',
  dateStart: null,
  dateEnd: null,
  dateSendEnd: null,
};
const initPaymentForm = {
  paymentFromBankId: null,
  paymentType: 'cash',
  paymentDate: parseDate(new Date().toISOString().split('T')[0]) as any,
  status: 'complete',
};
import { Notyf } from 'notyf';
import {
  convertDateJsonToDbSingle,
  formatThaiDate,
  formatAmount,
  formatThaiDateTime,
  fetcher,
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
  const [formPaymentMode, setFormPaymentMode] = useState('create');
  const [subcontractorId, setSubcontractorId] = useState<any>();
  const [subcontractorPaymentId, setSubcontractorPaymentId] = useState<any>();
  const [formMode, setFormMode] = useState('create');
  const [selectId, setSelectId] = useState<any>();
  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    reset: resetForm,
    control: controlForm,
    formState: { errors: errorsForm },
  } = useForm({
    defaultValues: initForm,
  });
  const {
    register: registerPaymentForm,
    handleSubmit: handleSubmitPaymentForm,
    reset: resetPaymentForm,
    watch: watchPaymentForm,
    control: controlPaymentForm,
    formState: { errors: errorsPaymentForm },
  } = useForm({
    defaultValues: initPaymentForm,
  });

  const [pagination, setPagination] = useState({ pageIndex: 1, pageItem: 20 });
  const { data: transferContracts } = useSWR(
    `/api/subcontractor?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: projectDropdown } = useSWR(
    `/api/contract/paper?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: employeeDropdown } = useSWR(
    `/api/employee?type=dropdown&employeeType=ผู้รับเหมาช่วง&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: subcontractorDashboard } = useSWR(
    `/api/dashboard?type=subcontractor&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: companyBankDropdown } = useSWR(
    `/api/company/bank?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );

  const {
    isOpen: isOpenPaymentModal,
    onOpen: onOpenPaymentModal,
    onClose: onClosePaymentModal,
  } = useDisclosure();

  const formPaymentModal = () => {
    return (
      <Modal
        size="4xl"
        scrollBehavior="inside"
        isOpen={isOpenPaymentModal}
        isDismissable={false}
        onClose={() => {
          resetPaymentForm(initPaymentForm);
          onClosePaymentModal();
        }}
      >
        <ModalContent>
          <ModalHeader>
            {formPaymentMode == 'create'
              ? 'จ่ายค่าจ้างจ้างเหมาช่วง'
              : 'แก้ไขจ่ายค่าจ้างจ้างเหมาช่วง'}
          </ModalHeader>
          <ModalBody>
            {watchPaymentForm('paymentType') !== 'cash' &&
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
                label="สถานะการชำระเงิน"
                {...registerPaymentForm('status', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsPaymentForm?.status}
                errorMessage={errorsPaymentForm?.status?.message}
              >
                <SelectItem key={'notComplete'}>
                  ยังไม่ได้จ่ายค่าจ้าง
                </SelectItem>
                <SelectItem key={'complete'}>จ่ายค่าจ้างแล้ว</SelectItem>
              </Select>

              <Select
                variant="bordered"
                label="การชำระเงิน"
                {...registerPaymentForm('paymentType', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsPaymentForm?.paymentType}
                errorMessage={errorsPaymentForm?.paymentType?.message}
              >
                <SelectItem key={'cash'}>เงินสด</SelectItem>
                <SelectItem key={'bank'}>เงินโอน</SelectItem>
              </Select>

              {watchPaymentForm('paymentType') !== 'cash' && (
                <Select
                  variant="bordered"
                  label="บัญชีที่โอน"
                  {...registerPaymentForm('paymentFromBankId', {
                    required: {
                      value: true,
                      message: errorRequire(),
                    },
                  })}
                  isInvalid={!!errorsPaymentForm?.paymentFromBankId}
                  errorMessage={errorsPaymentForm?.paymentFromBankId?.message}
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
                control={controlPaymentForm}
                name="paymentDate"
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
                    label="วันที่จ่ายค่าจ้าง"
                    isRequired
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                    isInvalid={!!error}
                    errorMessage={error?.message}
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
                startContent={!isApiLoading && <CircleCheck />}
                isLoading={isApiLoading}
                onClick={handleSubmitPaymentForm(async (data) => {
                  try {
                    setIsApiLoading(true);
                    const paperResponse =
                      formPaymentMode == 'create'
                        ? await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/subcontractor/payment`,
                            {
                              ...data,
                              companyId: session?.company?.id,
                              subcontractorId,
                              paymentDate: convertDateJsonToDbSingle(
                                data?.paymentDate
                              ),
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/subcontractor/payment/${subcontractorPaymentId}`,
                            {
                              ...data,
                              subcontractorId,
                              paymentDate: convertDateJsonToDbSingle(
                                data?.paymentDate
                              ),
                            }
                          );
                    await mutate(
                      `/api/subcontractor?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
                    );
                    notyf.success(paperResponse?.data?.message);
                    setIsApiLoading(false);
                    onClosePaymentModal();
                    resetPaymentForm(initPaymentForm);
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
            {formMode == 'create'
              ? 'เพิ่มจ้างเหมาช่วงใหม่'
              : 'แก้ไขจ้างเหมาช่วง'}
          </ModalHeader>
          <ModalBody>
            {employeeDropdown?.length == 0 && (
              <Alert
                title="แจ้งเตือน"
                color="danger"
                description={
                  <>
                    <span>ขณะนี้ยังไม่มีข้อมูลผู้รับเหมาช่วง</span>{' '}
                    <span
                      className="underline cursor-pointer"
                      onClick={() => {
                        window.open('/employee', '_blank');
                      }}
                    >
                      เพิ่มผู้รับเหมาช่วงใหม่
                    </span>
                  </>
                }
              />
            )}

            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <Select
                variant="bordered"
                {...registerForm('projectId', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm.projectId}
                errorMessage={`${errorsForm.projectId?.message}`}
                label="โครงการ"
                isRequired
              >
                {projectDropdown &&
                  projectDropdown?.map((item: any) => {
                    return <SelectItem key={item?.id}>{item?.name}</SelectItem>;
                  })}
              </Select>

              <Select
                variant="bordered"
                {...registerForm('employeeId', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm.employeeId}
                errorMessage={`${errorsForm.employeeId?.message}`}
                label="ผู้รับเหมาช่วง"
                isRequired
              >
                {employeeDropdown &&
                  employeeDropdown?.map((item: any) => {
                    return <SelectItem key={item?.id}>{item?.name}</SelectItem>;
                  })}
              </Select>

              <Input
                variant="bordered"
                label="รายละเอียดงาน"
                {...registerForm('duty', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm.duty}
                errorMessage={`${errorsForm.duty?.message}`}
              />

              <Input
                variant="bordered"
                label="ค่าจ้างเหมา"
                type="number"
                {...registerForm('wage', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm.wage}
                errorMessage={`${errorsForm.wage?.message}`}
              />

              <Controller
                control={controlForm}
                name="dateStart"
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
                    label="วันที่รับเหมา"
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
                control={controlForm}
                name="dateEnd"
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
                    label="วันที่คาดว่าจะเสร็จ"
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
                control={controlForm}
                name="dateSendEnd"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    showMonthAndYearPickers
                    variant="bordered"
                    label="วันที่เสร็จสิ้น"
                    isDisabled
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
                startContent={!isApiLoading && <CircleCheck />}
                isLoading={isApiLoading}
                onClick={handleSubmitForm(async (data) => {
                  try {
                    setIsApiLoading(true);
                    const paperResponse =
                      formMode == 'create'
                        ? await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/subcontractor`,
                            {
                              ...data,
                              companyId: session?.company?.id,
                              dateStart: convertDateJsonToDbSingle(
                                data?.dateStart
                              ),
                              dateEnd: convertDateJsonToDbSingle(data?.dateEnd),
                              dateSendEnd: convertDateJsonToDbSingle(
                                data?.dateSendEnd
                              ),
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/subcontractor/${selectId}`,
                            {
                              ...data,
                              dateStart: convertDateJsonToDbSingle(
                                data?.dateStart
                              ),
                              dateEnd: convertDateJsonToDbSingle(data?.dateEnd),
                              dateSendEnd: convertDateJsonToDbSingle(
                                data?.dateSendEnd
                              ),
                            }
                          );
                    await mutate(
                      `/api/subcontractor?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
        header: 'รหัสประจำตัวจ้างเหมาช่วง',
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
        accessorKey: 'status',
        header: 'สถานะการทำงาน',
        Cell: ({ cell }: any) => {
          const status = cell.getValue() || null;

          return status == 'pending' ? (
            <Chip variant="flat" color="warning" startContent={<Clock />}>
              กำลังดำเนินการ
            </Chip>
          ) : status == 'complete' ? (
            <Chip variant="flat" color="success" startContent={<CircleCheck />}>
              ดำเนินการเสร็จแล้ว
            </Chip>
          ) : (
            '-'
          );
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.subcontractorPayment?.status
            ? row?.subcontractorPayment?.status
            : null;
        },
        accessorKey: 'paymentStatus',
        header: 'สถานะจ่ายค่าจ้าง',
        Cell: ({ cell }: any) => {
          const status = cell.getValue() || null;

          return status == 'notComplete' ? (
            <Chip variant="flat" color="warning" startContent={<CircleAlert />}>
              ยังไม่ได้จ่ายค่าจ้าง
            </Chip>
          ) : status == 'complete' ? (
            <Chip variant="flat" color="success" startContent={<CircleCheck />}>
              ดำเนินการเสร็จแล้ว
            </Chip>
          ) : (
            <Chip variant="flat" color="danger" startContent={<CircleAlert />}>
              ยังไม่ได้ดำเนินการ
            </Chip>
          );
        },
      },
      {
        accessorKey: 'no',
        header: 'เลขที่จ้างช่วง',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorFn: (row: any) => {
          return row?.subcontractorPayment?.no
            ? row?.subcontractorPayment?.no
            : null;
        },
        header: 'เลขที่จ่ายค่าจ้าง',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorFn: (row: any) => {
          return `${row?.employee?.prefix}${row?.employee?.firstname} ${row?.employee?.lastname}`;
        },
        header: 'ชื่อผู้รับเหมาช่วง',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'duty',
        header: 'รายละเอียดงาน',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'dateStart',
        header: 'วันที่รับเหมา',
        Cell: ({ cell }: any) => formatThaiDate(cell.getValue()) || '-',
      },
      {
        accessorKey: 'dateEnd',
        header: 'วันที่คาดว่าจะเสร็จ',
        Cell: ({ cell }: any) => formatThaiDate(cell.getValue()) || '-',
      },
      {
        accessorKey: 'dateSendEnd',
        header: 'วันที่เสร็จสิ้น',
        Cell: ({ cell }: any) => formatThaiDate(cell.getValue()) || '-',
      },
      {
        accessorKey: 'telephone',
        header: 'เบอร์โทรศัพท์ติดต่อ',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'wage',
        header: 'ค่าจ้างรับเหมา',
        Cell: ({ cell }: any) => formatAmount(cell.getValue()) || '-',
      },
      {
        accessorFn: (row: any) => {
          return row?.employee?.fullBank ? row?.employee?.fullBank : null;
        },
        header: 'บัญชีที่รับโอน',
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
    renderDetailPanel: ({ row }) => {
      return (
        <div className="felx flex-col gap-2.5">
          {!row?.original?.subcontractorPaymentId && (
            <Button
              radius="full"
              variant="bordered"
              onClick={async () => {
                try {
                  setModalScreenLoading(true);
                  const subcontractor = row?.original?.id;
                  const subcontractorPayment =
                    row?.original?.subcontractorPaymentId;

                  setSubcontractorId(subcontractor);
                  if (subcontractorPayment) {
                    setFormPaymentMode('update');
                    const { data } = await axios.get(
                      `${process.env.NEXT_PUBLIC_API_URL}/api/subcontractor/payment/${subcontractorPayment}`
                    );

                    resetPaymentForm({
                      ...data,
                      paymentDate: data?.paymentDate
                        ? parseDate(data?.paymentDate)
                        : null,
                    });

                    setSubcontractorPaymentId(subcontractorPayment);
                  } else {
                    setFormPaymentMode('create');
                  }

                  onOpenPaymentModal();
                  setModalScreenLoading(false);
                } catch (error) {
                  setModalScreenLoading(false);
                  console.log(error);
                }
              }}
            >
              {row?.original?.subcontractorPaymentId
                ? 'แก้ไขจ่ายค่าจ้าง'
                : 'จ่ายค่าจ้าง'}
            </Button>
          )}
        </div>
      );
    },
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
              `${process.env.NEXT_PUBLIC_API_URL}/api/subcontractor/${id}`
            );

            resetForm({
              ...data,
              dateStart: data?.dateStart ? parseDate(data?.dateStart) : null,
              dateEnd: data?.dateEnd ? parseDate(data?.dateEnd) : null,
              dateSendEnd: data?.dateSendEnd
                ? parseDate(data?.dateSendEnd)
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
                `${process.env.NEXT_PUBLIC_API_URL}/api/subcontractor/${id}`
              );
              await mutate(
                `/api/subcontractor?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
                `/api/subcontractor?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
            เพิ่มจ้างเหมาช่วงใหม่
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/subcontractor/${id}`
                          );
                        })
                      );
                    }

                    await mutate(
                      `/api/subcontractor?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
    <Layout sitename={'จ้างเหมาช่วง'}>
      {formModal()}
      {formPaymentModal()}
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
          <BreadcrumbItem>จ้างเหมาช่วง</BreadcrumbItem>
        </Breadcrumbs>

        <HeaderTitle title="จ้างเหมาช่วง" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          <CardSummary
            label={'ทั้งหมด'}
            value={subcontractorDashboard?.subcontractorCount}
            suffix={'รายการ'}
          />
          <CardSummary
            label={'ค่าจ้างทั้งหมด'}
            isMoney
            value={subcontractorDashboard?.NetTotal}
            suffix={'บาท'}
          />
          <CardSummary
            label={'ยังไม่ได้จ่ายค่าจ้าง'}
            isMoney
            value={subcontractorDashboard?.pendingNetTotal}
            suffix={'บาท'}
          />
          <CardSummary
            label={'จ่ายค่าจ้างแล้ว'}
            isMoney
            value={subcontractorDashboard?.successNetTotal}
            suffix={'บาท'}
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
