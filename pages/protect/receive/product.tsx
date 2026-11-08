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
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from '@nextui-org/react';
import router from 'next/router';
import {
  MaterialReactTable,
  MRT_ColumnDef,
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
import {
  ArrowUpRight,
  CircleCheck,
  Clock,
  Merge,
  Search,
  Split,
  XIcon,
} from 'lucide-react';
import CardSummary from '@/components/CardSummary';
const initForm = {
  zoneId: '',
  status: 'pending',
  dateReceive: parseDate(new Date().toISOString().split('T')[0]) as any,
};
import { Notyf } from 'notyf';
import {
  formatAmount,
  textCut,
  convertDateJsonToDbSingle,
  formatThaiDate,
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
  const [poId, setPoId] = useState<any>();
  const [formMode, setFormMode] = useState('create');

  const [po, setPo] = useState<any>();
  const [selectId, setSelectId] = useState<any>();
  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    reset: resetForm,
    control: controlForm,
  } = useForm({
    defaultValues: initForm,
  });

  const [pagination, setPagination] = useState({ pageIndex: 1, pageItem: 20 });
  const { data: transferContracts } = useSWR(
    `/api/receive/product?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: poDropdown } = useSWR(
    `/api/account/po?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: receiveProductDashboard } = useSWR(
    `/api/dashboard?type=receiveProduct&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: zoneDropdown } = useSWR(
    `/api/warehouse/zone?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: categoryDropdown } = useSWR(
    `/api/warehouse/category?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );

  const warehouseColumns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row: any) => {
          return row?.no;
        },
        header: 'รหัสสินค้า',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.product?.name;
        },
        header: 'ชื่อสินค้า',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
      {
        accessorFn: (row: any) => {
          return categoryDropdown?.find(
            (itemmap: any) => itemmap?.id == row?.categoryId
          )?.name;
        },
        header: 'หมวดหมู่คลังสินค้า',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
      {
        accessorFn: (row: any) => {
          return zoneDropdown?.find(
            (itemmap: any) => itemmap?.id == row?.zoneId
          )?.name;
        },
        header: 'สถานที่จัดเก็บ',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.product?.unit;
        },
        header: 'หน่วยนับ',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
      {
        accessorFn: (row: any) => {
          return formatAmount(row?.qty);
        },
        header: 'จำนวน',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
      {
        accessorFn: (row: any) => {
          return formatAmount(row?.warehouse?.price);
        },
        header: 'ราคาซื้อ (~ประมาน)',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
      {
        accessorFn: (row: any) => {
          return formatAmount(row?.totalAmount);
        },
        header: 'มูลค่ารวม',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
    ],
    []
  );

  const {
    isOpen: isOpenModal,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure();

  const formModal = () => {
    return (
      <Modal
        size="5xl"
        scrollBehavior="inside"
        isOpen={isOpenModal}
        isDismissable={false}
        onClose={() => {
          setPo(null);
          setPoId(null);
          resetForm(initForm);
          onCloseModal();
        }}
      >
        <ModalContent>
          <ModalHeader>
            {formMode == 'create' ? 'เพิ่มใบรับสินค้าใหม่' : 'แก้ไขใบรับสินค้า'}
          </ModalHeader>
          <ModalBody>
            {poDropdown?.length == 0 && (
              <Alert
                title="แจ้งเตือน"
                color="danger"
                description={
                  <>
                    <span>ขณะนี้ยังไม่มีข้อมูลใบสั่งซื้อสินค้า</span>{' '}
                    <span
                      className="underline cursor-pointer"
                      onClick={() => {
                        window.open('/account/po', '_blank');
                      }}
                    >
                      เพิ่มใบสั่งซื้อสินค้าใหม่
                    </span>
                  </>
                }
              />
            )}

            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <Select
                variant="bordered"
                label="สถานะใบรับสินค้า"
                {...registerForm('status')}
              >
                <SelectItem key={'pending'}>ยังไม่ได้รับสินค้า</SelectItem>
                <SelectItem key={'complete'}>ดำเนินการเสร็จแล้ว</SelectItem>
              </Select>

              <Controller
                control={controlForm}
                name="dateReceive"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    showMonthAndYearPickers
                    variant="bordered"
                    label="วันที่รับสินค้า"
                    isRequired
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                  />
                )}
              />
            </form>

            {po?.poProducts && po?.poProducts?.length !== 0 && (
              <>
                {formMode == 'create' && (
                  <Alert
                    color="warning"
                    title="แจ้งเตือน"
                    description={
                      <span>
                        กรุณาตรวจสอบสินค้าอีกครั้ง
                        ก่อนที่จะทำการรับเข้าในคลังสินค้า
                      </span>
                    }
                  />
                )}

                <Alert
                  title="แจ้งเตือน"
                  color="success"
                  description={
                    <>
                      <span>
                        ขณะนี้คุณได้รับสินค้าทั้งหมดจากใบสั่งซื้อสินค้าเข้าไปจัดเก็บในคลังสินค้าเรียบร้อยแล้ว
                        <br />
                        หากคุณต้องการแก้ไขสินค้าที่จัดเก็บต้องไปจัดการต่อได้ที่{' '}
                        <span
                          className="underline cursor-pointer"
                          onClick={() => {
                            window.open('/warehouse', '_blank');
                          }}
                        >
                          คลังสินค้าและสต็อก
                        </span>
                      </span>
                    </>
                  }
                />

                <>
                  {po?.warehouseMode == 'separate' ? (
                    <Table className="w-fit no-border border rounded-large dark:border-dark">
                      <TableHeader>
                        <TableColumn>รหัสสินค้า</TableColumn>
                        <TableColumn>ชื่อสินค้า</TableColumn>
                        <TableColumn>หมวดหมู่คลังสินค้า</TableColumn>
                        <TableColumn>สถานที่จัดเก็บ</TableColumn>
                        <TableColumn>หน่วยนับ</TableColumn>
                        <TableColumn>จำนวน</TableColumn>
                        <TableColumn>ราคาต่อหน่วย</TableColumn>
                        <TableColumn>ราคารวม</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {po?.poProducts?.map((item: any, index: any) => {
                          return (
                            <TableRow key={index}>
                              <TableCell className="min-w-32">
                                {item?.no}
                              </TableCell>
                              <TableCell>
                                {textCut(item?.product?.name, 35)}
                              </TableCell>
                              <TableCell>
                                {
                                  categoryDropdown?.find(
                                    (itemmap: any) =>
                                      itemmap?.id == item?.categoryId
                                  )?.name
                                }
                              </TableCell>
                              <TableCell>
                                {
                                  zoneDropdown?.find(
                                    (itemmap: any) =>
                                      itemmap?.id == item?.zoneId
                                  )?.name
                                }
                              </TableCell>
                              <TableCell>
                                {item?.product?.unit
                                  ? item?.product?.unit
                                  : '-'}
                              </TableCell>
                              <TableCell>{formatAmount(item?.qty)}</TableCell>
                              <TableCell>{formatAmount(item?.price)}</TableCell>
                              <TableCell>
                                {formatAmount(item?.totalAmount)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <Table className="w-fit no-border border rounded-large dark:border-dark">
                      <TableHeader>
                        <TableColumn>รหัสสินค้า</TableColumn>
                        <TableColumn>ชื่อสินค้า</TableColumn>
                        <TableColumn>หน่วยนับ</TableColumn>
                        <TableColumn>จำนวน</TableColumn>
                        <TableColumn>ราคาต่อหน่วย</TableColumn>
                        <TableColumn>ราคารวม</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {po?.poProducts?.map((item: any, index: any) => {
                          return (
                            <TableRow key={index}>
                              <TableCell className="min-w-32">
                                {item?.no}
                              </TableCell>
                              <TableCell>
                                {textCut(item?.product?.name, 35)}
                              </TableCell>
                              <TableCell>
                                {item?.product?.unit
                                  ? item?.product?.unit
                                  : '-'}
                              </TableCell>
                              <TableCell>{formatAmount(item?.qty)}</TableCell>
                              <TableCell>{formatAmount(item?.price)}</TableCell>
                              <TableCell>
                                {formatAmount(item?.totalAmount)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </>
              </>
            )}
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
                    if (!poId) return;
                    setIsApiLoading(true);
                    const paperResponse =
                      formMode == 'create'
                        ? await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/receive/product`,
                            {
                              ...data,
                              companyId: session?.company?.id,
                              poId,
                              dateReceive: convertDateJsonToDbSingle(
                                data?.dateReceive
                              ),
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/receive/product/${selectId}`,
                            {
                              ...data,
                              poId,
                              dateReceive: convertDateJsonToDbSingle(
                                data?.dateReceive
                              ),
                            }
                          );
                    await mutate(
                      `/api/receive/product?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
                    );
                    notyf.success(paperResponse?.data?.message);
                    setIsApiLoading(false);
                    setPo(null);
                    setPoId(null);
                    resetForm(initForm);
                    onCloseModal();
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
        header: 'รหัสประจำตัวรับสินค้า',
      },
      {
        accessorKey: 'status',
        header: 'สถานะใบรับสินค้า',
        Cell: ({ cell }: any) => {
          const status = cell.getValue();
          return status == 'pending' ? (
            <Chip variant="flat" color="danger" startContent={<Clock />}>
              ยังไม่ได้รับสินค้า
            </Chip>
          ) : status == 'complete' ? (
            <Chip color="success" variant="flat" startContent={<CircleCheck />}>
              ดำเนินการเสร็จแล้ว
            </Chip>
          ) : (
            '-'
          );
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.po?.no ? row?.po?.no : null;
        },
        accessorKey: 'poNo',
        header: 'เลขที่ใบสั่งซื้อสินค้า',
        size: 250,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorFn: (row: any) => {
          return row?.po?.warehouseMode ? row?.po?.warehouseMode : null;
        },
        size: 250,
        accessorKey: 'mode',
        header: 'โหมดการจัดเก็บสินค้า',
        Cell: ({ cell }: any) => {
          const value = cell.getValue();
          return value == 'all' ? (
            <Chip variant="flat" startContent={<Merge />}>
              ที่เดียวกัน
            </Chip>
          ) : value == 'separate' ? (
            <Chip variant="flat" startContent={<Split />}>
              แยกเก็บ
            </Chip>
          ) : (
            '-'
          );
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.po?.supplier?.name ? row?.po?.supplier?.name : null;
        },
        header: 'ซัพพลายเออร์',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'dateReceive',
        header: 'วันที่รับสินค้า',
        Cell: ({ cell }: any) => formatThaiDate(cell.getValue()) || '-',
      },
      {
        accessorFn: (row: any) => {
          return row?.zone?.name ? row?.zone?.name : null;
        },
        header: 'สถานที่จัดเก็บ',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorFn: (row: any) => {
          return row?.po?.poProducts ? row?.po?.poProducts?.length : null;
        },
        header: 'รายการสินค้า',
        Cell: ({ cell }: any) => {
          return cell.getValue() ? `${cell.getValue()} รายการ` : '-';
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.po?.netAmount ? row?.po?.netAmount : null;
        },
        header: 'ราคาสุทธิ',
        Cell: ({ cell }: any) => formatAmount(cell.getValue()) || '-',
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
        <>
          <div className="flex w-fit flex-col gap-2.5">
            <MaterialReactTable
              enableBottomToolbar={false}
              enableTopToolbar={false}
              columns={warehouseColumns}
              data={row?.original?.po?.poProducts}
              enableColumnOrdering={false}
              enableSorting={false}
              enablePagination={false}
              muiTableContainerProps={{ sx: { maxHeight: 300 } }}
            />
          </div>
        </>
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
              `${process.env.NEXT_PUBLIC_API_URL}/api/receive/product/${id}`
            );

            setPoId(data?.poId);
            const { data: poData } = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/account/po/${data?.poId}?companyId=${session?.company?.id}`
            );
            setPo(poData);

            resetForm({
              ...data,
              dateReceive: data?.dateReceive
                ? parseDate(data?.dateReceive)
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
                `${process.env.NEXT_PUBLIC_API_URL}/api/receive/product/${id}`
              );
              await mutate(
                `/api/receive/product?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
                `/api/receive/product?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
            startContent={<ArrowUpRight className="opacity-50" />}
            onClick={() => {
              window.open('/warehouse', '_blank');
            }}
            variant="bordered"
          >
            คลังสินค้าและสต็อก
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/receive/product/${id}`
                          );
                        })
                      );
                    }

                    await mutate(
                      `/api/receive/product?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
    <Layout sitename={'ใบรับสินค้า'}>
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
          <BreadcrumbItem>การซื้อสินค้า</BreadcrumbItem>
          <BreadcrumbItem>ใบรับสินค้า</BreadcrumbItem>
        </Breadcrumbs>

        <HeaderTitle title="ใบรับสินค้า" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          <CardSummary
            label={'ทั้งหมด'}
            value={receiveProductDashboard?.receiveProductCount}
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
