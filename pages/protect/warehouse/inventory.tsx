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
import { Notyf } from 'notyf';
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
  ArrowUpDown,
  CircleCheck,
  ClipboardIcon,
  PlusIcon,
  RefreshCcw,
  Search,
  XIcon,
} from 'lucide-react';
import CardSummary from '@/components/CardSummary';
import { errorRequire } from '@/utils/regex';
import { parseDate } from '@internationalized/date';
import {
  formatAmount,
  convertDateJsonToDbSingle,
  formatThaiDate,
  formatThaiDateTime,
  fetcher,
} from '@/utils';
const initForm = {
  modeWithdraw: 'return',
  objectiveWithdraw: 'other_use',
  projectId: null,
  repairId: null,
  expectedDateReturn: null,
  dateReturn: null,
  remark: '',
  explain: '',
  totalWithdraw: 0,
  totalReturn: 0,
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

  const [products, setProducts] = useState<any>([]);
  const [returnProducts, setReturnProducts] = useState<any>([]);
  const [returnProductArrays, setReturnProductArrays] = useState<any>([]);
  const [productId, setProductId] = useState<any>(null);
  const [returnProductId, setReturnProductId] = useState<any>(null);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [modalScreenLoading, setModalScreenLoading] = useState(false);
  const [categoryId, setCategoryId] = useState('all');
  const [formMode, setFormMode] = useState('create');
  const [inventoryId, setInventoryId] = useState<any>();
  const [projectSelectId, setProjectSelectId] = useState<any>();
  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    reset: resetForm,
    control: controlForm,
    setValue: setValueForm,
    watch: watchForm,
    formState: { errors: errorsForm },
  } = useForm({
    defaultValues: initForm,
  });

  const [pagination, setPagination] = useState({ pageIndex: 1, pageItem: 20 });
  const { data: transferContracts } = useSWR(
    `/api/warehouse/inventory?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: warehouseDashboard } = useSWR(
    `/api/dashboard?type=warehouse&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: productDropdown } = useSWR(
    `/api/warehouse?type=dropdown&companyId=${session?.company?.id}&categoryId=${categoryId}&status=available`,
    fetcher
  );
  const { data: projectDropdown } = useSWR(
    `/api/contract/paper?type=dropdown&companyId=${session?.company?.id}&isPending=true`,
    fetcher
  );
  const { data: repairDropdown } = useSWR(
    `/api/repair?type=dropdown&companyId=${session?.company?.id}&isChangePart=true`,
    fetcher
  );
  const { data: categoryDown } = useSWR(
    `/api/warehouse/category?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );

  const warehouseColumnsWithdraw = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        header: 'โหมดการกระทำ',
        Cell: ({ cell }: any) => {
          return (
            <Chip variant="flat" startContent={<ArrowUp />} color="danger">
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
    ],
    []
  );

  const warehouseColumnsReturn = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        header: 'โหมดการกระทำ',
        Cell: ({ cell }: any) => {
          return (
            <Chip variant="flat" startContent={<ArrowDown />} color="success">
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
    ],
    []
  );

  useEffect(() => {
    setProductId(null);
  }, [categoryId]);

  useEffect(() => {
    setValueForm(
      'expectedDateReturn',
      parseDate(new Date().toISOString().split('T')[0]) as any
    );
  }, [watchForm('modeWithdraw') == 'return']);

  const {
    isOpen: isOpenProductModal,
    onOpen: onOpenProductModal,
    onClose: onCloseProductModal,
  } = useDisclosure();

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

    setValueForm('totalWithdraw', total);
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

    setValueForm('totalReturn', total);
    setReturnProducts(updatedProducts);
  };

  const productModal = () => {
    return (
      <Modal
        size="4xl"
        isDismissable={false}
        onClose={() => {
          setValueForm('totalReturn', 0);
          setValueForm('totalWithdraw', 0);
          onCloseProductModal();
          setProducts([]);
          setProductId(null);
          onOpenModal();
        }}
        scrollBehavior="inside"
        isOpen={isOpenProductModal}
      >
        <ModalContent>
          <ModalHeader>
            {formMode == 'create' ? 'สร้างรายการสินค้า' : 'แก้ไขรายการสินค้า'}
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-2.5">
              <Alert
                title="แจ้งเตือน"
                color="warning"
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
              {productDropdown?.length == 0 && (
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
                  isDisabled={formMode == 'update'}
                  onClick={() => {
                    if (productId) {
                      const findProduct = productDropdown?.find(
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
                description={
                  <>
                    เมื่อคุณทำการคืนสินค้าเรียบร้อยแล้ว
                    จะไม่สามารถยกเลิกหรือทำรายการคืนสินค้าในครั้งเดิมซ้ำได้อีก
                    ดังนั้น
                    โปรดตรวจสอบให้แน่ใจว่าสินค้าที่ต้องการคืนถูกต้องครบถ้วนก่อนดำเนินการสร้างใบคืนสินค้า
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
                            totalReturn: watchForm('totalReturn'),
                            returnProducts,
                          }
                        );

                        await mutate(
                          `/api/warehouse/inventory?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
            {formMode == 'create' ? 'สร้างใบเบิกสินค้า' : 'แก้ไขใบเบิกสินค้า'}
          </ModalHeader>
          <ModalBody>
            {projectDropdown?.length == 0 && (
              <Alert
                title="แจ้งเตือน"
                color="danger"
                description={
                  <>
                    ขณะนี้ยังไม่มีข้อมูลโครงการ{' '}
                    <span className="underline cursor-pointer">
                      เพิ่มโครงการใหม่
                    </span>{' '}
                    เพื่อเบิกสินค้าเข้าดำเนินการต่อในโครงการ
                  </>
                }
              />
            )}

            {repairDropdown?.length == 0 &&
              watchForm('objectiveWithdraw') == 'repair_use' && (
                <Alert
                  title="แจ้งเตือน"
                  color="danger"
                  description={
                    <>
                      ขณะนี้ยังไม่มีข้อมูลซ่อมบำรุง{' '}
                      <span
                        className="underline cursor-pointer"
                        onClick={() => {
                          window.open('/repair', '_blank');
                        }}
                      >
                        เพิ่มซ่อมบำรุงใหม่
                      </span>{' '}
                      เพื่อเบิกสินค้าเข้าดำเนินการต่อในซ่อมบำรุง
                    </>
                  }
                />
              )}

            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <Select
                label="โหมดการเบิกสินค้า"
                variant="bordered"
                isDisabled={formMode == 'update'}
                {...registerForm('modeWithdraw', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm.modeWithdraw}
                errorMessage={errorsForm.modeWithdraw?.message}
              >
                <SelectItem key="not_return">เบิกแล้วไม่ต้องคืน</SelectItem>
                <SelectItem key="return">เบิกแล้วต้องคืน</SelectItem>
              </Select>
              <Select
                label="การนำไปใช้งาน"
                variant="bordered"
                isDisabled={formMode == 'update'}
                {...registerForm('objectiveWithdraw', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm.objectiveWithdraw}
                errorMessage={errorsForm.objectiveWithdraw?.message}
              >
                <SelectItem key="project_use">
                  ใช้ในโครงการจัดซื้อจัดจ้าง
                </SelectItem>
                <SelectItem key="repair_use">ใช้ในซ่อมบำรุง</SelectItem>
                <SelectItem key="other_use">อื่นๆ</SelectItem>
              </Select>

              {watchForm('objectiveWithdraw') == 'project_use' && (
                <Select
                  variant="bordered"
                  {...registerForm('projectId', {
                    required: {
                      value: true,
                      message: errorRequire(),
                    },
                  })}
                  isInvalid={!!errorsForm?.projectId}
                  errorMessage={errorsForm?.projectId?.message}
                  label="โครงการ"
                  isDisabled={formMode == 'update'}
                >
                  {projectDropdown &&
                    projectDropdown?.map((item: any) => {
                      return (
                        <SelectItem key={item?.id}>{item?.name}</SelectItem>
                      );
                    })}
                </Select>
              )}

              {watchForm('objectiveWithdraw') == 'repair_use' && (
                <Select
                  variant="bordered"
                  {...registerForm('repairId', {
                    required: {
                      value: true,
                      message: errorRequire(),
                    },
                  })}
                  isDisabled={formMode == 'update'}
                  isInvalid={!!errorsForm?.repairId}
                  errorMessage={errorsForm?.repairId?.message}
                  label="ซ่อมบำรุง"
                >
                  {repairDropdown &&
                    repairDropdown?.map((item: any) => {
                      return (
                        <SelectItem key={item?.id}>
                          {item?.fullRepairName}
                        </SelectItem>
                      );
                    })}
                </Select>
              )}

              {watchForm('modeWithdraw') == 'return' && (
                <>
                  <Controller
                    control={controlForm}
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
                    control={controlForm}
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
                control={controlForm}
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
                control={controlForm}
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
                {...registerForm('explain')}
                label="อธิบายการนำไปใช้งานเพิ่มเติม (ถ้ามี)"
                variant="bordered"
              />

              <Input
                {...registerForm('remark')}
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
                    if (products?.length == 0 && formMode == 'create') {
                      return notyf.error(
                        'กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ'
                      );
                    }
                    setIsApiLoading(true);
                    const paperResponse =
                      formMode == 'create'
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
                      `/api/warehouse/inventory?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
                    );
                    notyf.success(paperResponse?.data?.message);
                    setIsApiLoading(false);
                    onCloseModal();
                    resetForm(initForm);
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

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'รหัสประจำตัวเบิกสินค้า',
        size: 50,
      },
      {
        accessorKey: 'imagePath',
        header: 'ผู้เบิกสินค้า',
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
        header: 'ผู้อนุมัติการเบิก',
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
        header: 'ใช้ในโครงการ (ถ้ามี)',
        size: 450,
        accessorFn: (row: any) => {
          return row?.objectiveWithdraw == 'project_use' && row?.project?.name
            ? row?.project?.name
            : null;
        },
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        header: 'ใช้ในซ่อมบำรุง (ถ้ามี)',
        size: 450,
        accessorFn: (row: any) => {
          return row?.objectiveWithdraw == 'repair_use'
            ? `${row?.repair?.warehouse?.product?.name} (รหัสสินค้า ${row?.repair?.warehouse?.no}) (ปัญหาที่เกิดขึ้น ${row?.repair?.cause})`
            : null;
        },
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'modeWithdraw',
        header: 'โหมดการเบิกสินค้า',
        Cell: ({ cell }: any) => {
          const value = cell.getValue();

          return (
            <Chip
              color={
                value == 'not_return'
                  ? 'danger'
                  : value == 'return'
                    ? 'success'
                    : 'default'
              }
              startContent={
                value == 'not_return' ? (
                  <ArrowUp />
                ) : value == 'return' ? (
                  <ArrowUpDown />
                ) : null
              }
              variant="flat"
            >
              {value == 'not_return'
                ? 'เบิกแล้วไม่ต้องคืน'
                : value == 'return'
                  ? 'เบิกแล้วต้องคืน'
                  : '-'}
            </Chip>
          );
        },
      },
      {
        accessorKey: 'objectiveWithdraw',
        header: 'การนำไปใช้งาน',
        size: 250,
        Cell: ({ cell }: any) => {
          const value = cell.getValue();

          return value == 'project_use'
            ? 'ใช้ในโครงการจัดซื้อจัดจ้าง'
            : value == 'repair_use'
              ? 'ใช้ในซ่อมบำรุง'
              : value == 'other_use'
                ? 'อื่นๆ'
                : '';
        },
      },
      {
        accessorKey: 'explain',
        header: 'อธิบายการนำไปใช้งานเพิ่มเติม (ถ้ามี)',
        size: 350,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'expectedDateReturn',
        header: 'วันที่คิดว่าจะคืนสินค้า (ถ้ามี)',
        size: 300,
        Cell: ({ cell }: any) => formatThaiDate(cell.getValue()) || '-',
      },
      {
        accessorKey: 'dateReturn',
        header: 'วันที่คืนสินค้า (ถ้ามี)',
        size: 250,
        Cell: ({ cell }: any) => formatThaiDate(cell.getValue()) || '-',
      },
      {
        accessorKey: 'remark',
        header: 'หมายเหตุ (ถ้ามี)',
        size: 250,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'totalWithdraw',
        header: 'ราคารวมสินค้าเบิก',
        Cell: ({ cell }: any) => {
          return (
            <Chip color="danger" variant="flat">
              ฿{formatAmount(cell.getValue()) || '-'}
            </Chip>
          );
        },
      },
      {
        accessorKey: 'totalReturn',
        header: 'ราคารวมสินค้าคืน (ถ้ามี)',
        size: 300,
        Cell: ({ cell }: any) => {
          return (
            <Chip color="success" variant="flat">
              ฿{formatAmount(cell.getValue()) || '-'}
            </Chip>
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
          {row?.original?.inventoryReturn?.length !== 0 && (
            <div className="flex flex-col border-l-4 border-primary pl-4 w-fit mb-2.5 gap-2.5">
              <MaterialReactTable
                enableBottomToolbar={false}
                enableTopToolbar={false}
                columns={warehouseColumnsReturn}
                data={row?.original?.inventoryReturn}
                enableColumnOrdering={false}
                enableSorting={false}
                enablePagination={false}
                muiTableContainerProps={{ sx: { maxHeight: 300 } }}
              />
            </div>
          )}

          {row?.original?.modeWithdraw == 'return' &&
            row?.original?.inventoryReturn?.length == 0 && (
              <div className="mb-2.5">
                <Alert
                  title="แจ้งเตือน"
                  description={
                    <>
                      คุณมีสินค้าที่ต้องคืนกลับเข้าคลังสินค้า
                      ถ้าหากต้องการคืนสินค้า{' '}
                      <span
                        onClick={() => {
                          setFormMode('create');
                          onOpenReturnModal();
                          setInventoryId(row?.original?.id);
                          const formattedData =
                            row?.original?.inventoryWithdraw.map(
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

          <div className="flex flex-col w-fit gap-2.5">
            {row?.original?.inventoryWithdraw?.length !== 0 && (
              <div className="flex flex-col border-l-4 border-primary pl-4 gap-2.5">
                <MaterialReactTable
                  enableBottomToolbar={false}
                  enableTopToolbar={false}
                  columns={warehouseColumnsWithdraw}
                  data={row?.original?.inventoryWithdraw}
                  enableColumnOrdering={false}
                  enableSorting={false}
                  enablePagination={false}
                  muiTableContainerProps={{ sx: { maxHeight: 300 } }}
                />
              </div>
            )}
          </div>
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
              `${process.env.NEXT_PUBLIC_API_URL}/api/warehouse/inventory/${id}`
            );

            resetForm({
              ...data,
              expectedDateReturn: data?.expectedDateReturn
                ? parseDate(data?.expectedDateReturn)
                : null,
              dateReturn: data?.dateReturn ? parseDate(data?.dateReturn) : null,
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
                `${process.env.NEXT_PUBLIC_API_URL}/api/warehouse/inventory/${id}`
              );
              await mutate(
                `/api/warehouse/inventory?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
                `/api/warehouse/inventory?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
            เพิ่มการเบิกสินค้าใหม่
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/warehouse/inventory/${id}`
                          );
                        })
                      );
                    }
                    await mutate(
                      `/api/warehouse/inventory?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
    <Layout sitename={'เบิกสินค้า/คืนสินค้า'}>
      {formModal()}
      {modalScreenLoading && PageLoading()}
      {productModal()}
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
          <BreadcrumbItem>คลังสินค้าและสต็อก</BreadcrumbItem>
          <BreadcrumbItem>เบิกสินค้า/คืนสินค้า</BreadcrumbItem>
        </Breadcrumbs>

        <HeaderTitle title="เบิกสินค้า/คืนสินค้า" />

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
