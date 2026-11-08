import HeaderTitle from '@/components/HeaderTitle';
import Layout from '@/components/Layout';
import { HexColorPicker } from 'react-colorful';
import {
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
  guaranteeHeader: false,
  color: '#941647',
  fullAddress: '',
  tax: '',
  telephone: '',
  fax: '',
};
const initBankForm = {
  companyId: null,
  bankId: null,
  bankName: null,
  bankType: null,
  bankBranch: '',
  bankAccount: '',
};
import { Notyf } from 'notyf';
import { errorRequire } from '@/utils/regex';
import {
  accountTypes,
  apiPath,
  banks,
  fetcher,
  formatThaiDateTime,
} from '@/utils';
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
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [modalScreenLoading, setModalScreenLoading] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [bankMode, setBankMode] = useState('create');
  const [originalBanks, setOriginalBanks] = useState<any>();

  const warehouseColumns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row: any) => {
          return row?.bankName;
        },
        header: 'ธนาคาร',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.bankBranch;
        },
        header: 'สาขา',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.bankType;
        },
        header: 'ประเภทบัญชี',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.bankAccount;
        },
        header: 'เลขบัญชี',
        Cell: ({ cell }: any) => {
          return cell.getValue() || '-';
        },
      },
    ],
    []
  );

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
    handleSubmit: handleSubmitBankForm,
    reset: resetBankForm,
    setValue: setValueBankForm,
    control: controlBankForm,
  } = useForm({
    defaultValues: initBankForm,
  });

  const [pagination, setPagination] = useState({ pageIndex: 1, pageItem: 20 });
  const { data: categories } = useSWR(
    `/api/company?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: bankDashboard } = useSWR(
    `/api/dashboard?type=bank&companyId=${session?.company?.id}`,
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
            {formMode == 'create' ? 'เพิ่มบริษัทใหม่' : 'แก้ไขบริษัท'}
          </ModalHeader>
          <ModalBody>
            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <Select
                variant="bordered"
                {...registerForm('guaranteeHeader', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm?.guaranteeHeader}
                errorMessage={errorsForm?.guaranteeHeader?.message}
                label="ใช้คำว่า หลักค้ำประกันสัญญา หรือไม่?"
              >
                <SelectItem key={'true'}>ใช้</SelectItem>
                <SelectItem key={'false'}>ไม่ใช้</SelectItem>
              </Select>
              <Input
                variant="bordered"
                {...registerForm('name', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm?.name}
                errorMessage={errorsForm?.name?.message}
                label="ชื่อบริษัท"
              />
              <div className="flex flex-col gap-2.5">
                <Input
                  variant="bordered"
                  isDisabled
                  value={watchForm('color')}
                  label="สีเว็บไซต์"
                />
                <Controller
                  control={controlForm}
                  name="color"
                  render={({ field: { value, onChange } }) => (
                    <HexColorPicker
                      color={value as any}
                      onChange={(range: any) => {
                        onChange(range);
                      }}
                    />
                  )}
                />
              </div>
              <Input
                variant="bordered"
                {...registerForm('fullAddress', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm?.fullAddress}
                errorMessage={errorsForm?.fullAddress?.message}
                label="ที่อยู่บริษัท"
              />
              <Input
                variant="bordered"
                {...registerForm('telephone')}
                label="เบอร์โทรศัพท์ติดต่อ"
              />
              <Input
                variant="bordered"
                {...registerForm('fax')}
                label="แฟกซ์"
              />
              <Input
                variant="bordered"
                {...registerForm('tax')}
                label="เลขประจำตัวผู้เสียภาษี"
              />
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/company`,
                            {
                              ...data,
                              companyId: session?.company?.id,
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/company/${projectSelectId}`,
                            {
                              ...data,
                            }
                          );
                    await mutate(
                      `/api/company?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
    isOpen: isOpenBankModal,
    onOpen: onOpenBankModal,
    onClose: onCloseBankModal,
  } = useDisclosure();

  const formBankModal = () => {
    return (
      <Modal
        scrollBehavior="inside"
        isOpen={isOpenBankModal}
        isDismissable={false}
        onClose={() => {
          resetBankForm(initBankForm);
          setBankMode('create');
          onCloseBankModal();
        }}
      >
        <ModalContent>
          <ModalHeader>จัดการธนาคารและบัญชี</ModalHeader>
          <ModalBody>
            <form className="flex flex-col gap-2.5">
              <Controller
                control={controlBankForm}
                name="bankName"
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
                  <Select
                    label="ธนาคาร"
                    variant="bordered"
                    selectedKeys={[value as any]}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                    isInvalid={!!error}
                    errorMessage={error?.message}
                  >
                    {banks.map((bank: any) => (
                      <SelectItem key={bank}>{bank}</SelectItem>
                    ))}
                  </Select>
                )}
              />
              <Controller
                control={controlBankForm}
                name="bankBranch"
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
                    label="สาขา"
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
              <Controller
                control={controlBankForm}
                name="bankType"
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
                  <Select
                    label="ประเภทบัญชี"
                    variant="bordered"
                    selectedKeys={[value as any]}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                    isInvalid={!!error}
                    errorMessage={error?.message}
                  >
                    {accountTypes.map((account: any) => (
                      <SelectItem key={account}>{account}</SelectItem>
                    ))}
                  </Select>
                )}
              />
              <Controller
                control={controlBankForm}
                name="bankAccount"
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
                    label="เลขบัญชี"
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
              <div className="flex gap-2.5 justify-end">
                <Button
                  radius="full"
                  startContent={!isApiLoading && <CircleCheck />}
                  onClick={handleSubmitBankForm(async (data) => {
                    try {
                      onCloseBankModal();
                      setModalScreenLoading(true);
                      let response;
                      const fullBank = `${data?.bankAccount} ${data?.bankName}`;
                      if (bankMode == 'create') {
                        response = await axios.post(
                          `${apiPath}/api/company/bank`,
                          { ...data, companyId: originalBanks?.id, fullBank }
                        );
                      } else {
                        response = await axios.put(
                          `${apiPath}/api/company/bank/${data?.bankId}`,
                          { ...data, fullBank }
                        );
                      }
                      await mutate(
                        `/api/company?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
                      );
                      const { data: responseData } = await axios(
                        `${apiPath}/api/company?type=modal&companyId=${originalBanks?.id}`
                      );
                      setOriginalBanks(responseData);
                      resetBankForm(initBankForm);
                      setBankMode('create');
                      notyf.success(response?.data?.message);
                      onOpenBankModal();
                      setModalScreenLoading(false);
                    } catch (error: any) {
                      notyf?.error(error?.response?.data);
                      onOpenBankModal();
                      setModalScreenLoading(false);
                      console.log(error);
                    }
                  })}
                  className="bg-primary text-white"
                >
                  {bankMode == 'create' ? 'บันทึกข้อมูล' : 'แก้ไขข้อมูล'}
                </Button>
                {bankMode == 'update' && (
                  <Button
                    radius="full"
                    startContent={<CircleX />}
                    onClick={() => {
                      resetBankForm(initBankForm);
                      setBankMode('create');
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
              {originalBanks?.bank?.map((item: any) => {
                return (
                  <Card className="my-1.5 border dark:border-dark" shadow="sm">
                    <CardBody>
                      <div className="w-full flex justify-between">
                        <span>{item?.fullBank}</span>

                        <div className="flex gap-2.5">
                          <Settings
                            onClick={() => {
                              resetBankForm(item);
                              setValueBankForm('bankId', item?.id);
                              setBankMode('update');
                            }}
                            className="opacity-20 cursor-pointer hover:opacity-100"
                          />
                          <Trash
                            onClick={async () => {
                              try {
                                await axios.delete(
                                  `${apiPath}/api/company/bank/${item?.id}`
                                );
                                await mutate(
                                  `/api/company?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
                                );
                                const { data: responseData } = await axios(
                                  `${apiPath}/api/company?type=modal&companyId=${originalBanks?.id}`
                                );
                                setOriginalBanks(responseData);
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
        header: 'รหัสประจำตัวบริษัท',
      },
      {
        accessorKey: 'name',
        header: 'ชื่อบริษัท',
        size: 250,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'color',
        header: 'สีเว็บไซต์',
        Cell: ({ cell }: any) => {
          return cell.getValue() ? (
            <div
              style={{ backgroundColor: cell.getValue() }}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            '-'
          );
        },
      },
      {
        accessorKey: 'fullAddress',
        header: 'ที่อยู่บริษัท',
        size: 350,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'tax',
        size: 250,
        header: 'เลขประจำตัวผู้เสียภาษี',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'telephone',
        header: 'เบอร์โทรศัพท์ติดต่อ',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'fax',
        header: 'แฟกซ์',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'guaranteeHeader',
        size: 350,
        header: 'ใช้คำว่า หลักค้ำประกันสัญญา หรือไม่?',
        Cell: ({ cell }: any) => {
          const value = cell.getValue();
          return value ? (
            <Chip startContent={<CircleCheck />} color="success" variant="flat">
              ใช้
            </Chip>
          ) : !value ? (
            <Chip startContent={<CircleX />} color="danger" variant="flat">
              ไม่ใช้
            </Chip>
          ) : (
            '-'
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
    paginationDisplayMode: 'custom',
    renderDetailPanel: ({ row }) => {
      return (
        <div className="felx w-fit flex-col gap-2.5">
          <Button
            radius="full"
            onClick={async () => {
              const { data } = await axios(
                `${apiPath}/api/company?type=modal&companyId=${row?.original?.id}`
              );
              setOriginalBanks(data);
              onOpenBankModal();
            }}
            variant="bordered"
          >
            ธนาคารและบัญชี
          </Button>

          {row?.original?.bank?.length !== 0 && (
            <div className="mt-2.5">
              <MaterialReactTable
                enableBottomToolbar={false}
                enableTopToolbar={false}
                columns={warehouseColumns}
                data={row?.original?.bank}
                enableColumnOrdering={false}
                enableSorting={false}
                enablePagination={false}
                muiTableContainerProps={{ sx: { maxHeight: 300 } }}
              />
            </div>
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
            setProjectSelectId(id);
            const { data } = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/company/${id}`
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
                `${process.env.NEXT_PUBLIC_API_URL}/api/company/${id}`
              );
              await mutate(
                `/api/company?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
                `/api/company?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
            เพิ่มบริษัทใหม่
          </Button>

          <Button
            radius="full"
            startContent={<ArrowUpRight className="opacity-50" />}
            variant="bordered"
            onClick={() => {
              window.open('/protect/company/bank', '_blank');
            }}
          >
            ธนาคารและบัญชี
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/company/${id}`
                          );
                        })
                      );
                    }

                    await mutate(
                      `/api/company?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
    <Layout sitename={'บริษัท'}>
      {formModal()}
      {modalScreenLoading && PageLoading()}
      {formBankModal()}

      <section className="flex flex-col gap-5">
        <Breadcrumbs>
          <BreadcrumbItem
            onClick={() => {
              router.push('/');
            }}
          >
            หน้าแรก
          </BreadcrumbItem>
          <BreadcrumbItem>ข้อมูลบริษัท</BreadcrumbItem>
          <BreadcrumbItem>บริษัท</BreadcrumbItem>
        </Breadcrumbs>

        <HeaderTitle title="บริษัท" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          <CardSummary
            label={'ทั้งหมด'}
            value={bankDashboard?.bankCount}
            suffix="รายการ"
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
