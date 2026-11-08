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
import {
  CircleCheck,
  CircleX,
  PlusIcon,
  Search,
  Settings,
  Trash,
  XIcon,
} from 'lucide-react';
import CardSummary from '@/components/CardSummary';
const initForm = {
  name: '',
  categoryId: null,
  unit: '',
  priceBuy: 0,
  priceSell: 0,
  remark: '',
};
const initCategoryForm = {
  categoryId: null,
  name: '',
  remark: '',
};
import { Notyf } from 'notyf';
import { errorRequire } from '@/utils/regex';
import { apiPath, formatThaiDateTime, formatAmount, fetcher } from '@/utils';

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
  const [projectSelectId, setProjectSelectId] = useState<any>();
  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    reset: resetForm,
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

  const [pagination, setPagination] = useState({ pageIndex: 1, pageItem: 20 });
  const { data: products } = useSWR(
    `/api/product?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: productCategoriesDropdown } = useSWR(
    `/api/product/category?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: productDashboard } = useSWR(
    `/api/dashboard?type=product&companyId=${session?.company?.id}`,
    fetcher
  );

  const {
    isOpen: isOpenModal,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure();

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
          <ModalHeader>จัดการหมวดหมู่สินค้า</ModalHeader>
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
                    label="ชื่อหมวดหมู่สินค้า"
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
                          `${apiPath}/api/product/category`,
                          {
                            ...data,
                            companyId: session?.company?.id,
                          }
                        );
                      } else {
                        response = await axios.put(
                          `${apiPath}/api/product/category/${data?.categoryId}`,
                          {
                            ...data,
                          }
                        );
                      }
                      await mutate(
                        `/api/product/category?type=dropdown&companyId=${session?.company?.id}`
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
              {productCategoriesDropdown?.map((item: any) => {
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
                                  `${apiPath}/api/product/category/${item?.id}`
                                );
                                await mutate(
                                  `/api/product/category?type=dropdown&companyId=${session?.company?.id}`
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
            {formMode == 'create' ? 'เพิ่มสินค้าใหม่' : 'แก้ไขสินค้า'}
          </ModalHeader>
          <ModalBody>
            {productCategoriesDropdown?.length == 0 && (
              <Alert
                title="แจ้งเตือน"
                color="danger"
                description={
                  <>
                    <span>ขณะนี้ยังไม่มีข้อมูลของหมวดหมู่สินค้า</span>{' '}
                    <span
                      className="underline cursor-pointer"
                      onClick={() => {
                        onOpenCategoryModal();
                      }}
                    >
                      เพิ่มหมวดหมู่สินค้าใหม่
                    </span>
                  </>
                }
              />
            )}

            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <Input
                variant="bordered"
                {...registerForm('name', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm.name}
                errorMessage={errorsForm?.name?.message}
                label="ชื่อสินค้า"
              />
              <Select
                variant="bordered"
                {...registerForm('categoryId', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm.categoryId}
                errorMessage={errorsForm?.categoryId?.message}
                label="หมวดหมู่สินค้า"
              >
                {productCategoriesDropdown &&
                  productCategoriesDropdown?.map((item: any) => {
                    return <SelectItem key={item?.id}>{item?.name}</SelectItem>;
                  })}
              </Select>
              <Input
                variant="bordered"
                {...registerForm('unit', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm.unit}
                errorMessage={errorsForm?.unit?.message}
                label="หน่วยนับ"
              />
              <Input
                variant="bordered"
                {...registerForm('priceBuy')}
                label="ราคาซื้อ (~ประมาน)"
                type="number"
              />
              <Input
                variant="bordered"
                {...registerForm('priceSell')}
                label="ราคาขาย (~ประมาน)"
                type="number"
              />
              <Input
                variant="bordered"
                {...registerForm('remark')}
                label="หมายเหตุ (ถ้ามี)"
              />
            </form>
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
                หมวดหมู่สินค้า
              </Button> */}

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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/product`,
                            {
                              ...data,
                              companyId: session?.company?.id,
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/product/${projectSelectId}`,
                            {
                              ...data,
                            }
                          );
                    await mutate(
                      `/api/product?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
        header: 'รหัสประจำตัวสินค้า',
      },
      {
        accessorKey: 'name',
        header: 'ชื่อสินค้า',
        size: 250,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'priceBuy',
        header: 'ราคาซื้อ (~ประมาน)',
        Cell: ({ cell }: any) => {
          return (
            <Chip color="success" variant="flat">
              ฿{formatAmount(cell.getValue()) || '-'}
            </Chip>
          );
        },
      },
      {
        accessorKey: 'priceSell',
        header: 'ราคาขาย (~ประมาน)',
        Cell: ({ cell }: any) => {
          return (
            <Chip color="danger" variant="flat">
              ฿{formatAmount(cell.getValue()) || '-'}
            </Chip>
          );
        },
      },
      {
        accessorKey: 'unit',
        header: 'หน่วยนับ',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorFn: (row: any) => {
          return row?.category?.name ? row?.category?.name : null;
        },
        header: 'หมวดหมู่สินค้า',
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
    data: products?.data || [],
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
              `${process.env.NEXT_PUBLIC_API_URL}/api/product/${id}`
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
                `${process.env.NEXT_PUBLIC_API_URL}/api/product/${id}`
              );
              await mutate(
                `/api/product?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
                `/api/product?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
            เพิ่มสินค้าใหม่
          </Button>

          <Button
            radius="full"
            variant="bordered"
            startContent={<Settings className="opacity-50" />}
            onClick={() => {
              onOpenCategoryModal();
            }}
          >
            หมวดหมู่สินค้า
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/product/${id}`
                          );
                        })
                      );
                    }

                    await mutate(
                      `/api/product?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
    <Layout sitename={'สินค้า'}>
      {formModal()}
      {modalScreenLoading && PageLoading()}
      {formCategoryModal()}

      <section className="flex flex-col gap-5">
        <Breadcrumbs>
          <BreadcrumbItem
            onClick={() => {
              router.push('/');
            }}
          >
            หน้าแรก
          </BreadcrumbItem>
          <BreadcrumbItem>สินค้าและอะไหล่</BreadcrumbItem>
          <BreadcrumbItem>สินค้า</BreadcrumbItem>
        </Breadcrumbs>

        <HeaderTitle title="สินค้า" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          <CardSummary
            label={'ทั้งหมด'}
            value={productDashboard?.productCount}
            suffix={'รายการ'}
          />
        </div>

        <MaterialReactTable table={table} />

        <div className="flex justify-end">
          <Pagination
            showControls
            total={products?.allPages}
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
