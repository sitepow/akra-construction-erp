import HeaderTitle from '@/components/HeaderTitle';
import Layout from '@/components/Layout';
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
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
import useSWR, { mutate } from 'swr';
import Icon from '@mdi/react';
import { useForm } from 'react-hook-form';
import PageLoading from '@/components/LoadingPage';
import { MenuItem } from '@mui/material';
import { parseDate } from '@internationalized/date';
import { errorRequire } from '@/utils/regex';
import { proviceJsons } from '@/utils/address/provinces';
import { districtJsons } from '@/utils/address/districts';
import { subDistrictJsons } from '@/utils/address/subDistricts';
import { zipcodeJsons } from '@/utils/address/zipcodes';
import { CircleCheck, PlusIcon, Search, XIcon } from 'lucide-react';
import CardSummary from '@/components/CardSummary';
const initForm = {
  supplierId: '',
  name: '',
  address: '',
  district: '',
  subDistrict: '',
  type: '',
  province: '',
  zipcode: '',
  taxId: '',
  telephone: '',
};
import { Notyf } from 'notyf';
import { formatThaiDateTime, fetcher } from '@/utils';
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
  const [proviceId, setProviceId] = useState<any>();
  const [projectSelectId, setProjectSelectId] = useState<any>();
  const [districtFilter, setDistrictFilter] = useState<any>();
  const [subDistrictFilter, setSubDistrictFilter] = useState<any>();
  const [zipcodeFilter, setZipcodeFilter] = useState<any>();
  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    reset: resetForm,
    formState: { errors: errorsForm },
  } = useForm({
    defaultValues: initForm,
  });

  const [pagination, setPagination] = useState({ pageIndex: 1, pageItem: 20 });
  const { data: transferContracts } = useSWR(
    `/api/customer?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: customerDashboard } = useSWR(
    `/api/dashboard?type=customer&companyId=${session?.company?.id}`,
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
            {formMode == 'create' ? 'เพิ่มลูกค้าใหม่' : 'แก้ไขลูกค้า'}
          </ModalHeader>
          <ModalBody>
            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <Select
                label="ประเภทลูกค้า"
                variant="bordered"
                {...registerForm('type', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm.type}
                errorMessage={`${errorsForm.type?.message}`}
              >
                <SelectItem key={'private'}>เอกชน</SelectItem>
                <SelectItem key={'service'}>ราชการ</SelectItem>
              </Select>
              <Input
                variant="bordered"
                label="ชื่อลูกค้า"
                {...registerForm('name', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm.name}
                errorMessage={`${errorsForm.name?.message}`}
              />

              <Input
                variant="bordered"
                label="เลขประจำตัวผู้เสียภาษี"
                {...registerForm('taxId', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm.taxId}
                errorMessage={`${errorsForm.taxId?.message}`}
              />

              <Input
                variant="bordered"
                label="เบอร์โทรศัพท์ติดต่อ"
                {...registerForm('telephone', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm.telephone}
                errorMessage={`${errorsForm.telephone?.message}`}
              />

              <Input
                variant="bordered"
                label="ที่อยู่ลูกค้า"
                {...registerForm('address', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm.address}
                errorMessage={`${errorsForm.address?.message}`}
              />

              <Select
                variant="bordered"
                label="จังหวัด"
                selectedKeys={proviceId ? [proviceId] : undefined}
                onChange={(e: any) => {
                  const proviceCode = e.target.value;
                  setProviceId(proviceCode);

                  const subDistrict = subDistrictJsons?.filter(
                    (item: any) => item?.PROVINCE_ID == proviceCode
                  );

                  const district = districtJsons?.filter(
                    (item: any) => item?.PROVINCE_ID == proviceCode
                  );

                  const zipcode = zipcodeJsons?.filter(
                    (item: any) => item?.PROVINCE_ID == proviceCode
                  );

                  setDistrictFilter(district);
                  setSubDistrictFilter(subDistrict);
                  setZipcodeFilter(zipcode);
                }}
              >
                {proviceJsons?.map((item: any) => {
                  return (
                    <SelectItem key={item?.PROVINCE_ID}>
                      {item?.PROVINCE_NAME}
                    </SelectItem>
                  );
                })}
              </Select>

              <Select
                variant="bordered"
                label="อำเภอ"
                {...registerForm('district')}
              >
                {districtFilter?.map((item: any) => {
                  return (
                    <SelectItem key={item?.DISTRICT_ID}>
                      {item?.DISTRICT_NAME}
                    </SelectItem>
                  );
                })}
              </Select>

              <Select
                variant="bordered"
                label="ตำบล"
                {...registerForm('subDistrict')}
              >
                {subDistrictFilter?.map((item: any) => {
                  return (
                    <SelectItem key={item?.SUB_DISTRICT_ID}>
                      {item?.SUB_DISTRICT_NAME}
                    </SelectItem>
                  );
                })}
              </Select>

              <Select
                variant="bordered"
                label="รหัสไปรณีย์"
                {...registerForm('zipcode')}
              >
                {zipcodeFilter?.map((item: any) => {
                  return (
                    <SelectItem key={item?.ZIPCODE_ID}>
                      {item?.ZIPCODE}
                    </SelectItem>
                  );
                })}
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
                    const province = proviceJsons?.find(
                      (item: any) => item?.PROVINCE_ID == proviceId
                    );
                    const subDistrict = subDistrictJsons?.find(
                      (item: any) => item?.SUB_DISTRICT_ID == data?.subDistrict
                    );
                    const district = districtJsons?.find(
                      (item: any) => item?.DISTRICT_ID == data?.district
                    );
                    const zipcode = zipcodeJsons?.find(
                      (item: any) => item?.ZIPCODE_ID == data?.zipcode
                    );
                    const fullAddress = `${data.address} ตำบล${subDistrict?.SUB_DISTRICT_NAME} อำเภอ${district?.DISTRICT_NAME} จังหวัด${province?.PROVINCE_NAME} ${zipcode?.ZIPCODE}`;
                    const paperResponse =
                      formMode == 'create'
                        ? await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/customer`,
                            {
                              ...data,
                              province: proviceId,
                              companyId: session?.company?.id,
                              fullAddress,
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/customer/${projectSelectId}`,
                            {
                              ...data,
                              province: proviceId,
                              fullAddress,
                            }
                          );
                    await mutate(
                      `/api/customer?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
        header: 'รหัสประจำตัวลูกค้า',
      },
      {
        accessorKey: 'name',
        header: 'ชื่อลูกค้า',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'fullAddress',
        header: 'ที่อยู่',
        size: 300,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'type',
        header: 'ประเภทลูกค้า',
        Cell: ({ cell }: any) => {
          const status = cell.getValue();
          return status == 'private' ? (
            <span>เอกชน</span>
          ) : status == 'service' ? (
            <span>ราชการ</span>
          ) : (
            '-'
          );
        },
      },
      {
        accessorKey: 'taxId',
        header: 'เลขประจำตัวผู้เสียภาษี',
        size: 250,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'telephone',
        header: 'เบอร์โทรศัพท์ติดต่อ',
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
              `${process.env.NEXT_PUBLIC_API_URL}/api/customer/${id}`
            );

            setProviceId(data?.province);
            const subDistrict = subDistrictJsons?.filter(
              (item: any) => item?.PROVINCE_ID == data?.province
            );

            const district = districtJsons?.filter(
              (item: any) => item?.PROVINCE_ID == data?.province
            );

            const zipcode = zipcodeJsons?.filter(
              (item: any) => item?.PROVINCE_ID == data?.province
            );

            setDistrictFilter(district);
            setSubDistrictFilter(subDistrict);
            setZipcodeFilter(zipcode);
            resetForm({
              ...data,
              transferDate: data?.transferDate
                ? parseDate(data?.transferDate)
                : null,
              reciveAmountDate: data?.reciveAmountDate
                ? parseDate(data?.reciveAmountDate)
                : null,
              borrowDate: data?.borrowDate ? parseDate(data?.borrowDate) : null,
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
                `${process.env.NEXT_PUBLIC_API_URL}/api/customer/${id}`
              );
              await mutate(
                `/api/customer?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
                `/api/customer?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
            เพิ่มลูกค้าใหม่
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/customer/${id}`
                          );
                        })
                      );
                    }

                    await mutate(
                      `/api/customer?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
    <Layout sitename={'ลูกค้า'}>
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
          <BreadcrumbItem>รายชื่อผู้ติดต่อ</BreadcrumbItem>
          <BreadcrumbItem>ลูกค้า</BreadcrumbItem>
        </Breadcrumbs>

        <HeaderTitle title="ลูกค้า" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          <CardSummary
            label={'ทั้งหมด'}
            value={customerDashboard?.customerCount}
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
