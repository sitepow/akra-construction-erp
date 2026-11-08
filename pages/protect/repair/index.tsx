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
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  ScrollShadow,
  Select,
  SelectItem,
  useDisclosure,
  User,
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
import {
  ArrowDown,
  ArrowUp,
  CircleAlert,
  CircleCheck,
  ClipboardIcon,
  Clock,
  PlusIcon,
  RefreshCcw,
  Search,
  XIcon,
} from 'lucide-react';
import CardSummary from '@/components/CardSummary';
import { parseDate } from '@internationalized/date';
import { errorRequire } from '@/utils/regex';
const initForm = {
  name: '',
  warehouseId: null,
  status: 'working',
  cause: '',
  solution: '',
  isChangePart: true,
  partChange: '',
  datePending: parseDate(new Date().toISOString().split('T')[0]) as any,
  dateComplete: null,
  remark: '',
};
const initInventoryForm = {
  modeWithdraw: 'return',
  objectiveWithdraw: 'repair_use',
  projectId: null,
  repairId: null,
  expectedDateReturn: null,
  dateReturn: null,
  remark: '',
  explain: '',
  totalWithdraw: 0,
  totalReturn: 0,
};
const initPaymentForm = {
  companyId: null,
  repairId: null,
  warehouseId: null,
  approvedId: null,
  approvedStatus: '',
  approvedRemark: '',
  paymentType: 'cash',
  fixStatus: 'complete',
  status: 'complete',
  datePayment: parseDate(new Date().toISOString().split('T')[0]) as any,
  paymentFromBankId: null,
  remark: '',
  expenses: '',
  netAmount: 0,
};
const statusMapping = {
  pending: { text: 'กำลังรอดำเนินการ', color: 'danger', icon: <CircleAlert /> },
  working: { text: 'กำลังซ่อมบำรุง', color: 'warning', icon: <Clock /> },
  inComplete: {
    text: 'ซ่อมบำรุงไม่สำเร็จ',
    color: 'danger',
    icon: <CircleAlert />,
  },
  waitingPayment: {
    text: 'รอการจ่ายค่าจ้าง',
    color: 'warning',
    icon: <CircleAlert />,
  },
  complete: {
    text: 'ซ่อมบำรุงสำเร็จ',
    color: 'success',
    icon: <CircleCheck />,
  },
} as any;
import { Notyf } from 'notyf';
import {
  formatAmount,
  formatThaiDateTime,
  convertDateJsonToDbSingle,
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
  const [products, setProducts] = useState<any>([]);
  const [returnProducts, setReturnProducts] = useState<any>([]);
  const [returnProductArrays, setReturnProductArrays] = useState<any>([]);
  const [productId, setProductId] = useState<any>(null);
  const [returnProductId, setReturnProductId] = useState<any>(null);
  const [formPaymentMode, setFormPaymentMode] = useState('create');
  const [categoryId, setCategoryId] = useState('all');
  const [repairId, setRepairId] = useState<any>();
  const [repairPaymentId, setRepairPaymentId] = useState<any>();
  const [inventoryId, setInventoryId] = useState<any>();
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [modalScreenLoading, setModalScreenLoading] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formInventoryMode, setFormInventoryMode] = useState('create');
  const [projectSelectId, setProjectSelectId] = useState<any>();

  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    reset: resetForm,
    watch: watchForm,
    formState: { errors: errorsForm },
  } = useForm({
    defaultValues: initForm,
  });
  const {
    register: registerInventoryForm,
    handleSubmit: handleSubmitInventoryForm,
    reset: resetInventoryForm,
    control: controlInventoryForm,
    setValue: setValueInventoryForm,
    watch: watchInventoryForm,
    formState: { errors: errorsInventoryForm },
  } = useForm({
    defaultValues: initInventoryForm,
  });
  const {
    register: registerPaymentForm,
    handleSubmit: handleSubmitPaymentForm,
    reset: resetPaymentForm,
    watch: watchPaymentForm,
    setValue: setValuePaymentForm,
    formState: { errors: errorsPaymentForm },
  } = useForm({
    defaultValues: initPaymentForm,
  });

  useEffect(() => {
    setProductId(null);
  }, [categoryId]);

  const warehouseColumnsWithdraw = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        header: 'โหมดการกระทำ',
        Cell: ({ cell }: any) => {
          return (
            <Chip variant="flat" startContent={<ArrowDown />} color="success">
              เบิกสินค้า
            </Chip>
          );
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.warehouse?.no;
        },
        header: 'รหัสสินค้า',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.warehouse?.product?.name;
        },
        header: 'ชื่อสินค้า',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.warehouse?.warehouseCategory?.name;
        },
        header: 'หมวดหมู่คลังสินค้า',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.warehouse?.zone?.name;
        },
        header: 'สถานที่จัดเก็บ',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.warehouse?.product?.unit;
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
          return formatAmount(row?.price);
        },
        header: 'ราคาซื้อ (~ประมาน)',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
      {
        accessorFn: (row: any) => {
          return formatAmount(row?.warehouse?.price * row?.qty);
        },
        header: 'มูลค่ารวม',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
      {
        accessorFn: (row: any) => {
          return formatThaiDateTime(row?.createdAt);
        },
        header: 'วันที่สร้างข้อมูล',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
    ],
    []
  );

  const warehouseColumnsReturn = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        header: 'โหมดการกระทำ',
        Cell: ({ cell }: any) => {
          return (
            <Chip variant="flat" startContent={<ArrowUp />} color="danger">
              คืนสินค้า
            </Chip>
          );
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.warehouse?.no;
        },
        header: 'รหัสสินค้า',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.warehouse?.product?.name;
        },
        header: 'ชื่อสินค้า',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.warehouse?.warehouseCategory?.name;
        },
        header: 'หมวดหมู่คลังสินค้า',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.warehouse?.zone?.name;
        },
        header: 'สถานที่จัดเก็บ',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.warehouse?.product?.unit;
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
          return formatAmount(row?.price);
        },
        header: 'ราคาซื้อ (~ประมาน)',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
      {
        accessorFn: (row: any) => {
          return formatAmount(row?.warehouse?.price * row?.qty);
        },
        header: 'มูลค่ารวม',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
      {
        accessorFn: (row: any) => {
          return formatThaiDateTime(row?.createdAt);
        },
        header: 'วันที่สร้างข้อมูล',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
    ],
    []
  );

  useEffect(() => {
    setValueInventoryForm(
      'expectedDateReturn',
      parseDate(new Date().toISOString().split('T')[0]) as any
    );
  }, [watchInventoryForm('modeWithdraw') == 'return']);

  const [pagination, setPagination] = useState({ pageIndex: 1, pageItem: 20 });
  const { data: transferContracts } = useSWR(
    `/api/repair?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: warehouseDashboard } = useSWR(
    `/api/dashboard?type=warehouse&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: productDropdown } = useSWR(
    `/api/warehouse?type=dropdown&companyId=${session?.company?.id}&isCanFix=true&status=available`,
    fetcher
  );
  const { data: productInventoryDropdown } = useSWR(
    `/api/warehouse?type=dropdown&companyId=${session?.company?.id}&categoryId=${categoryId}&status=available`,
    fetcher
  );
  const { data: companyBankDropdown } = useSWR(
    `/api/company/bank?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: categoryDown } = useSWR(
    `/api/warehouse/category?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );

  const handleInputChange = (index: any, field: any, value: any) => {
    setProducts((prevProducts: any) => {
      const updatedProducts = [...prevProducts];
      const product = updatedProducts[index];

      if (field === 'qty') {
        if (value < 1) {
          notyf.error(`จำนวนสินค้าต้องไม่น้อยกว่า 1 ${product?.unit}`);
          return prevProducts;
        }

        if (value > product?.stock) {
          notyf.error(
            `จำนวนสินค้าต้องไม่เกิน ${product.stock} ${product?.unit}`
          );
          return prevProducts;
        }
      }

      updatedProducts[index] = {
        ...product,
        [field]: value,
      };
      return updatedProducts;
    });
  };

  const calculateTotalAmounts = () => {
    let total = 0;
    const updatedProducts = products.map((product: any) => {
      const productTotal = product.qty * product.price;
      total += productTotal;
      return {
        ...product,
        totalAmount: productTotal,
      };
    });

    setValueInventoryForm('totalWithdraw', total);
    setProducts(updatedProducts);
  };

  const handleInputReturnChange = (index: any, field: any, value: any) => {
    setReturnProducts((prevProducts: any) => {
      const updatedProducts = [...prevProducts];
      const product = updatedProducts[index];

      if (field === 'qty') {
        if (value < 1) {
          notyf.error(`จำนวนสินค้าต้องไม่น้อยกว่า 1 ${product?.unit}`);
          return prevProducts;
        }

        if (value > product?.stock) {
          notyf.error(
            `จำนวนสินค้าต้องไม่เกิน ${product.stock} ${product?.unit}`
          );
          return prevProducts;
        }
      }

      updatedProducts[index] = {
        ...product,
        [field]: value,
      };
      return updatedProducts;
    });
  };

  const calculateTotalReturnAmounts = () => {
    let total = 0;
    const updatedProducts = returnProducts.map((product: any) => {
      const productTotal = product?.qty * product?.price;
      total += productTotal;
      return {
        ...product,
        totalAmount: productTotal,
      };
    });

    setValueInventoryForm('totalReturn', total);
    setReturnProducts(updatedProducts);
  };

  const {
    isOpen: isOpenInventoryModal,
    onOpen: onOpenInventoryModal,
    onClose: onCloseInventoryModal,
  } = useDisclosure();

  const formInventoryModal = () => {
    return (
      <Modal
        size="4xl"
        scrollBehavior="inside"
        isOpen={isOpenInventoryModal}
        isDismissable={false}
        onClose={() => {
          resetInventoryForm(initInventoryForm);
          onCloseInventoryModal();
        }}
      >
        <ModalContent>
          <ModalHeader>
            {formMode == 'create' ? 'สร้างใบเบิกสินค้า' : 'แก้ไขใบเบิกสินค้า'}
          </ModalHeader>
          <ModalBody>
            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <Select
                label="โหมดการเบิกสินค้า"
                variant="bordered"
                isDisabled={formMode == 'update'}
                {...registerInventoryForm('modeWithdraw', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsInventoryForm.modeWithdraw}
                errorMessage={errorsInventoryForm.modeWithdraw?.message}
              >
                <SelectItem key="not_return">เบิกแล้วไม่ต้องคืน</SelectItem>
                <SelectItem key="return">เบิกแล้วต้องคืน</SelectItem>
              </Select>

              {watchInventoryForm('modeWithdraw') == 'return' && (
                <>
                  <Controller
                    control={controlInventoryForm}
                    name="expectedDateReturn"
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
                        label="วันที่คิดว่าจะคืนสินค้า"
                        value={value as any}
                        isDisabled={formMode == 'update'}
                        isInvalid={!!error}
                        errorMessage={error?.message}
                        onChange={(range: any) => {
                          onChange(range);
                        }}
                      />
                    )}
                  />
                  <Controller
                    control={controlInventoryForm}
                    name="dateReturn"
                    render={({ field: { value, onChange } }) => (
                      <DatePicker
                        showMonthAndYearPickers
                        isDisabled
                        variant="bordered"
                        label="วันที่คืนสินค้า"
                        value={value as any}
                        onChange={(range: any) => {
                          onChange(range);
                        }}
                      />
                    )}
                  />
                </>
              )}

              <Controller
                control={controlInventoryForm}
                name="totalWithdraw"
                render={({ field: { value, onChange } }) => (
                  <Input
                    variant="bordered"
                    label="ราคารวมสินค้าเบิก"
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
                control={controlInventoryForm}
                name="totalReturn"
                render={({ field: { value, onChange } }) => (
                  <Input
                    variant="bordered"
                    label="ราคารวมสินค้าคืน (ถ้ามี)"
                    isDisabled
                    type="number"
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                  />
                )}
              />

              <Input
                {...registerInventoryForm('explain')}
                label="อธิบายการนำไปใช้งานเพิ่มเติม (ถ้ามี)"
                variant="bordered"
              />

              <Input
                {...registerInventoryForm('remark')}
                label="หมายเหตุ (ถ้ามี)"
                variant="bordered"
              />
            </form>
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-end gap-2 flex-wrap">
              <Button
                radius="full"
                variant="bordered"
                startContent={<ClipboardIcon className="opacity-50" />}
                isDisabled={formMode == 'update'}
                onClick={() => {
                  onCloseInventoryModal();
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
                onClick={handleSubmitInventoryForm(async (data) => {
                  try {
                    if (products?.length == 0 && formMode == 'create') {
                      return notyf.error(
                        'กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ'
                      );
                    }
                    setIsApiLoading(true);
                    const paperResponse =
                      formInventoryMode == 'create'
                        ? await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/warehouse/inventory`,
                            {
                              ...data,
                              companyId: session?.company?.id,
                              dateReturn: convertDateJsonToDbSingle(
                                data?.dateReturn
                              ),
                              expectedDateReturn: convertDateJsonToDbSingle(
                                data?.expectedDateReturn
                              ),
                              products,
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/warehouse/inventory/${projectSelectId}`,
                            {
                              ...data,
                              dateReturn: convertDateJsonToDbSingle(
                                data?.dateReturn
                              ),
                              expectedDateReturn: convertDateJsonToDbSingle(
                                data?.expectedDateReturn
                              ),
                              products,
                            }
                          );
                    await mutate(
                      `/api/repair?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
                    );
                    notyf.success(paperResponse?.data?.message);
                    setIsApiLoading(false);
                    onCloseInventoryModal();
                    resetInventoryForm(initInventoryForm);
                    setProducts([]);
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
    isOpen: isOpenProductModal,
    onOpen: onOpenProductModal,
    onClose: onCloseProductModal,
  } = useDisclosure();

  const productModal = () => {
    return (
      <Modal
        size="4xl"
        isDismissable={false}
        onClose={() => {
          setValueInventoryForm('totalReturn', 0);
          setValueInventoryForm('totalWithdraw', 0);
          onCloseProductModal();
          setProducts([]);
          setProductId(null);
          onOpenInventoryModal();
        }}
        scrollBehavior="inside"
        isOpen={isOpenProductModal}
      >
        <ModalContent>
          <ModalHeader>
            {formInventoryMode == 'create'
              ? 'สร้างรายการสินค้า'
              : 'แก้ไขรายการสินค้า'}
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-2.5">
              <Alert
                title="แจ้งเตือน"
                description={
                  <>
                    ระบบจะเลือกเฉพาะสินค้าที่อยู่ในสถานะ `พร้อมใช้งาน` เท่านั้น
                    หากคุณต้องการแก้ไขข้อมูลสินค้า โปรดไปที่{' '}
                    <span
                      className="underline cursor-pointer"
                      onClick={() => {
                        window.open('/warehouse', '_blank');
                      }}
                    >
                      คลังสินค้าและสต็อก
                    </span>{' '}
                    เมื่อทำการเบิกสินค้าแล้ว ระบบจะตัดสต็อกโดยอัตโนมัติ
                    กรุณาตรวจสอบรายการสินค้าให้ถูกต้องก่อนดำเนินการ
                  </>
                }
              />
              {productInventoryDropdown?.length == 0 && (
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
                            window.open('/protect/warehouse', '_blank');
                          }}
                        >
                          เพิ่มสินค้าใหม่
                        </span>
                      </span>
                    </>
                  }
                />
              )}

              <div className="grid sm:grid-cols-3 items-center gap-2.5">
                <Select
                  variant="bordered"
                  label="กรองสินค้าจากหมวดหมู่"
                  defaultSelectedKeys={[categoryId]}
                  onChange={async (e) => {
                    setCategoryId(e.target.value);
                  }}
                >
                  <SelectItem key={'all'}>หมวดหมู่ทั้งหมด</SelectItem>
                  {categoryDown &&
                    categoryDown?.map((item: any) => {
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
                  {productInventoryDropdown &&
                    productInventoryDropdown?.map((item: any) => {
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
                  isDisabled={formMode == 'update'}
                  onClick={() => {
                    if (productId) {
                      const findProduct = productInventoryDropdown?.find(
                        (item: any) => item?.id == productId
                      ) as any;

                      if (findProduct?.stock != 0) {
                        const isProductExist = products.some(
                          (product: any) =>
                            product.productId === findProduct?.productId
                        );

                        if (isProductExist) {
                          return notyf.error(`มีสินค้านี้แล้วในรายการ`);
                        }

                        setProducts([
                          ...products,
                          {
                            no: findProduct?.no,
                            productId: findProduct?.productId,
                            productName: findProduct?.product?.name,
                            qty: '1',
                            stock: findProduct?.stock,
                            unit: findProduct?.product?.unit,
                            price: findProduct?.product?.priceBuy || 1,
                            totalAmount: '',
                            remark: '',
                            warehouseId: findProduct?.id,
                          },
                        ]);
                      }
                    } else {
                      notyf.error(`กรุณาเลือกสินค้าก่อน`);
                    }
                  }}
                >
                  เพิ่มสินค้าใหม่
                </Button>
              </div>
            </div>

            <ScrollShadow className="max-h-96">
              {products.map((product: any, index: any) => (
                <Card
                  key={product.productId}
                  shadow="none"
                  className="border dark:border-dark mb-2.5"
                >
                  <CardBody>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5 items-center">
                      <Input
                        isDisabled
                        variant="bordered"
                        label="รหัสสินค้า (เลขS/N, ทะเบียนรถ, etc.)"
                        value={product.no}
                        onChange={(e) =>
                          handleInputChange(index, 'no', e.target.value)
                        }
                      />
                      <Input
                        variant="bordered"
                        isDisabled
                        label="ชื่อสินค้า"
                        value={product?.productName || product?.product?.name}
                      />
                      <Input
                        variant="bordered"
                        isDisabled={formMode == 'update'}
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
                        label="หน่วยนับ"
                        isDisabled
                        value={product?.unit || product?.product?.unit}
                      />
                      <Input
                        variant="bordered"
                        label="ราคาขาย (~ประมาน)"
                        isDisabled
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
                        label="ราคารวม"
                        type="number"
                        isDisabled
                        value={product.totalAmount}
                      />
                      <Input
                        isDisabled={formMode == 'update'}
                        variant="bordered"
                        label="หมายเหตุ (ถ้ามี)"
                        onChange={(e) =>
                          handleInputChange(index, 'remark', e.target.value)
                        }
                      />
                      <Button
                        radius="full"
                        isIconOnly
                        startContent={<XIcon />}
                        isDisabled={formMode == 'update'}
                        variant="bordered"
                        className="border-none text-danger-800"
                        onClick={async () => {
                          if (formMode == 'update' && product?.isUpdate) {
                            try {
                              onCloseProductModal();
                              setModalScreenLoading(true);
                              await axios.delete(
                                `${process.env.NEXT_PUBLIC_API_URL}/api/account/quo/product/${product?.id}`
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
                                `${process.env.NEXT_PUBLIC_API_URL}/api/account/quo/${projectSelectId}`,
                                {
                                  totalAmount: filterProductStatusUpdateSum,
                                  netAmount: filterProductStatusUpdateSum,
                                }
                              );

                              await mutate(
                                `/api/account/quo?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
              {products?.length !== 0 && (
                <>
                  <Button
                    radius="full"
                    startContent={<RefreshCcw className="opacity-50" />}
                    onClick={calculateTotalAmounts}
                    isDisabled={formMode == 'update'}
                    variant="bordered"
                  >
                    คำนวนราคา
                  </Button>
                  <Button
                    radius="full"
                    startContent={!isApiLoading && <CircleCheck />}
                    onClick={() => {
                      {
                        formMode == 'create' && calculateTotalAmounts();
                      }
                      onCloseProductModal();
                      onOpenInventoryModal();
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
            {formMode == 'create' ? 'เพิ่มซ่อมบำรุงใหม่' : 'แก้ไขซ่อมบำรุง'}
          </ModalHeader>
          <ModalBody>
            <Alert
              title="แจ้งเตือน"
              color="warning"
              description={
                <>
                  ระบบจะเลือกเฉพาะสินค้าที่อยู่ในโหมด{' '}
                  `เป็นสินค้าที่ซ่อมบำรุงได้และสถานะพร้อมใช้งาน` เท่านั้น
                  หากคุณต้องการแก้ไขข้อมูลสินค้า โปรดไปที่{' '}
                  <span
                    className="underline cursor-pointer"
                    onClick={() => {
                      window.open('/protect/warehouse', '_blank');
                    }}
                  >
                    คลังสินค้าและสต็อก
                  </span>{' '}
                  และเมื่อดำเนินการสร้างรายซ่อมบำรุงแล้ว
                  สินค้าชิ้นนั้นจะเปลี่ยนสถานะเป็น ‘กำลังซ่อมบำรุง’ โดยอัตโนมัติ
                  และจะไม่สามารถเบิกสินค้าได้จนกว่าจะซ่อมบำรุงสำเร็จแล้วเท่านั้น
                </>
              }
            />

            {productDropdown?.length === 0 && (
              <Alert
                title="แจ้งเตือน"
                color="warning"
                description={
                  <>
                    ขณะนี้ยังไม่มีข้อมูลสินค้าที่สามารถซ่อมบำรุงได้
                    คุณสามารถเพิ่มสินค้าใหม่ได้ที่{' '}
                    <span
                      className="underline cursor-pointer"
                      onClick={() => {
                        window.open('/warehouse', '_blank');
                      }}
                    >
                      คลังสินค้าและสต็อก
                    </span>
                  </>
                }
              />
            )}

            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {formMode == 'create' && (
                <Select
                  variant="bordered"
                  label="สินค้าที่ต้องซ่อมบำรุง"
                  {...registerForm('warehouseId', {
                    required: {
                      value: true,
                      message: errorRequire(),
                    },
                  })}
                  isInvalid={!!errorsForm?.warehouseId}
                  errorMessage={errorsForm?.warehouseId?.message}
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
              )}
              <Input
                variant="bordered"
                label="ปัญหาที่เกิดขึ้น (ถ้ามี)"
                {...registerForm('cause', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm?.cause}
                errorMessage={errorsForm?.cause?.message}
              />
              <Input
                variant="bordered"
                label="วิธีการแก้ปัญหา (ถ้ามี)"
                {...registerForm('solution')}
              />
              <Select
                label="มีการเปลี่ยนอะไหล่หรือไม่?"
                variant="bordered"
                {...registerForm('isChangePart', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm?.isChangePart}
                errorMessage={errorsForm?.isChangePart?.message}
              >
                <SelectItem key={'true'}>มี</SelectItem>
                <SelectItem key={'false'}>ไม่มี</SelectItem>
              </Select>
              {watchForm('isChangePart') == ('true' as any) && (
                <Input
                  variant="bordered"
                  {...registerForm('partChange')}
                  label="อะไหล่เก่าที่ถอดออก (ถ้ามี)"
                />
              )}
              <Select
                label="สถานะซ่อมบำรุง"
                isDisabled
                variant="bordered"
                {...registerForm('status', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm?.status}
                errorMessage={errorsForm?.status?.message}
              >
                <SelectItem key={'pending'}>กำลังรอซ่อมบำรุง</SelectItem>
                <SelectItem key={'working'}>กำลังดำเนินการซ่อม</SelectItem>
                <SelectItem key={'inComplete'}>ซ่อมบำรุงไม่สำเร็จ</SelectItem>
                <SelectItem key={'complete'}>ซ่อมบำรุงสำเร็จ</SelectItem>
              </Select>
              <Input
                variant="bordered"
                label="หมายเหตุ (ถ้ามี)"
                {...registerForm('remark')}
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/repair`,
                            {
                              ...data,
                              companyId: session?.company?.id,
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/repair/${projectSelectId}`,
                            {
                              ...data,
                            }
                          );
                    await mutate(
                      `/api/repair?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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

  const {
    isOpen: isOpenReturnModal,
    onOpen: onOpenReturnModal,
    onClose: onCloseReturnModal,
  } = useDisclosure();

  const returnModal = () => {
    return (
      <Modal
        size="4xl"
        isDismissable={false}
        onClose={() => {
          setReturnProductId(null);
          onCloseReturnModal();
          setReturnProducts([]);
          setProductId(null);
        }}
        scrollBehavior="inside"
        isOpen={isOpenReturnModal}
      >
        <ModalContent>
          <ModalHeader>สร้างใบคืนสินค้า</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-2.5">
              <Alert
                title="แจ้งเตือน"
                color="warning"
                description={
                  <>
                    เมื่อคุณทำการคืนสินค้าเรียบร้อยแล้ว
                    จะไม่สามารถยกเลิกหรือทำรายการคืนสินค้าในครั้งเดิมซ้ำได้อีก
                    ดังนั้นโปรดตรวจสอบให้แน่ใจว่าสินค้าถูกต้องครบถ้วนตามรายการ
                  </>
                }
              />
              <div className="grid sm:grid-cols-3 items-center gap-2.5">
                <Select
                  variant="bordered"
                  label="สินค้า"
                  onChange={(e: any) => {
                    const id = e.target.value;
                    setReturnProductId(id);
                  }}
                >
                  {returnProductArrays &&
                    returnProductArrays?.map((item: any) => {
                      return (
                        <SelectItem key={item?.warehouseId}>
                          {item?.fullName}
                        </SelectItem>
                      );
                    })}
                </Select>
                <Button
                  radius="full"
                  startContent={<PlusIcon />}
                  className="bg-primary text-white w-fit"
                  isDisabled={formMode == 'update'}
                  onClick={() => {
                    if (returnProductId) {
                      const findProduct = returnProductArrays?.find(
                        (item: any) => item?.warehouseId == returnProductId
                      ) as any;

                      if (findProduct?.qty != 0) {
                        const isProductExist = returnProducts.some(
                          (product: any) =>
                            product.warehouseId === findProduct?.warehouseId
                        );

                        if (isProductExist) {
                          return notyf.error(`มีสินค้านี้แล้วในรายการ`);
                        }

                        setReturnProducts([
                          ...returnProducts,
                          {
                            no: findProduct?.warehouse?.no,
                            productId: findProduct?.warehouse?.productId,
                            productName: findProduct?.warehouse?.product?.name,
                            qty: '1',
                            stock: findProduct?.qty,
                            unit: findProduct?.warehouse?.product?.unit,
                            price: findProduct?.warehouse?.price || 1,
                            totalAmount: '',
                            remark: '',
                            warehouseId: findProduct?.warehouseId,
                          },
                        ]);
                      }
                    } else {
                      notyf.error(`กรุณาเลือกสินค้าก่อน`);
                    }
                  }}
                >
                  เพิ่มสินค้าใหม่
                </Button>
              </div>
            </div>

            <ScrollShadow className="max-h-96">
              {returnProducts.map((product: any, index: any) => (
                <Card
                  key={product.productId}
                  shadow="none"
                  className="border dark:border-dark mb-2.5"
                >
                  <CardBody>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5 items-center">
                      <Input
                        isDisabled
                        variant="bordered"
                        label="รหัสสินค้า (เลขS/N, ทะเบียนรถ, etc.)"
                        value={product.no}
                        onChange={(e) =>
                          handleInputReturnChange(index, 'no', e.target.value)
                        }
                      />
                      <Input
                        variant="bordered"
                        isDisabled
                        label="ชื่อสินค้า"
                        value={product?.productName || product?.product?.name}
                      />
                      <Input
                        variant="bordered"
                        isDisabled={formMode == 'update'}
                        label="จำนวน"
                        type="number"
                        value={product.qty}
                        onChange={(e) =>
                          handleInputReturnChange(
                            index,
                            'qty',
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
                        label="ราคาขาย (~ประมาน)"
                        isDisabled
                        type="number"
                        value={product.price}
                        onChange={(e) =>
                          handleInputReturnChange(
                            index,
                            'price',
                            Number(e.target.value)
                          )
                        }
                      />
                      <Input
                        variant="bordered"
                        label="ราคารวม"
                        type="number"
                        isDisabled
                        value={product.totalAmount}
                      />
                      <Input
                        isDisabled={formMode == 'update'}
                        variant="bordered"
                        label="หมายเหตุ (ถ้ามี)"
                        onChange={(e) =>
                          handleInputReturnChange(
                            index,
                            'remark',
                            e.target.value
                          )
                        }
                      />
                      <Button
                        radius="full"
                        isIconOnly
                        startContent={<XIcon />}
                        isDisabled={formMode == 'update'}
                        variant="bordered"
                        className="border-none text-danger-800"
                        onClick={async () => {
                          setReturnProducts(
                            returnProducts.filter(
                              (_: any, i: any) => i !== index
                            )
                          );
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
              {returnProducts?.length !== 0 && (
                <>
                  <Button
                    radius="full"
                    startContent={<RefreshCcw className="opacity-50" />}
                    onClick={calculateTotalReturnAmounts}
                    isDisabled={formMode == 'update'}
                    variant="bordered"
                  >
                    คำนวนราคา
                  </Button>
                  <Button
                    radius="full"
                    startContent={!isApiLoading && <CircleCheck />}
                    onClick={async () => {
                      try {
                        calculateTotalReturnAmounts();
                        onCloseReturnModal();
                        setModalScreenLoading(true);

                        await axios.put(
                          `${process.env.NEXT_PUBLIC_API_URL}/api/warehouse/inventory/${inventoryId}`,
                          {
                            dateReturn: new Date().toISOString(),
                            totalReturn: watchInventoryForm('totalReturn'),
                            returnProducts,
                          }
                        );

                        await mutate(
                          `/api/repair?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
                        );

                        setModalScreenLoading(false);
                        setReturnProducts([]);
                        setReturnProductId(null);
                      } catch (error) {
                        setModalScreenLoading(false);
                        console.log(error);
                      }
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
              ? 'จ่ายค่าจ้างซ่อมบำรุง'
              : 'แก้ไขจ่ายค่าจ้างซ่อมบำรุง'}
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
                label="สถานะซ่อมบำรุงครั้งนี้"
                {...registerPaymentForm('fixStatus', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsPaymentForm?.fixStatus}
                errorMessage={errorsPaymentForm?.fixStatus?.message}
              >
                <SelectItem key={'notComplete'}>
                  ซ่อมแล้วแต่ยังใช้งานไม่ได้ (ต้องระบุเหตุผล)
                </SelectItem>
                <SelectItem key={'complete'}>ซ่อมแล้วใช้งานได้ปกติ</SelectItem>
              </Select>

              {watchPaymentForm('fixStatus') == 'notComplete' && (
                <Input
                  variant="bordered"
                  label="หมายเหตุจากผู้จ่าย (ถ้ามี)"
                  {...registerPaymentForm('approvedRemark')}
                />
              )}

              <Input
                variant="bordered"
                label="จำนวนเงินที่ต้องจ่าย"
                type="number"
                {...registerPaymentForm('netAmount', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsPaymentForm?.netAmount}
                errorMessage={errorsPaymentForm?.netAmount?.message}
              />

              <Select
                variant="bordered"
                label="สถานะการชำระเงิน"
                isDisabled
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

              <Input
                variant="bordered"
                label="รายการค่าใช้จ่าย (ถ้ามี)"
                {...registerPaymentForm('expenses')}
              />

              <Input
                variant="bordered"
                label="หมายเหตุ (ถ้ามี)"
                {...registerPaymentForm('remark')}
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/repair/payment`,
                            {
                              ...data,
                              companyId: session?.company?.id,
                              repairId,
                              datePayment: convertDateJsonToDbSingle(
                                data?.datePayment
                              ),
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/repair/payment/${repairPaymentId}`,
                            {
                              ...data,
                              repairId,
                              datePayment: convertDateJsonToDbSingle(
                                data?.datePayment
                              ),
                            }
                          );
                    await mutate(
                      `/api/repair?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'รหัสประจำตัวซ่อมบำรุง',
        size: 50,
      },
      {
        accessorFn: (row: any) => {
          return row?.warehouse?.product?.name
            ? `${row?.warehouse?.product?.name} (รหัสสินค้า ${row?.warehouse?.no})`
            : null;
        },
        accessorKey: 'name',
        size: 300,
        header: 'สินค้าที่ซ่อมบำรุง',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'status',
        header: 'สถานะซ่อมบำรุง',
        Cell: ({ cell }: any) => {
          const statusKey = cell.getValue();
          const {
            text: statusText,
            color: statusColor,
            icon: statusIcon,
          } = statusMapping[statusKey] || {
            text: 'สถานะไม่ทราบ',
            color: 'default',
          };

          return (
            <Chip color={statusColor} startContent={statusIcon} variant="flat">
              {statusText}
            </Chip>
          );
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.payment?.status ? row?.payment?.status : null;
        },
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
        header: 'เลขที่ซ่อมบำรุง',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'imagePath',
        header: 'ผู้สร้างการซ่อม',
        Cell: ({ cell }: any) => {
          const value = cell.getValue();
          return (
            <User
              name="ทดสอบระบบ"
              description={<Link>admin@gmail.com</Link>}
              avatarProps={{
                src: '/uploads/profile-no-image.png',
              }}
            />
          );
        },
      },
      {
        header: 'ผู้อนุมัติการซ่อม',
        Cell: ({ cell }: any) => {
          const value = cell.getValue();
          return (
            <User
              name="ทดสอบระบบ"
              description={<Link>admin@gmail.com</Link>}
              avatarProps={{
                src: '/uploads/profile-no-image.png',
              }}
            />
          );
        },
      },
      {
        header: 'สถานะการอนุมัติ',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        header: 'เหตุผลของผู้อนุมัติ (ถ้ามี)',
        size: 250,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'cause',
        header: 'ปัญหาที่เกิดขึ้น (ถ้ามี)',
        size: 250,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'solution',
        header: 'วิธีการแก้ปัญหา (ถ้ามี)',
        size: 250,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'isChangePart',
        header: 'มีการเปลี่ยนอะไหล่หรือไม่?',
        size: 280,
        Cell: ({ cell }: any) => {
          const value = cell.getValue();

          return value ? 'มี' : !value ? 'ไม่มี' : '-';
        },
      },
      {
        accessorKey: 'partChange',
        header: 'อะไหล่เก่าที่ถอดออก (ถ้ามี)',
        size: 300,
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
          {row?.original?.status !== 'complete' && (
            <div className="flex gap-2.5 flex-wrap">
              {row?.original?.isChangePart && (
                <Button
                  radius="full"
                  isDisabled={row?.original?.status == 'complete'}
                  variant="bordered"
                  onClick={() => {
                    setValueInventoryForm('repairId', row?.original?.id);
                    onOpenInventoryModal();
                  }}
                >
                  เบิกอะไหล่มาซ่อม
                </Button>
              )}
              <Button
                radius="full"
                variant="bordered"
                isDisabled={row?.original?.status == 'complete'}
                onClick={async () => {
                  try {
                    setModalScreenLoading(true);
                    const repair = row?.original?.id;
                    const repairPayment = row?.original?.paymentId;

                    setRepairId(repair);
                    if (repairPayment) {
                      setFormPaymentMode('update');
                      const { data } = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/repair/payment/${repairPayment}`
                      );

                      resetPaymentForm({
                        ...data,
                        datePayment: data?.datePayment
                          ? parseDate(data?.datePayment)
                          : null,
                      });

                      setRepairPaymentId(repairPayment);
                      setValuePaymentForm(
                        'warehouseId',
                        row?.original?.warehouseId
                      );
                    } else {
                      setFormPaymentMode('create');
                      setValuePaymentForm(
                        'warehouseId',
                        row?.original?.warehouseId
                      );
                    }

                    onOpenPaymentModal();
                    setModalScreenLoading(false);
                  } catch (error) {
                    setModalScreenLoading(false);
                    console.log(error);
                  }
                }}
              >
                จ่ายค่าจ้าง
              </Button>
            </div>
          )}

          {row?.original?.inventory?.map((item: any) => {
            return (
              <div className="w-fit my-2.5 border-l-4 pl-4 border-primary">
                {item?.modeWithdraw == 'return' &&
                  item?.return?.length == 0 && (
                    <div className="mb-2.5">
                      <Alert
                        title="แจ้งเตือน"
                        description={
                          <>
                            คุณมีสินค้าที่ต้องคืนกลับเข้าคลังสินค้า
                            ถ้าหากต้องการคืนสินค้า{' '}
                            <span
                              onClick={() => {
                                setFormInventoryMode('create');
                                onOpenReturnModal();
                                setInventoryId(item?.id);
                                const formattedData = item?.withdraw?.map(
                                  (item: any) => ({
                                    ...item,
                                    fullName: `${item?.warehouse?.product?.name} (สต็อกที่เบิก ${formatAmount(item?.qty)} ${item?.warehouse?.product?.unit})`,
                                  })
                                );
                                setReturnProductArrays(formattedData);
                              }}
                              className="underline cursor-pointer"
                            >
                              สามารถคืนได้จากที่นี่
                            </span>
                          </>
                        }
                      />
                    </div>
                  )}

                <MaterialReactTable
                  enableBottomToolbar={false}
                  enableTopToolbar={false}
                  columns={warehouseColumnsWithdraw}
                  data={item?.withdraw}
                  enableColumnOrdering={false}
                  enableSorting={false}
                  enablePagination={false}
                  muiTableContainerProps={{ sx: { maxHeight: 300 } }}
                />

                {item?.return?.length !== 0 && (
                  <div className="mt-2.5">
                    <MaterialReactTable
                      enableBottomToolbar={false}
                      enableTopToolbar={false}
                      columns={warehouseColumnsReturn}
                      data={item?.return}
                      enableColumnOrdering={false}
                      enableSorting={false}
                      enablePagination={false}
                      muiTableContainerProps={{ sx: { maxHeight: 300 } }}
                    />
                  </div>
                )}
              </div>
            );
          })}
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
            setProjectSelectId(id);
            const { data } = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/repair/${id}`
            );

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
                `${process.env.NEXT_PUBLIC_API_URL}/api/repair/${id}`
              );
              await mutate(
                `/api/repair?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
                `/api/repair?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
            เพิ่มซ่อมบำรุงใหม่
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/repair/${id}`
                          );
                        })
                      );
                    }

                    await mutate(
                      `/api/repair?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
    <Layout sitename={'ซ่อมบำรุง'}>
      {formModal()}
      {modalScreenLoading && PageLoading()}
      {formPaymentModal()}
      {productModal()}
      {formInventoryModal()}
      {returnModal()}

      <section className="flex flex-col gap-5">
        <Breadcrumbs>
          <BreadcrumbItem
            onClick={() => {
              router.push('/');
            }}
          >
            หน้าแรก
          </BreadcrumbItem>
          <BreadcrumbItem>การซ่อมบำรุง</BreadcrumbItem>
          <BreadcrumbItem>ซ่อมบำรุง</BreadcrumbItem>
        </Breadcrumbs>

        <HeaderTitle title="ซ่อมบำรุง" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          <CardSummary
            label={'ทั้งหมด'}
            value={warehouseDashboard?.warehouseCount}
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
