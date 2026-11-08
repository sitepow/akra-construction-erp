import HeaderTitle from '@/components/HeaderTitle';
import Layout from '@/components/Layout';
import {
  Alert,
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Card,
  CardBody,
  Chip,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  ScrollShadow,
  Select,
  SelectItem,
  Tooltip,
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
import useSWR, { mutate } from 'swr';
import Icon from '@mdi/react';
import { Controller, useForm } from 'react-hook-form';
import PageLoading from '@/components/LoadingPage';
import { MenuItem } from '@mui/material';
import {
  ArrowUpRight,
  CircleAlert,
  CircleCheck,
  CircleX,
  ClipboardIcon,
  Clock,
  Merge,
  PlusIcon,
  RefreshCcw,
  ScanBarcode,
  Search,
  Settings,
  Split,
  Trash,
  XIcon,
} from 'lucide-react';
import CardSummary from '@/components/CardSummary';
import { errorRequire } from '@/utils/regex';
import { parseDate } from '@internationalized/date';
import {
  formatAmount,
  convertDateJsonToDbSingle,
  formatThaiDateTime,
  apiPath,
  fetcher,
} from '@/utils';
const initForm = {
  projectId: '',
  supplierId: '',
  no: '',
  paymentFromBankId: null,
  paymentToBankId: null,
  status: 'complete',
  remark: '',
  paymentType: 'cash',
  warehouseMode: 'separate',
  zoneId: '',
  categoryId: '',
  totalAmount: 0,
  netAmount: 0,
};
const initCategoryForm = {
  categoryId: null,
  name: '',
  remark: '',
};
const initZoneForm = {
  zoneId: null,
  name: '',
  remark: '',
};
const initReceiptForm = {
  status: 'complete',
  dateReceive: parseDate(new Date().toISOString().split('T')[0]) as any,
};
import { Notyf } from 'notyf';
import axios from 'axios';

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
  const [categoryMode, setCategoryMode] = useState('create');
  const [zoneMode, setZoneMode] = useState('create');
  const [products, setProducts] = useState<any>([]);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [modalScreenLoading, setModalScreenLoading] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [po, setPo] = useState<any>();
  const [poId, setPoId] = useState<any>();
  const [poStatus, setPoStatus] = useState<any>();
  const [formReceiveMode, setFormReceiveMode] = useState('create');
  const [supplierBankFilter, setSupplierBankFilter] = useState<any>();
  const [productCategoryId, setProductCategoryId] = useState<any>();
  const [productId, setProductId] = useState<any>(null);
  const [receiveId, setReceiveId] = useState<any>(null);
  const [projectSelectId, setProjectSelectId] = useState<any>();
  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    reset: resetForm,
    watch: watchForm,
    control: controlForm,
    setValue: setValueForm,
    formState: { errors: errorsForm },
  } = useForm({
    defaultValues: initForm,
  });
  const {
    handleSubmit: handleSubmitCategoryForm,
    reset: resetCategoryForm,
    setValue: setValueCategoryForm,
    control: controlCategoryForm,
  } = useForm({
    defaultValues: initCategoryForm,
  });
  const {
    handleSubmit: handleSubmitZoneForm,
    reset: resetZoneForm,
    setValue: setValueZoneForm,
    control: controlZoneForm,
  } = useForm({
    defaultValues: initZoneForm,
  });
  const {
    register: registerReceiptForm,
    handleSubmit: handleSubmitReceiptForm,
    reset: resetReceiptForm,
    control: controlReceiptForm,
  } = useForm({
    defaultValues: initReceiptForm,
  });
  const [pagination, setPagination] = useState({ pageIndex: 1, pageItem: 20 });

  const { data: categories } = useSWR(
    `/api/account/po?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: supplierDropdown } = useSWR(
    `/api/supplier?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: companyBankDropdown } = useSWR(
    `/api/company/bank?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: supplierBankDropdown } = useSWR(
    `/api/supplier/bank?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: productCategoryDropdown } = useSWR(
    `/api/product/category?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: productDropdown } = useSWR(
    `/api/product?type=dropdown&companyId=${session?.company?.id}&categoryId=${productCategoryId}`,
    fetcher
  );
  const { data: poDashboard } = useSWR(
    `/api/dashboard?type=po&companyId=${session?.company?.id}`,
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

  useEffect(() => {
    const supplierBank = supplierBankDropdown?.filter(
      (item: any) => item?.supplierId == watchForm('supplierId')
    );

    setSupplierBankFilter(supplierBank);
  }, [watchForm('supplierId'), supplierBankDropdown]);

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
        size="4xl"
        scrollBehavior="inside"
        isOpen={isOpenModal}
        isDismissable={false}
        onClose={async () => {
          resetForm(initForm);
          setProductId(null);
          setProducts([]);
          onCloseModal();
        }}
      >
        <ModalContent>
          <ModalHeader>
            {formMode == 'create'
              ? 'เพิ่มใบสั่งซื้อสินค้าใหม่'
              : 'แก้ไขใบสั่งซื้อสินค้า'}
          </ModalHeader>
          <ModalBody>
            {supplierDropdown?.length == 0 && (
              <Alert
                color="danger"
                description={
                  <>
                    <span>
                      ขณะนี้ยังไม่มีข้อมูลซัพพลายเออร์{' '}
                      <span
                        className="underline cursor-pointer"
                        onClick={() => {
                          window.open('/supplier', '_blank');
                        }}
                      >
                        เพิ่มซัพพลายเออร์
                      </span>
                    </span>
                  </>
                }
                title={'แจ้งเตือน'}
              />
            )}

            {watchForm('paymentType') !== 'cash' &&
              (supplierBankFilter?.length == 0 ||
                supplierBankDropdown?.length == 0) && (
                <Alert
                  color="danger"
                  description={
                    <>
                      <span>
                        ขณะนี้ยังไม่มีข้อมูลธนาคารของซัพพลายเออร์{' '}
                        <span
                          className="underline cursor-pointer"
                          onClick={() => {
                            window.open('/supplier/bank', '_blank');
                          }}
                        >
                          เพิ่มธนาคารซัพพลายเออร์
                        </span>
                      </span>
                    </>
                  }
                  title={'แจ้งเตือน'}
                />
              )}

            {watchForm('paymentType') !== 'cash' &&
              companyBankDropdown?.length == 0 && (
                <Alert
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
                  title={'แจ้งเตือน'}
                />
              )}

            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <Input
                variant="bordered"
                {...registerForm('no', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm.no}
                errorMessage={`${errorsForm.no?.message}`}
                label="เลขที่ใบสั่งซื้อสินค้า"
              />

              <Select
                variant="bordered"
                label="ซัพพลายเออร์"
                {...registerForm('supplierId', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm.supplierId}
                errorMessage={errorsForm.supplierId?.message}
              >
                {supplierDropdown &&
                  supplierDropdown?.map((item: any) => {
                    return <SelectItem key={item?.id}>{item?.name}</SelectItem>;
                  })}
              </Select>
              <Select
                variant="bordered"
                label="การชำระเงิน"
                {...registerForm('paymentType', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm.paymentType}
                errorMessage={errorsForm.paymentType?.message}
              >
                <SelectItem key={'cash'}>เงินสด</SelectItem>
                <SelectItem key={'bank'}>เงินโอน</SelectItem>
              </Select>
              {watchForm('paymentType') !== 'cash' && (
                <>
                  <Select
                    variant="bordered"
                    label="บัญชีที่โอน"
                    {...registerForm('paymentFromBankId', {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                    })}
                    isInvalid={!!errorsForm.paymentFromBankId}
                    errorMessage={errorsForm.paymentFromBankId?.message}
                  >
                    {companyBankDropdown &&
                      companyBankDropdown?.map((item: any) => {
                        return (
                          <SelectItem key={item?.id}>
                            {item?.fullBank}
                          </SelectItem>
                        );
                      })}
                  </Select>
                  <Select
                    variant="bordered"
                    label="บัญชีที่รับโอน"
                    {...registerForm('paymentToBankId', {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                    })}
                    isInvalid={!!errorsForm.paymentToBankId}
                    errorMessage={errorsForm.paymentToBankId?.message}
                  >
                    {supplierBankFilter &&
                      supplierBankFilter?.map((item: any) => {
                        return (
                          <SelectItem key={item?.id}>
                            {item?.fullBank}
                          </SelectItem>
                        );
                      })}
                  </Select>
                </>
              )}
              <Controller
                control={controlForm}
                name="totalAmount"
                render={({ field: { value, onChange } }) => (
                  <Input
                    variant="bordered"
                    label="ยอดเงินรวม"
                    isDisabled
                    type="number"
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                  />
                )}
              />
              <Controller
                control={controlForm}
                name="netAmount"
                render={({ field: { value, onChange } }) => (
                  <Input
                    variant="bordered"
                    isDisabled
                    label="ยอดเงินสุทธิ"
                    type="number"
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                  />
                )}
              />
              <Input
                variant="bordered"
                label="หมายเหตุ (ถ้ามี)"
                {...registerForm('remark')}
              />
              {formMode == 'update' && (
                <>
                  <Select
                    isDisabled
                    variant="bordered"
                    label="สถานะใบสั่งซื้อสินค้า"
                    {...registerForm('status')}
                  >
                    <SelectItem key={'pending'}>รอชำระเงิน</SelectItem>
                    <SelectItem key={'complete'}>ดำเนินการเสร็จแล้ว</SelectItem>
                  </Select>
                </>
              )}
            </form>
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-end gap-2 flex-wrap">
              <Button
                radius="full"
                startContent={<ClipboardIcon className="opacity-50" />}
                variant="bordered"
                onClick={() => {
                  onCloseModal();
                  onOpenProductModal();
                }}
              >
                รายการสินค้า
              </Button>
              <Button
                radius="full"
                className="bg-primary text-white"
                isLoading={isApiLoading}
                startContent={!isApiLoading && <CircleCheck />}
                onClick={handleSubmitForm(async (data) => {
                  try {
                    if (products?.length == 0) {
                      return notyf.error(
                        'กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ'
                      );
                    }
                    setIsApiLoading(true);
                    const paperResponse =
                      formMode == 'create'
                        ? await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/account/po`,
                            {
                              ...data,
                              companyId: session?.company?.id,
                              products,
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/account/po/${projectSelectId}`,
                            {
                              ...data,
                              products,
                            }
                          );

                    if (formMode == 'update') {
                      setProducts([]);

                      const { data } = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/account/po/${projectSelectId}`
                      );

                      const newPoProducts = data?.poProducts?.map(
                        (item: any) => {
                          return { ...item, isUpdate: true };
                        }
                      );
                      setProducts(newPoProducts);
                    }

                    await mutate(
                      `/api/account/po?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
                    );
                    await mutate(
                      `/api/dashboard?type=po&companyId=${session?.company?.id}`
                    );
                    notyf.success(paperResponse?.data?.message);

                    setIsApiLoading(false);
                    onCloseModal();
                    resetForm(initForm);
                    setProducts([]);
                    setProductId(null);
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
    isOpen: isOpenReceiveModal,
    onOpen: onOpenReceiveModal,
    onClose: onCloseReceiveModal,
  } = useDisclosure();

  const formReceiveModal = () => {
    return (
      <Modal
        size="5xl"
        scrollBehavior="inside"
        isOpen={isOpenReceiveModal}
        isDismissable={false}
        onClose={() => {
          setPo(null);
          setPoId(null);
          setProductId(null);
          resetReceiptForm(initReceiptForm);
          onCloseReceiveModal();
        }}
      >
        <ModalContent>
          <ModalHeader>
            {formReceiveMode == 'create'
              ? 'สร้างใบรับสินค้า'
              : 'แก้ไขใบรับสินค้า'}
          </ModalHeader>
          <ModalBody>
            {poStatus == 'pending' && (
              <>
                <Alert
                  color="danger"
                  description={`กรุณาอัพเดตสถานะใบสั่งซื้อสินค้าเป็นชำระเงินก่อน
                  ถึงจะดำเนินการรับสินค้าเข้าคลังได้`}
                  title={'แจ้งเตือน'}
                />
              </>
            )}

            {poStatus == 'complete' && (
              <>
                <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <Select
                    variant="bordered"
                    label="สถานะใบรับสินค้า"
                    isDisabled
                    {...registerReceiptForm('status')}
                  >
                    <SelectItem key={'pending'}>ยังไม่ได้รับสินค้า</SelectItem>
                    <SelectItem key={'complete'}>ดำเนินการเสร็จแล้ว</SelectItem>
                  </Select>

                  <Controller
                    control={controlReceiptForm}
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
                    {formReceiveMode == 'create' && (
                      <>
                        <Alert
                          color="warning"
                          description={
                            <>
                              <span>
                                กรุณาตรวจสอบรายการสินค้าให้ครบถ้วน
                                ก่อนดำเนินการรับเข้าสินค้าในคลัง
                                โหมดการจัดเก็บสินค้าปัจจุบันของคุณคือ
                              </span>{' '}
                              <span>
                                `
                                {po?.warehouseMode == 'all'
                                  ? 'จัดเก็บสินค้าทั้งหมดในที่เดียวกัน'
                                  : po?.warehouseMode == 'separate'
                                    ? 'แยกจัดเก็บตามรายการสินค้า'
                                    : '-'}
                                `
                              </span>{' '}
                              {po?.warehouseMode === 'all' && (
                                <>
                                  <span>และจะจัดเก็บที่</span> `
                                  {
                                    zoneDropdown?.find(
                                      (zoneItem: any) =>
                                        zoneItem?.id == po?.zoneId
                                    )?.name
                                  }
                                  `{' '}
                                </>
                              )}
                              {po?.warehouseMode === 'all' && (
                                <>
                                  <span>ในหมวดหมู่คลังสินค้า</span>{' '}
                                  <span>
                                    `
                                    {
                                      categoryDropdown?.find(
                                        (zoneItem: any) =>
                                          zoneItem?.id == po?.categoryId
                                      )?.name
                                    }
                                    `
                                  </span>
                                </>
                              )}{' '}
                              <span>
                                คุณสามารถแก้ไขการตั้งค่าการจัดเก็บสินค้าของใบสั่งซื้อสินค้าได้
                                ก่อนสร้างใบรับสินค้า
                              </span>
                            </>
                          }
                          title={'แจ้งเตือน'}
                        />
                      </>
                    )}

                    <div className="flex flex-col gap-2.5">
                      {formReceiveMode == 'update' && (
                        <Alert
                          title="แจ้งเตือน"
                          color="success"
                          description={
                            <>
                              <span>
                                คุณได้ดำเนินการรับสินค้าในใบสั่งซื้อสินค้าและจัดเก็บเข้าสู่คลังสินค้าเรียบร้อยแล้ว
                                หากต้องการแก้ไขรายการสินค้าที่จัดเก็บ
                                คุณสามารถจัดการต่อได้ที่
                                <br />
                                <span
                                  className="underline cursor-pointer"
                                  onClick={() => {
                                    window.open('/protect/warehouse', '_blank');
                                  }}
                                >
                                  คลังสินค้าและสต็อก
                                </span>
                              </span>
                            </>
                          }
                        />
                      )}

                      <MaterialReactTable
                        enableBottomToolbar={false}
                        enableTopToolbar={false}
                        columns={warehouseColumns}
                        data={po?.poProducts}
                        enableColumnOrdering={false}
                        enableSorting={false}
                        enablePagination={false}
                        muiTableContainerProps={{ sx: { maxHeight: 300 } }}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-end gap-2 flex-wrap">
              {poStatus == 'pending' && (
                <Button
                  radius="full"
                  onClick={() => {
                    onCloseReceiveModal();
                  }}
                  className="bg-primary text-white"
                >
                  ตกลง
                </Button>
              )}

              {poStatus == 'complete' && (
                <Button
                  radius="full"
                  className="bg-primary text-white"
                  isLoading={isApiLoading}
                  startContent={!isApiLoading && <CircleCheck />}
                  onClick={handleSubmitReceiptForm(async (data) => {
                    try {
                      if (!poId) return;
                      setIsApiLoading(true);
                      const paperResponse =
                        formReceiveMode == 'create'
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
                              `${process.env.NEXT_PUBLIC_API_URL}/api/receive/product/${receiveId}`,
                              {
                                ...data,
                                poId,
                                dateReceive: convertDateJsonToDbSingle(
                                  data?.dateReceive
                                ),
                              }
                            );
                      await mutate(
                        `/api/account/po?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
                      );
                      await mutate(
                        `/api/dashboard?type=po&companyId=${session?.company?.id}`
                      );
                      notyf.success(paperResponse?.data?.message);
                      setIsApiLoading(false);
                      setPo(null);
                      setPoId(null);
                      resetReceiptForm(initReceiptForm);
                      onCloseReceiveModal();
                    } catch (error: any) {
                      notyf.error(error?.response?.data);
                      setIsApiLoading(false);
                      console.log(error);
                    }
                  })}
                >
                  {formReceiveMode == 'create' ? 'บันทึกข้อมูล' : 'แก้ไขข้อมูล'}
                </Button>
              )}
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  const {
    isOpen: isOpenProductModal,
    onOpen: onOpenProductModal,
    onClose: onCloseProductModal,
  } = useDisclosure();

  const handleInputChange = (index: number, field: string, value: any) => {
    const updatedProducts = [...products];
    const currentProduct = updatedProducts[index];

    updatedProducts[index] = {
      ...currentProduct,
      [field]: value,
    };

    if (field === 'qty') {
      if (value < 1) {
        notyf.error(`จำนวนสินค้าต้องไม่น้อยกว่า 1 ${currentProduct.unit}`);
        return;
      }
    }

    setProducts(updatedProducts);
  };

  const calculateTotalAmounts = () => {
    let total = 0;
    let isPass = true;
    let isSellFixPass = true;
    const updatedProducts = products.map((product: any) => {
      const productTotal = product.qty * product.price;

      isPass =
        !!product?.no &&
        !!product?.isCanFix &&
        !!product?.isCanSell &&
        !!product?.categoryId &&
        !!product?.zoneId;

      isSellFixPass =
        !!product?.isCanFix && !!product?.isCanSell && !!product?.no;
      total += productTotal;
      return {
        ...product,
        totalAmount: productTotal,
      };
    });

    setValueForm('netAmount', total);
    setValueForm('totalAmount', total);

    if (watchForm('warehouseMode') == 'all') {
      const categoryId = watchForm('categoryId');
      const zoneId = watchForm('zoneId');

      if (!categoryId || !zoneId) {
        notyf.error(
          `กรุณากรอกข้อมูล หมวดหมู่คลังสินค้า, สถานที่จัดเก็บ ให้ครบถ้วน`
        );
        return false;
      }

      if (!isSellFixPass) {
        notyf.error(
          `กรุณากรอกข้อมูล เลขรหัสสินค้า, เป็นสินค้าซ่อมได้หรือไม่? (ถ้ามี), เป็นสินค้าขายได้หรือไม่? (ถ้ามี) ให้ครบถ้วน`
        );
        return false;
      }
    } else if (!watchForm('warehouseMode')) {
      notyf.error(`กรุณาเลือกโหมดการจัดเก็บคลังสินค้าก่อน`);
      return false;
    }

    if (!isPass && watchForm('warehouseMode') != 'all') {
      notyf.error(
        `กรุณากรอกข้อมูล เลขรหัสสินค้า, หมวดหมู่คลังสินค้า (ถ้ามี), และ สถานที่จัดเก็บ (ถ้ามี), เป็นสินค้าซ่อมได้หรือไม่? (ถ้ามี), เป็นสินค้าขายได้หรือไม่? (ถ้ามี) ให้ครบถ้วน`
      );
      return isPass;
    }

    setProducts(updatedProducts);
    return true;
  };

  const productModal = () => {
    return (
      <Modal
        size="4xl"
        isDismissable={false}
        onClose={() => {
          const isPass = calculateTotalAmounts();
          if (!isPass) {
            setValueForm('netAmount', 0);
            setValueForm('totalAmount', 0);
          }
          onCloseProductModal();
          setProductId(null);
          setProducts([]);
          onOpenModal();
        }}
        scrollBehavior="inside"
        isOpen={isOpenProductModal}
      >
        <ModalContent>
          <ModalHeader>เพิ่มสินค้าในใบสั่งซื้อสินค้า</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-2.5 h-full">
              {productCategoryDropdown?.length == 0 && (
                <Alert
                  title="แจ้งเตือน"
                  color="danger"
                  description={
                    <>
                      <span>
                        ขณะนี้ยังไม่มีข้อมูลหมวดหมู่สินค้า{' '}
                        <span
                          className="underline cursor-pointer"
                          onClick={() => {
                            window.open('/product/category', '_blank');
                          }}
                        >
                          เพิ่มหมวดหมู่สินค้าใหม่
                        </span>
                      </span>
                    </>
                  }
                />
              )}
              {productCategoryId && productDropdown?.length == 0 && (
                <Alert
                  title="แจ้งเตือน"
                  color="danger"
                  description={
                    <>
                      <span>
                        ขณะนี้ยังไม่มีข้อมูลสินค้าที่เกี่ยวข้องกับหมวดหมู่ที่เลือก{' '}
                        <span
                          className="underline cursor-pointer"
                          onClick={() => {
                            window.open('/protect/product', '_blank');
                          }}
                        >
                          เพิ่มสินค้าใหม่
                        </span>
                      </span>
                    </>
                  }
                />
              )}
              <div className="grid grid-cols-3 gap-2.5">
                <Select
                  variant="bordered"
                  label="โหมดการจัดเก็บ"
                  {...registerForm('warehouseMode', {
                    required: {
                      value: true,
                      message: errorRequire(),
                    },
                  })}
                >
                  <SelectItem key={'all'}>
                    จัดเก็บสินค้าทั้งหมดในที่เดียวกัน
                  </SelectItem>
                  <SelectItem key={'separate'}>
                    แยกจัดเก็บตามรายการสินค้า
                  </SelectItem>
                </Select>

                {watchForm('warehouseMode') == 'all' && (
                  <>
                    <Select
                      variant="bordered"
                      isDisabled={formReceiveMode == 'update'}
                      label="หมวดหมู่คลังสินค้า"
                      {...registerForm('categoryId', {
                        required: {
                          value: true,
                          message: errorRequire(),
                        },
                      })}
                    >
                      {categoryDropdown &&
                        categoryDropdown?.map((item: any) => {
                          return (
                            <SelectItem key={item?.id}>{item?.name}</SelectItem>
                          );
                        })}
                    </Select>
                    <Select
                      variant="bordered"
                      isDisabled={formReceiveMode == 'update'}
                      label="สถานที่จัดเก็บ"
                      {...registerForm('zoneId', {
                        required: {
                          value: true,
                          message: errorRequire(),
                        },
                      })}
                    >
                      {zoneDropdown &&
                        zoneDropdown?.map((item: any) => {
                          return (
                            <SelectItem key={item?.id}>{item?.name}</SelectItem>
                          );
                        })}
                    </Select>
                  </>
                )}
              </div>

              <div className="grid sm:grid-cols-3 items-center gap-2.5">
                <Select
                  variant="bordered"
                  label="กรองสินค้าจากหมวดหมู่"
                  onChange={(e: any) => {
                    const id = e.target.value;
                    setProductCategoryId(id);
                    setProductId(null);
                  }}
                >
                  {productCategoryDropdown &&
                    productCategoryDropdown?.map((item: any) => {
                      return (
                        <SelectItem key={item?.id}>{item?.name}</SelectItem>
                      );
                    })}
                </Select>
                <Select
                  variant="bordered"
                  label="สินค้า"
                  onChange={(e: any) => {
                    const id = e.target.value;
                    setProductId(id);
                  }}
                >
                  {productDropdown &&
                    productDropdown?.map((item: any) => {
                      return (
                        <SelectItem key={item?.id}>
                          {item?.fullProductName}
                        </SelectItem>
                      );
                    })}
                </Select>
                <Button
                  radius="full"
                  startContent={<PlusIcon />}
                  className="bg-primary text-white w-fit"
                  onClick={() => {
                    if (productId) {
                      const findProduct = productDropdown?.find(
                        (item: any) => item?.id == productId
                      ) as any;

                      const isProductExist = products.some(
                        (product: any) => product.productId === findProduct?.id
                      );

                      if (isProductExist) {
                        return notyf.error(`มีสินค้านี้แล้วในรายการ`);
                      }

                      setProducts([
                        ...products,
                        {
                          productId: findProduct?.id,
                          productName: findProduct?.name,
                          qty: '1',
                          unit: findProduct?.unit,
                          price: findProduct?.priceBuy || 1,
                          totalAmount: '',
                          remark: '',
                          isCanFix: 'not_fix',
                          isCanSell: 'not_sell',
                          zoneId: null,
                          categoryId: null,
                        },
                      ]);
                    } else {
                      notyf.error(`กรุณาเลือกสินค้าก่อน`);
                    }
                  }}
                >
                  เพิ่มสินค้าใหม่
                </Button>
              </div>
            </div>

            <ScrollShadow className="max-h-96 p-1">
              {products?.length > 0 && (
                <div className="flex flex-col gap-2.5 mb-2.5">
                  <Alert
                    title="แจ้งเตือน"
                    color="warning"
                    description={
                      <>
                        <span>
                          กรุณากรอกข้อมูล{' '}
                          <span className="underline">เลขรหัสสินค้า</span>,{' '}
                          <span className="underline">
                            หมวดหมู่คลังสินค้า (ถ้ามี)
                          </span>
                          , และ{' '}
                          <span className="underline">
                            สถานที่จัดเก็บ (ถ้ามี)
                          </span>
                          ,{' '}
                          <span className="underline">
                            เป็นสินค้าซ่อมได้หรือไม่? (ถ้ามี)
                          </span>
                          ,{' '}
                          <span className="underline">
                            เป็นสินค้าขายได้หรือไม่? (ถ้ามี)
                          </span>{' '}
                          ให้ครบถ้วน
                          เนื่องจากข้อมูลเหล่านี้มีความสำคัญต่อการจัดเก็บสินค้าในคลัง
                          หากกรอกข้อมูลสินค้าไม่ครบและทำการยกเลิก
                          ระบบจะล้างข้อมูลสินค้าที่กรอกไว้ทั้งหมด
                        </span>
                      </>
                    }
                  />

                  <Alert
                    title="แจ้งเตือน"
                    description={
                      <>
                        <span>
                          อธิบายฟังก์ชัน{' '}
                          <span className="underline">
                            เป็นสินค้าซ่อมได้หรือไม่?
                          </span>{' '}
                          หากสินค้านั้นสามารถซ่อมบำรุงได้
                          หมายความว่าจะสามารถสร้างรายซ่อมบำรุงและเปลี่ยนอะไหล่ของสินค้านั้นได้
                          ตัวอย่างเช่น หากเป็นสินค้า "รถยนต์ Isuzu 1.9"
                          ซึ่งสามารถซ่อมบำรุงได้
                          ก็จะสามารถนำไปสร้างรายซ่อมบำรุงและเปลี่ยนอะไหล่ได้
                          แต่หากสินค้านั้นไม่สามารถซ่อมบำรุงได้
                          จะถือว่าเป็นอะไหล่สำหรับการเปลี่ยนหรือใช้งานทั่วไปเท่านั้น
                        </span>
                      </>
                    }
                  />
                </div>
              )}

              {products.map((product: any, index: any) => (
                <Card
                  key={product.productId}
                  shadow="none"
                  className="border dark:border-dark mb-2.5"
                >
                  <CardBody>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5 items-center">
                      <Input
                        variant="bordered"
                        isRequired
                        endContent={
                          <Tooltip content="สแกนบาร์โค้ด">
                            <ScanBarcode className="opacity-20 hover:opacity-100 cursor-pointer" />
                          </Tooltip>
                        }
                        label="รหัสสินค้า (เลขS/N, ทะเบียนรถ, etc.)"
                        value={product.no}
                        onChange={(e) =>
                          handleInputChange(index, 'no', e.target.value)
                        }
                      />
                      <Input
                        variant="bordered"
                        label="ชื่อสินค้า"
                        value={product?.productName || product?.product?.name}
                      />
                      <Input
                        variant="bordered"
                        label="จำนวน"
                        type="number"
                        value={product.qty}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            'qty',
                            Number(e.target.value)
                          )
                        }
                      />
                      <Input
                        variant="bordered"
                        label="ราคาซื้อ (~ประมาน)"
                        type="number"
                        value={product.price}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            'price',
                            Number(e.target.value)
                          )
                        }
                      />
                      <Input
                        variant="bordered"
                        label="หน่วยนับ"
                        isDisabled
                        value={product?.unit || product?.product?.unit}
                      />
                      <Input
                        variant="bordered"
                        label="ราคารวม"
                        type="number"
                        isDisabled
                        value={product.totalAmount}
                      />
                      <Input
                        variant="bordered"
                        label="หมายเหตุ (ถ้ามี)"
                        onChange={(e) =>
                          handleInputChange(index, 'remark', e.target.value)
                        }
                      />
                      <Select
                        variant="bordered"
                        label="เป็นสินค้าซ่อมได้หรือไม่?"
                        defaultSelectedKeys={[product?.isCanFix]}
                        onChange={(e) =>
                          handleInputChange(index, 'isCanFix', e.target.value)
                        }
                      >
                        <SelectItem key="fix">สามารถซ่อมบำรุงได้</SelectItem>
                        <SelectItem key="not_fix">
                          ไม่สามารถนำไปซ่อมได้
                        </SelectItem>
                      </Select>
                      <Select
                        variant="bordered"
                        label="เป็นสินค้าขายได้หรือไม่?"
                        defaultSelectedKeys={[product?.isCanSell]}
                        onChange={(e) =>
                          handleInputChange(index, 'isCanSell', e.target.value)
                        }
                      >
                        <SelectItem key="sell">สามารถนำไปขายได้</SelectItem>
                        <SelectItem key="not_sell">
                          ไม่สามารถนำไปขายได้
                        </SelectItem>
                      </Select>
                      {watchForm('warehouseMode') == 'separate' && (
                        <>
                          <Select
                            variant="bordered"
                            defaultSelectedKeys={[product?.categoryId]}
                            isDisabled={formReceiveMode == 'update'}
                            label="หมวดหมู่คลังสินค้า"
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                'categoryId',
                                e.target.value
                              )
                            }
                          >
                            {categoryDropdown &&
                              categoryDropdown?.map((item: any) => {
                                return (
                                  <SelectItem key={item?.id}>
                                    {item?.name}
                                  </SelectItem>
                                );
                              })}
                          </Select>
                          <Select
                            isRequired
                            variant="bordered"
                            isDisabled={formReceiveMode == 'update'}
                            label="สถานที่จัดเก็บ"
                            defaultSelectedKeys={[product?.zoneId]}
                            onChange={(e) =>
                              handleInputChange(index, 'zoneId', e.target.value)
                            }
                          >
                            {zoneDropdown &&
                              zoneDropdown?.map((item: any) => {
                                return (
                                  <SelectItem key={item?.id}>
                                    {item?.name}
                                  </SelectItem>
                                );
                              })}
                          </Select>
                        </>
                      )}
                      <Button
                        radius="full"
                        isIconOnly
                        startContent={<XIcon />}
                        variant="bordered"
                        className="border-none text-danger-800"
                        onClick={async () => {
                          if (formMode == 'update' && product?.isUpdate) {
                            try {
                              onCloseProductModal();
                              setModalScreenLoading(true);
                              await axios.delete(
                                `${process.env.NEXT_PUBLIC_API_URL}/api/account/po/product/${product?.id}`
                              );

                              const productFilterRemove = products.filter(
                                (_: any, i: any) => i !== index
                              );

                              setProducts(productFilterRemove);

                              const filterProductStatusUpdate =
                                productFilterRemove?.filter(
                                  (item: any) => item?.isUpdate == true
                                );

                              const filterProductStatusUpdateSum =
                                filterProductStatusUpdate?.reduce(
                                  (totalAmount: number, item: any) => {
                                    return totalAmount + item.totalAmount;
                                  },
                                  0
                                );

                              await axios.put(
                                `${process.env.NEXT_PUBLIC_API_URL}/api/account/po/${projectSelectId}`,
                                {
                                  totalAmount: filterProductStatusUpdateSum,
                                  netAmount: filterProductStatusUpdateSum,
                                }
                              );

                              await mutate(
                                `/api/account/po?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
                              );
                              await mutate(
                                `/api/dashboard?type=po&companyId=${session?.company?.id}`
                              );

                              setModalScreenLoading(false);
                              onOpenProductModal();
                            } catch (error) {
                              onOpenProductModal();
                              setModalScreenLoading(false);
                              console.log(error);
                            }
                          } else {
                            setProducts(
                              products.filter((_: any, i: any) => i !== index)
                            );
                          }
                        }}
                      ></Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </ScrollShadow>
          </ModalBody>
          <ModalFooter>
            <div className="flex gap-2.5 flex-wrap">
              {/* <Button
              radius="full"
                variant="bordered"
                startContent={<Settings className="opacity-50" />}
                onClick={() => {
                  onOpenCategoryModal();
                }}
              >
                หมวดหมู่คลังสินค้า
              </Button>

              <Button
              radius="full"
                variant="bordered"
                startContent={<Settings className="opacity-50" />}
                onClick={() => {
                  onOpenZoneModal();
                }}
              >
                สถานที่จัดเก็บ
              </Button> */}

              {products?.length !== 0 && (
                <>
                  <Button
                    radius="full"
                    onClick={calculateTotalAmounts}
                    startContent={<RefreshCcw className="opacity-50" />}
                    variant="bordered"
                  >
                    คำนวนราคา
                  </Button>
                  <Button
                    radius="full"
                    startContent={!isApiLoading && <CircleCheck />}
                    onClick={() => {
                      const isPass = calculateTotalAmounts();
                      if (!isPass) {
                        return;
                      }
                      onCloseProductModal();
                      onOpenModal();
                    }}
                    className="bg-primary text-white"
                  >
                    บันทึกข้อมูล
                  </Button>
                </>
              )}
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  const {
    isOpen: isOpenCategoryModal,
    onOpen: onOpenCategoryModal,
    onClose: onCloseCategoryModal,
  } = useDisclosure();

  const formCategoryModal = () => {
    return (
      <Modal
        scrollBehavior="inside"
        isOpen={isOpenCategoryModal}
        isDismissable={false}
        onClose={() => {
          resetCategoryForm(initCategoryForm);
          setCategoryMode('create');
          onCloseCategoryModal();
        }}
      >
        <ModalContent>
          <ModalHeader>จัดการหมวดหมู่คลังสินค้า</ModalHeader>
          <ModalBody>
            <form className="flex flex-col gap-2.5">
              <Controller
                control={controlCategoryForm}
                name="name"
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
                  <Input
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                    isInvalid={!!error}
                    errorMessage={error?.message}
                    variant="bordered"
                    label="ชื่อหมวดหมู่คลังสินค้า"
                  />
                )}
              />
              <div className="flex gap-2.5 justify-end">
                <Button
                  radius="full"
                  startContent={!isApiLoading && <CircleCheck />}
                  onClick={handleSubmitCategoryForm(async (data) => {
                    try {
                      let response;
                      if (categoryMode == 'create') {
                        response = await axios.post(
                          `${apiPath}/api/warehouse/category`,
                          {
                            ...data,
                            companyId: session?.company?.id,
                          }
                        );
                      } else {
                        response = await axios.put(
                          `${apiPath}/api/warehouse/category/${data?.categoryId}`,
                          {
                            ...data,
                          }
                        );
                      }
                      await mutate(
                        `/api/warehouse/category?type=dropdown&companyId=${session?.company?.id}`
                      );
                      resetCategoryForm(initCategoryForm);
                      setCategoryMode('create');
                      notyf.success(response?.data?.message);
                    } catch (error: any) {
                      notyf?.error(error?.response?.data);
                      console.log(error);
                    }
                  })}
                  className="bg-primary text-white"
                >
                  {categoryMode == 'create' ? 'บันทึกข้อมูล' : 'แก้ไขข้อมูล'}
                </Button>
                {categoryMode == 'update' && (
                  <Button
                    radius="full"
                    startContent={<CircleX />}
                    onClick={() => {
                      resetCategoryForm(initCategoryForm);
                      setCategoryMode('create');
                    }}
                    className="border-primary text-primary"
                    variant="bordered"
                  >
                    ยกเลิก
                  </Button>
                )}
              </div>
            </form>

            <ScrollShadow className="max-h-96">
              {categoryDropdown?.map((item: any) => {
                return (
                  <Card className="my-1.5 border dark:border-dark" shadow="sm">
                    <CardBody>
                      <div className="w-full flex justify-between">
                        <span>{item?.name}</span>

                        <div className="flex gap-2.5">
                          <Settings
                            onClick={() => {
                              setValueCategoryForm('name', item?.name);
                              setValueCategoryForm('categoryId', item?.id);
                              setCategoryMode('update');
                            }}
                            className="opacity-20 cursor-pointer hover:opacity-100"
                          />
                          <Trash
                            onClick={async () => {
                              try {
                                await axios.delete(
                                  `${apiPath}/api/warehouse/category/${item?.id}`
                                );
                                await mutate(
                                  `/api/warehouse/category?type=dropdown&companyId=${session?.company?.id}`
                                );
                              } catch (error: any) {
                                notyf.error(error?.response?.data);
                                console.log(error);
                              }
                            }}
                            className="opacity-20 cursor-pointer hover:opacity-100"
                          />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </ScrollShadow>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  const {
    isOpen: isOpenZoneModal,
    onOpen: onOpenZoneModal,
    onClose: onCloseZoneModal,
  } = useDisclosure();

  const formZoneModal = () => {
    return (
      <Modal
        scrollBehavior="inside"
        isOpen={isOpenZoneModal}
        isDismissable={false}
        onClose={() => {
          resetZoneForm(initZoneForm);
          setZoneMode('create');
          onCloseZoneModal();
        }}
      >
        <ModalContent>
          <ModalHeader>จัดการสถานที่จัดเก็บ</ModalHeader>
          <ModalBody>
            <form className="flex flex-col gap-2.5">
              <Controller
                control={controlZoneForm}
                name="name"
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
                  <Input
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                    isInvalid={!!error}
                    errorMessage={error?.message}
                    variant="bordered"
                    label="ชื่อสถานที่จัดเก็บ"
                  />
                )}
              />
              <div className="flex gap-2.5 justify-end">
                <Button
                  radius="full"
                  startContent={!isApiLoading && <CircleCheck />}
                  onClick={handleSubmitZoneForm(async (data) => {
                    try {
                      let response;
                      if (zoneMode == 'create') {
                        response = await axios.post(
                          `${apiPath}/api/warehouse/zone`,
                          {
                            ...data,
                            companyId: session?.company?.id,
                          }
                        );
                      } else {
                        response = await axios.put(
                          `${apiPath}/api/warehouse/zone/${data?.zoneId}`,
                          {
                            ...data,
                          }
                        );
                      }
                      await mutate(
                        `/api/warehouse/zone?type=dropdown&companyId=${session?.company?.id}`
                      );
                      resetZoneForm(initZoneForm);
                      setZoneMode('create');
                      notyf.success(response?.data?.message);
                    } catch (error: any) {
                      notyf?.error(error?.response?.data);
                      console.log(error);
                    }
                  })}
                  className="bg-primary text-white"
                >
                  {zoneMode == 'create' ? 'บันทึกข้อมูล' : 'แก้ไขข้อมูล'}
                </Button>
                {zoneMode == 'update' && (
                  <Button
                    radius="full"
                    startContent={<CircleX />}
                    onClick={() => {
                      resetZoneForm(initZoneForm);
                      setZoneMode('create');
                    }}
                    className="border-primary text-primary"
                    variant="bordered"
                  >
                    ยกเลิก
                  </Button>
                )}
              </div>
            </form>

            <ScrollShadow className="max-h-96">
              {zoneDropdown?.map((item: any) => {
                return (
                  <Card className="my-1.5 border dark:border-dark" shadow="sm">
                    <CardBody>
                      <div className="w-full flex justify-between">
                        <span>{item?.name}</span>

                        <div className="flex gap-2.5">
                          <Settings
                            onClick={() => {
                              setValueZoneForm('name', item?.name);
                              setValueZoneForm('zoneId', item?.id);
                              setZoneMode('update');
                            }}
                            className="opacity-20 cursor-pointer hover:opacity-100"
                          />
                          <Trash
                            onClick={async () => {
                              try {
                                await axios.delete(
                                  `${apiPath}/api/warehouse/zone/${item?.id}`
                                );
                                await mutate(
                                  `/api/warehouse/zone?type=dropdown&companyId=${session?.company?.id}`
                                );
                              } catch (error: any) {
                                notyf.error(error?.response?.data);
                                console.log(error);
                              }
                            }}
                            className="opacity-20 cursor-pointer hover:opacity-100"
                          />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </ScrollShadow>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'รหัสประจำตัวใบสั่งซื้อสินค้า',
        size: 50,
      },
      {
        accessorKey: 'no',
        header: 'เลขที่ใบสั่งซื้อสินค้า',
        size: 250,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'status',
        header: 'สถานะใบสั่งซื้อสินค้า',
        size: 250,
        Cell: ({ cell }: any) => {
          const status = cell.getValue();
          return status == 'pending' ? (
            <Chip variant="flat" color="warning" startContent={<Clock />}>
              รอชำระเงิน
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
          return row?.receiveProduct?.status
            ? row?.receiveProduct?.status
            : null;
        },
        header: 'สถานะใบรับสินค้า',
        Cell: ({ cell }: any) => {
          const status = cell.getValue();
          return status == 'pending' ? (
            <Chip variant="flat" color="warning" startContent={<Clock />}>
              ยังไม่ได้รับสินค้า
            </Chip>
          ) : status == 'complete' ? (
            <Chip color="success" variant="flat" startContent={<CircleCheck />}>
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
        accessorKey: 'warehouseMode',
        header: 'โหมดการจัดเก็บสินค้า',
        size: 250,
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
          return row?.supplier?.name ? row?.supplier?.name : '-';
        },
        header: 'ชื่อซัพพลายเออร์',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorFn: (row: any) => {
          return row?.poProducts?.length !== 0 ? row?.poProducts?.length : null;
        },
        header: 'รายการสินค้า',
        Cell: ({ cell }: any) => {
          const item = cell.getValue();

          return item ? `${cell.getValue()} รายการ` : '-';
        },
      },
      {
        accessorKey: 'totalAmount',
        header: 'ยอดเงินรวม',
        muiTableBodyCellProps: {
          sx: { textAlign: 'right' },
        },
        size: 250,
        Cell: ({ cell }: any) => formatAmount(cell.getValue()) || '-',
      },
      {
        accessorKey: 'netAmount',
        header: 'ยอดเงินสุทธิ',
        muiTableBodyCellProps: {
          sx: { textAlign: 'right' },
        },
        size: 250,
        Cell: ({ cell }: any) => formatAmount(cell.getValue()) || '-',
      },
      {
        accessorFn: (row: any) => {
          return row?.fromCompany?.fullBank ? row?.fromCompany?.fullBank : '-';
        },
        header: 'บัญชีที่โอน',
        size: 350,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorFn: (row: any) => {
          return row?.toSupplier?.fullBank ? row?.toSupplier?.fullBank : '-';
        },
        header: 'บัญชีที่รับโอน',
        size: 350,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'remark',
        header: 'หมายเหตุ (ถ้ามี)',
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
    data: categories?.data || [],
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
    renderDetailPanel: ({ row }) => {
      return (
        <div className="felx flex-col w-fit gap-2.5">
          {!row?.original?.receiveId && (
            <Button
              radius="full"
              className="mb-2.5"
              onClick={async () => {
                try {
                  setModalScreenLoading(true);
                  setPoId(row?.original?.id);
                  setPoStatus(row?.original?.status);
                  const { data: poData } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/account/po/${row?.original?.id}?companyId=${session?.company?.id}`
                  );
                  setPo(poData);

                  setFormReceiveMode('create');
                  onOpenReceiveModal();
                  setPoId(row?.original.id);
                  setModalScreenLoading(false);
                } catch (error) {
                  console.log(error);
                }
              }}
              variant="bordered"
            >
              รับสินค้าเข้าคลังสินค้า
            </Button>
          )}

          {row?.original?.receiveProduct && (
            <div className="flex flex-col w-fit gap-2.5">
              <div className="flex flex-col gap-2.5">
                <MaterialReactTable
                  enableBottomToolbar={false}
                  enableTopToolbar={false}
                  columns={warehouseColumns}
                  data={row?.original?.poProducts}
                  enableColumnOrdering={false}
                  enableSorting={false}
                  enablePagination={false}
                  muiTableContainerProps={{ sx: { maxHeight: 300 } }}
                />
              </div>
            </div>
          )}
        </div>
      );
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
              `${process.env.NEXT_PUBLIC_API_URL}/api/account/po/${id}`
            );

            const newPoProducts = data?.poProducts?.map((item: any) => {
              return { ...item, isUpdate: true };
            });

            setProducts(newPoProducts);

            const supplierBank = supplierBankDropdown?.filter(
              (item: any) => item?.supplierId == data?.supplierId
            );

            setSupplierBankFilter(supplierBank);

            resetForm({
              ...data,
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
                `${process.env.NEXT_PUBLIC_API_URL}/api/account/po/${id}`
              );
              await mutate(
                `/api/account/po?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
                `/api/account/po?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
            เพิ่มใบสั่งซื้อสินค้าใหม่
          </Button>

          <Button
            radius="full"
            startContent={<ArrowUpRight className="opacity-50" />}
            onClick={() => {
              window.open('/protect/warehouse', '_blank');
            }}
            variant="bordered"
          >
            คลังสินค้าและสต็อก
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/account/po/${id}`
                          );
                        })
                      );
                    }

                    await mutate(
                      `/api/account/po?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
    <Layout sitename={'ใบสั่งซื้อสินค้า'}>
      {formModal()}
      {productModal()}
      {formReceiveModal()}
      {modalScreenLoading && PageLoading()}
      {formCategoryModal()}
      {formZoneModal()}

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
          <BreadcrumbItem>ใบสั่งซื้อสินค้า</BreadcrumbItem>
        </Breadcrumbs>

        <HeaderTitle title="ใบสั่งซื้อสินค้า" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          <CardSummary
            label={'ทั้งหมด'}
            value={poDashboard?.poCount}
            suffix={'รายการ'}
          />
          <CardSummary
            label={'ยังไม่ได้ชำระเงิน'}
            value={poDashboard?.poPendingCount}
            suffix={'รายการ'}
          />
          <CardSummary
            label={'ดำเนินการเสร็จแล้ว'}
            value={poDashboard?.poSuccessCount}
            suffix={'รายการ'}
          />
          <CardSummary
            label={'เงินทั้งหมด'}
            isMoney
            value={poDashboard?.poNetTotal}
            suffix={'บาท'}
          />
          <CardSummary
            label={'ยังไม่ได้ชำระเงิน'}
            isMoney
            value={poDashboard?.poPendingNetTotal}
            suffix={'บาท'}
          />
          <CardSummary
            label={'ดำเนินการเสร็จแล้ว'}
            isMoney
            value={poDashboard?.poSuccessNetTotal}
            suffix={'บาท'}
          />
        </div>

        <MaterialReactTable table={table} />

        <div className="flex justify-end">
          <Pagination
            showControls
            total={categories?.allPages}
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
