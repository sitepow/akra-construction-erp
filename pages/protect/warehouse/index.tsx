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
import {
  CircleAlert,
  CircleCheck,
  CircleX,
  PlusIcon,
  ScanBarcode,
  Search,
  Settings,
  Trash,
  XIcon,
} from 'lucide-react';
import CardSummary from '@/components/CardSummary';
const initForm = {
  no: '',
  productId: '',
  zoneId: '',
  price: 0,
  categoryId: '',
  isCanFix: 'not_fix',
  isCanSell: 'not_sell',
  stock: 1,
  status: 'available',
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
const statusMapping = {
  available: { text: 'พร้อมใช้งาน', color: 'success', icon: <CircleCheck /> },
  outOfStock: { text: 'สินค้าหมด', color: 'warning', icon: <CircleAlert /> },
  damaged: { text: 'สินค้าชำรุด', color: 'danger', icon: <CircleAlert /> },
  awaitingInspection: {
    text: 'รอตรวจสอบ',
    color: 'warning',
    icon: <CircleAlert />,
  },
  fixing: { text: 'กำลังซ่อมบำรุง', color: 'warning', icon: <CircleAlert /> },
  fixingAgain: {
    text: 'รอซ่อมบำรุงอีกครั้ง',
    color: 'danger',
    icon: <CircleAlert />,
  },
  onHold: { text: 'ถูกเบิกไปใช้งานอยู่', color: 'default', icon: <CircleX /> },
} as any;
const fixMapping = {
  fix: { text: 'สามารถซ่อมบำรุงได้', color: 'success', icon: <CircleCheck /> },
  not_fix: { text: 'ไม่สามารถนำไปซ่อมได้', color: 'danger', icon: <CircleX /> },
} as any;
const sellMapping = {
  sell: { text: 'สามารถนำไปขายได้', color: 'success', icon: <CircleCheck /> },
  not_sell: { text: 'ไม่สามารถนำไปขายได้', color: 'danger', icon: <CircleX /> },
} as any;
import { Notyf } from 'notyf';
import { apiPath, formatAmount, formatThaiDateTime, fetcher } from '@/utils';

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
  const [categoryMode, setCategoryMode] = useState('create');
  const [zoneMode, setZoneMode] = useState('create');
  const [categoryId, setCategoryId] = useState('all');
  const [projectSelectId, setProjectSelectId] = useState<any>();
  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    reset: resetForm,
    watch: watchForm,
    control: controlForm,
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
              {categoryDown?.map((item: any) => {
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

  const [pagination, setPagination] = useState({ pageIndex: 1, pageItem: 20 });
  const { data: transferContracts } = useSWR(
    `/api/warehouse?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}&categoryId=${categoryId}`,
    fetcher
  );
  const { data: warehouseDashboard } = useSWR(
    `/api/dashboard?type=warehouse&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: productDropdown } = useSWR(
    `/api/product?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: zoneDropdown } = useSWR(
    `/api/warehouse/zone?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: categoryDown } = useSWR(
    `/api/warehouse/category?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );

  useEffect(() => {
    const product = productDropdown?.find(
      (item: any) => item?.id == watchForm('productId')
    );

    resetForm({ price: product?.priceBuy });
  }, [watchForm('productId')]);

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
            {formMode == 'create' ? 'เพิ่มคลังสินค้าใหม่' : 'แก้ไขคลังสินค้า'}
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-2.5">
              {zoneDropdown?.length == 0 && (
                <Alert
                  color="danger"
                  title="แจ้งเตือน"
                  description={
                    <>
                      <span>ขณะนี้ยังไม่มีข้อมูลสถานที่จัดเก็บสินค้า</span>{' '}
                      <span
                        className="underline cursor-pointer"
                        onClick={() => {
                          onOpenCategoryModal();
                        }}
                      >
                        เพิ่มสถานที่จัดเก็บใหม่
                      </span>
                    </>
                  }
                />
              )}

              {zoneDropdown?.length == 0 && (
                <Alert
                  title="แจ้งเตือน"
                  color="danger"
                  description={
                    <>
                      <span>ขณะนี้ยังไม่มีข้อมูลคลังสินค้า</span>{' '}
                      <span
                        className="underline cursor-pointer"
                        onClick={() => {
                          onOpenZoneModal();
                        }}
                      >
                        เพิ่มหมวดหมู่คลังสินค้าใหม่
                      </span>
                    </>
                  }
                />
              )}

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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <Input
                variant="bordered"
                endContent={
                  <Tooltip content="สแกนบาร์โค้ด">
                    <ScanBarcode className="opacity-20 hover:opacity-100 cursor-pointer" />
                  </Tooltip>
                }
                label="รหัสสินค้า (เลขS/N, ทะเบียนรถ, etc.)"
                {...registerForm('no', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm?.no}
                errorMessage={errorsForm?.no?.message}
              />
              <Select
                variant="bordered"
                label="สินค้า"
                {...registerForm('productId', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm?.productId}
                errorMessage={errorsForm?.productId?.message}
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
              <Controller
                control={controlForm}
                name="price"
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
                    label="ราคาซื้อ (~ประมาน)"
                    type="number"
                    variant="bordered"
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                    isInvalid={!!error}
                    errorMessage={error?.message}
                  />
                )}
              />

              <Select
                variant="bordered"
                label="หมวดหมู่คลังสินค้า"
                {...registerForm('categoryId', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm?.categoryId}
                errorMessage={errorsForm?.categoryId?.message}
              >
                {categoryDown &&
                  categoryDown?.map((item: any) => {
                    return <SelectItem key={item?.id}>{item?.name}</SelectItem>;
                  })}
              </Select>
              <Select
                variant="bordered"
                label="สถานที่จัดเก็บ"
                {...registerForm('zoneId', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm?.zoneId}
                errorMessage={errorsForm?.zoneId?.message}
              >
                {zoneDropdown &&
                  zoneDropdown?.map((item: any) => {
                    return <SelectItem key={item?.id}>{item?.name}</SelectItem>;
                  })}
              </Select>
              <Input
                variant="bordered"
                label="สต็อกสินค้า"
                type="number"
                {...registerForm('stock', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm?.stock}
                errorMessage={errorsForm?.stock?.message}
              />
              <Select
                variant="bordered"
                isDisabled
                label="สถานะสินค้า"
                {...registerForm('status')}
              >
                <SelectItem key="available">พร้อมใช้งาน</SelectItem>
                <SelectItem key="outOfStock">สินค้าหมด</SelectItem>
                <SelectItem key="damaged">สินค้าชำรุด</SelectItem>
                <SelectItem key="awaitingInspection">รอตรวจสอบ</SelectItem>
                <SelectItem key="fixing">กำลังซ่อมบำรุง</SelectItem>
                <SelectItem key="onHold">ถูกเบิกไปใช้งานอยู่</SelectItem>
              </Select>
              <Select
                variant="bordered"
                label="เป็นสินค้าซ่อมได้หรือไม่?"
                {...registerForm('isCanFix', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm?.isCanFix}
                errorMessage={errorsForm?.isCanFix?.message}
              >
                <SelectItem key="fix">สามารถซ่อมบำรุงได้</SelectItem>
                <SelectItem key="not_fix">ไม่สามารถนำไปซ่อมได้</SelectItem>
              </Select>
              <Select
                variant="bordered"
                label="เป็นสินค้าขายได้หรือไม่?"
                {...registerForm('isCanSell', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm?.isCanSell}
                errorMessage={errorsForm?.isCanSell?.message}
              >
                <SelectItem key="sell">สามารถนำไปขายได้</SelectItem>
                <SelectItem key="not_sell">ไม่สามารถนำไปขายได้</SelectItem>
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-end gap-2 flex-wrap">
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/warehouse`,
                            {
                              ...data,
                              companyId: session?.company?.id,
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/warehouse/${projectSelectId}`,
                            {
                              ...data,
                            }
                          );
                    await mutate(
                      `/api/warehouse?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}&categoryId=${categoryId}`
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
        header: 'รหัสประจำตัวคลังสินค้า',
      },
      {
        accessorFn: (row: any) => {
          return row?.stock
            ? `${formatAmount(row?.stock)} ${row?.product?.unit}`
            : null;
        },
        accessorKey: 'stock',
        header: 'คงเหลือ',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'no',
        header: 'รหัสสินค้า',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorFn: (row: any) => {
          return row?.product?.name ? row?.product?.name : null;
        },
        accessorKey: 'name',
        header: 'ชื่อสินค้า',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        header: 'หมวดหมู่คลังสินค้า',
        accessorFn: (row: any) => {
          return row?.warehouseCategory?.name
            ? row?.warehouseCategory?.name
            : null;
        },
        Cell: ({ cell }: any) => {
          return <span>{cell.getValue() || '-'}</span>;
        },
      },
      {
        accessorKey: 'price',
        header: 'ราคาซื้อ (~ประมาน)',
        Cell: ({ cell }: any) => {
          const value = cell.getValue();

          return value !== 0 ? (
            <Chip color="success" variant="flat">
              ฿{formatAmount(cell.getValue())}
            </Chip>
          ) : (
            '-'
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'สถานะสินค้า',
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
        accessorKey: 'isCanFix',
        header: 'เป็นสินค้าซ่อมได้หรือไม่?',
        size: 280,
        Cell: ({ cell }: any) => {
          const statusKey = cell.getValue();
          const {
            text: statusText,
            color: statusColor,
            icon: statusIcon,
          } = fixMapping[statusKey] || {
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
        accessorKey: 'isCanSell',
        header: 'เป็นสินค้าขายได้หรือไม่?',
        size: 250,
        Cell: ({ cell }: any) => {
          const statusKey = cell.getValue();
          const {
            text: statusText,
            color: statusColor,
            icon: statusIcon,
          } = sellMapping[statusKey] || {
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
        header: 'สถานที่จัดเก็บ',
        accessorFn: (row: any) => {
          return row?.zone?.name ? row?.zone?.name : null;
        },
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        header: 'หมวดหมู่สินค้า',
        accessorFn: (row: any) => {
          return row?.product?.category?.name
            ? row?.product?.category?.name
            : null;
        },
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
              `${process.env.NEXT_PUBLIC_API_URL}/api/warehouse/${id}`
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
                `${process.env.NEXT_PUBLIC_API_URL}/api/warehouse/${id}`
              );
              await mutate(
                `/api/warehouse?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}&categoryId=${categoryId}`
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
                `/api/warehouse?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}&categoryId=${categoryId}`
              );
            }}
            className="max-w-32 dark:text-white"
          >
            <SelectItem key={'20'}>20 รายการ</SelectItem>
            <SelectItem key={'50'}>50 รายการ</SelectItem>
            <SelectItem key={'100'}>100 รายการ</SelectItem>
          </Select>
          <Select
            variant="bordered"
            label="กรองสินค้า"
            defaultSelectedKeys={[categoryId]}
            onChange={async (e) => {
              setCategoryId(e.target.value);
            }}
            className="max-w-52 dark:text-white"
          >
            <SelectItem key={'all'}>หมวดหมู่ทั้งหมด</SelectItem>
            {categoryDown &&
              categoryDown?.map((item: any) => {
                return <SelectItem key={item?.id}>{item?.name}</SelectItem>;
              })}
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
            เพิ่มคลังสินค้าใหม่
          </Button>

          <Button
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/warehouse/${id}`
                          );
                        })
                      );
                    }

                    await mutate(
                      `/api/warehouse?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}&categoryId=${categoryId}`
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
    <Layout sitename={'คลังสินค้า'}>
      {formModal()}
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
          <BreadcrumbItem>คลังสินค้าและสต็อก</BreadcrumbItem>
          <BreadcrumbItem>คลังสินค้า</BreadcrumbItem>
        </Breadcrumbs>

        <HeaderTitle title="คลังสินค้า" />

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
