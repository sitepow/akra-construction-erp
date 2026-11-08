import Layout from '@/components/Layout';
import PageLoading from '@/components/LoadingPage';
import { errorRequire } from '@/utils/regex';
import { useEffect, useMemo, useRef } from 'react';
import {
  MaterialReactTable,
  MRT_ColumnDef,
  useMaterialReactTable,
} from 'material-react-table';
import { MenuItem } from '@mui/material';
import {
  Button,
  BreadcrumbItem,
  Breadcrumbs,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  useDisclosure,
  Input,
  ModalFooter,
  DatePicker,
  Select,
  SelectItem,
  Pagination,
  DateRangePicker,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  ScrollShadow,
  Card,
  CardBody,
  Alert,
} from '@nextui-org/react';
import axios from 'axios';
import { Notyf } from 'notyf';
import {
  ArrowDown,
  CircleAlert,
  CircleX,
  ClipboardIcon,
  Clock,
  PlusIcon,
  RefreshCcw,
  Search,
  SearchIcon,
  Settings,
  CircleCheck,
  Trash,
  XIcon,
  ArrowUp,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import useSWR, { mutate } from 'swr';
import CardSummary from '@/components/CardSummary';
import { mdiFilterOffOutline, mdiFilterOutline } from '@mdi/js';

import { parseDate } from '@internationalized/date';
import Icon from '@mdi/react';
import HeaderTitle from '@/components/HeaderTitle';
import ThaiBahtText from 'thai-baht-text';
import { districtJsons } from '@/utils/address/districts';
import { proviceJsons } from '@/utils/address/provinces';
import { subDistrictJsons } from '@/utils/address/subDistricts';
import { zipcodeJsons } from '@/utils/address/zipcodes';
import {
  formatAmount,
  formatThaiDateTime,
  apiPath,
  convertDateJsonToDbSingle,
  formatThaiFullDate,
  formatThaiDate,
  convertDateJsonToDbRange,
  fetcher,
} from '@/utils';
import getSession from '@/utils/session';
const resetProjectForm = {
  id: '',
  no: '',
  name: '',
  contractNo: '',
  organization: '',
  contractAmount: '',
  projectDuration: '',
  remainingDuration: '',
  guaranteeAmount: '',
  guaranteeStatus: '',
  guaranteeNumber: '',
  contractDate: null,
  contractEndDate: null,
  guaranteeEndDate: null,
  status: 'pending',
  customerId: null,
};
const initGuaranteeForm = {
  projectId: null,
  guaranteeSlipNo: '',
  paidGuaranteeDate: null,
  guaranteeSlipNumber: '',
  status: 'pending',
};
const initStampForm = {
  projectId: null,
  reciveDate: null,
  stampDate: null,
  stampAmount: '',
  status: 'pending',
};
const initCustomerForm = {
  supplierId: null,
  province: null,
  name: '',
  address: '',
  district: '',
  subDistrict: '',
  type: '',
  zipcode: '',
  taxId: '',
  telephone: '',
};

const initServiceForm = {
  serviceId: null,
  projectId: null,
  completeDate: parseDate(new Date().toISOString().split('T')[0]) as any,
  taxType: 'vat',
  toBankId: null,
  paymentType: 'cash',
};

const initInventoryForm = {
  modeWithdraw: 'return',
  objectiveWithdraw: 'project_use',
  projectId: null,
  repairId: null,
  expectedDateReturn: null,
  dateReturn: null,
  remark: '',
  explain: '',
  totalWithdraw: 0,
  totalReturn: 0,
};

const initTaxInvoiceForm = {
  serviceId: null,
  taxInvoiceId: null,
  status: 'pending',
  pendingDate: parseDate(new Date().toISOString().split('T')[0]) as any,
  completeDate: null,
  remark: '',
};

const initReceiptForm = {
  serviceId: null,
  receiptId: null,
  status: 'pending',
  pendingDate: parseDate(new Date().toISOString().split('T')[0]) as any,
  completeDate: null,
  remark: '',
};

export default function Project() {
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
  const router = useRouter();
  const { session } = getSession() as any;
  const [formInventoryMode, setFormInventoryMode] = useState('create');
  const [categoryId, setCategoryId] = useState('all');
  const [products, setProducts] = useState<any>([]);
  const [inventoryId, setInventoryId] = useState<any>();
  const [returnProducts, setReturnProducts] = useState<any>([]);
  const [returnProductArrays, setReturnProductArrays] = useState<any>([]);
  const [productId, setProductId] = useState<any>(null);
  const [returnProductId, setReturnProductId] = useState<any>(null);
  const [formGuaranteeMode, setFormGuaranteeMode] = useState('create');
  const [formStampMode, setFormStampMode] = useState('create');
  const [guaranteeHeader, setGuaranteeHeader] = useState('ธนาคารค้ำประกัน');
  const [guaranteeId, setGuaranteeId] = useState<any>();
  const [stampId, setStampId] = useState<any>();
  const [customerId, setCustomerId] = useState<any>();
  const [projectSelectId, setProjectSelectId] = useState<any>();
  const [districtFilter, setDistrictFilter] = useState<any>();
  const [subDistrictFilter, setSubDistrictFilter] = useState<any>();
  const [customerMode, setCustomerMode] = useState('create');
  const [zipcodeFilter, setZipcodeFilter] = useState<any>();
  const [searchData, setSearchData] = useState<any>([]);
  const [searchDataDashboard, setSearchDataDashboard] = useState<any>();
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [formServiceMode, setFormServiceMode] = useState('create');
  const [formTaxInvoiceMode, setFormTaxInvoiceMode] = useState('create');
  const [formReceiptMode, setFormReceiptMode] = useState('create');
  const [status, setStatus] = useState<any>('all');
  const [pagination, setPagination] = useState({ pageIndex: 1, pageItem: 20 });

  useEffect(() => {
    const guaranteeHeaderData = session?.company?.guaranteeHeader;
    if (guaranteeHeaderData) {
      if (guaranteeHeaderData) {
        setGuaranteeHeader('หลักค้ำประกันสัญญา');
      } else {
        setGuaranteeHeader('ธนาคารค้ำประกัน');
      }
    }
  }, [session?.company?.guaranteeHeader]);

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

  const { data: projects } = useSWR(
    `/api/project?page=${pagination?.pageIndex}&type=projects&perPage=${pagination?.pageItem}&companyId=${session?.company?.id}&status=${status}`,
    fetcher
  );
  const { data: projectDashboard } = useSWR(
    `/api/project?type=dashboard&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: projectNewDashboard } = useSWR(
    `/api/dashboard?type=project&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: companyBankDropdown } = useSWR(
    `/api/company/bank?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: customerDropdown } = useSWR(
    `/api/customer?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: productInventoryDropdown } = useSWR(
    `/api/warehouse?type=dropdown&companyId=${session?.company?.id}&categoryId=${categoryId}&status=available`,
    fetcher
  );
  const { data: categoryDown } = useSWR(
    `/api/warehouse/category?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const [apiLoading, setApiLoading] = useState(false);
  const [modalScreenLoading, setModalScreenLoading] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [showPdfRender, setShowPdfRender] = useState(false);
  const pdfRef = useRef<any>();
  const [documentType, setDocumentType] = useState('quotation');
  const [pdfData, setPdfData] = useState<any>();
  const {
    isOpen: isOpenProjectModal,
    onOpen: onOpenProjectModal,
    onClose: onCloseProjectModal,
  } = useDisclosure();

  const warehouseColumnsWithdraw = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        header: 'โหมดการกระทำ',
        Cell: ({ cell }: any) => {
          return (
            <Chip variant="flat" startContent={<ArrowDown />} color="danger">
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
            <Chip variant="flat" startContent={<ArrowUp />} color="success">
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

  const {
    register: registerSearchForm,
    reset: resetSearchForm,
    control: controlSearchForm,
    getValues: getValuesSearchForm,
    handleSubmit: handleSubmitSearchForm,
  } = useForm({
    defaultValues: {
      projectDateRange: {
        start: null,
        end: null,
      },
      databaseSearch: '',
    },
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
    register: registerStampForm,
    handleSubmit: handleSubmitStampForm,
    reset: resetStampForm,
    setValue: setValueStampForm,
    control: controlStampForm,
    formState: { errors: errorsStampForm },
  } = useForm({
    defaultValues: initStampForm,
  });

  const {
    register: registerGuaranteeForm,
    handleSubmit: handleSubmitGuaranteeForm,
    reset: resetGuaranteeForm,
    setValue: setValueGuaranteeForm,
    control: controlGuaranteeForm,
    formState: { errors: errorsGuaranteeForm },
  } = useForm({
    defaultValues: initGuaranteeForm,
  });

  const {
    handleSubmit: handleSubmitCustomerForm,
    reset: resetCustomerForm,
    control: controlCustomerForm,
  } = useForm({
    defaultValues: initCustomerForm,
  });

  useEffect(() => {
    setProductId(null);
  }, [categoryId]);

  useEffect(() => {
    setValueInventoryForm(
      'expectedDateReturn',
      parseDate(new Date().toISOString().split('T')[0]) as any
    );
  }, [watchInventoryForm('modeWithdraw') == 'return']);

  const {
    isOpen: isOpenCustomerModal,
    onOpen: onOpenCustomerModal,
    onClose: onCloseCustomerModal,
  } = useDisclosure();

  const formCustomerModal = () => {
    return (
      <Modal
        size="4xl"
        scrollBehavior="inside"
        isOpen={isOpenCustomerModal}
        isDismissable={false}
        onClose={() => {
          resetCustomerForm(initCustomerForm);
          onCloseCustomerModal();
        }}
      >
        <ModalContent>
          <ModalHeader>จัดการลูกค้า</ModalHeader>
          <ModalBody>
            <form className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              <Controller
                control={controlCustomerForm}
                name="type"
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
                    label="ประเภทลูกค้า"
                    variant="bordered"
                    selectedKeys={[value as any]}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                    isInvalid={!!error}
                    errorMessage={error?.message}
                  >
                    <SelectItem key={'private'}>เอกชน</SelectItem>
                    <SelectItem key={'service'}>ราชการ</SelectItem>
                  </Select>
                )}
              />

              <Controller
                control={controlCustomerForm}
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
                    variant="bordered"
                    label="ชื่อลูกค้า"
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
                control={controlCustomerForm}
                name="taxId"
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
                    variant="bordered"
                    label="เลขประจำตัวผู้เสียภาษี"
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
                control={controlCustomerForm}
                name="telephone"
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
                    variant="bordered"
                    label="เบอร์โทรศัพท์ติดต่อ"
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
                control={controlCustomerForm}
                name="address"
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
                    variant="bordered"
                    label="ที่อยู่ลูกค้า"
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
                control={controlCustomerForm}
                name="province"
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
                    variant="bordered"
                    label="จังหวัด"
                    selectedKeys={[value as any]}
                    onChange={(range: any) => {
                      onChange(range);

                      const subDistrict = subDistrictJsons?.filter(
                        (item: any) => item?.PROVINCE_ID == range?.target?.value
                      );

                      const district = districtJsons?.filter(
                        (item: any) => item?.PROVINCE_ID == range?.target?.value
                      );

                      const zipcode = zipcodeJsons?.filter(
                        (item: any) => item?.PROVINCE_ID == range?.target?.value
                      );

                      setDistrictFilter(district);
                      setSubDistrictFilter(subDistrict);
                      setZipcodeFilter(zipcode);
                    }}
                    isInvalid={!!error}
                    errorMessage={error?.message}
                  >
                    {proviceJsons?.map((item: any) => {
                      return (
                        <SelectItem key={item?.PROVINCE_ID}>
                          {item?.PROVINCE_NAME}
                        </SelectItem>
                      );
                    })}
                  </Select>
                )}
              />

              <Controller
                control={controlCustomerForm}
                name="district"
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
                    variant="bordered"
                    label="อำเภอ"
                    selectedKeys={[value as any]}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                    isInvalid={!!error}
                    errorMessage={error?.message}
                  >
                    {districtFilter?.map((item: any) => {
                      return (
                        <SelectItem key={item?.DISTRICT_ID}>
                          {item?.DISTRICT_NAME}
                        </SelectItem>
                      );
                    })}
                  </Select>
                )}
              />

              <Controller
                control={controlCustomerForm}
                name="subDistrict"
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
                    variant="bordered"
                    label="ตำบล"
                    selectedKeys={[value as any]}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                    isInvalid={!!error}
                    errorMessage={error?.message}
                  >
                    {subDistrictFilter?.map((item: any) => {
                      return (
                        <SelectItem key={item?.SUB_DISTRICT_ID}>
                          {item?.SUB_DISTRICT_NAME}
                        </SelectItem>
                      );
                    })}
                  </Select>
                )}
              />

              <Controller
                control={controlCustomerForm}
                name="zipcode"
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
                    variant="bordered"
                    label="รหัสไปรณีย์"
                    selectedKeys={[value as any]}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                    isInvalid={!!error}
                    errorMessage={error?.message}
                  >
                    {zipcodeFilter?.map((item: any) => {
                      return (
                        <SelectItem key={item?.ZIPCODE_ID}>
                          {item?.ZIPCODE}
                        </SelectItem>
                      );
                    })}
                  </Select>
                )}
              />
            </form>

            <div className="flex justify-end gap-2 flex-wrap">
              <Button
                radius="full"
                className="bg-primary text-white"
                isLoading={isApiLoading}
                startContent={!isApiLoading && <CircleCheck />}
                onClick={handleSubmitCustomerForm(async (data) => {
                  try {
                    setIsApiLoading(true);
                    const province = proviceJsons?.find(
                      (item: any) => item?.PROVINCE_ID == data?.province
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
                      customerMode == 'create'
                        ? await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/customer`,
                            {
                              ...data,
                              companyId: session?.company?.id,
                              fullAddress,
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/customer/${customerId}`,
                            {
                              ...data,
                              fullAddress,
                            }
                          );
                    await mutate(
                      `/api/customer?type=dropdown&companyId=${session?.company?.id}`
                    );
                    notyf.success(paperResponse?.data?.message);
                    setIsApiLoading(false);
                    resetCustomerForm(initCustomerForm);
                    setCustomerMode('create');
                  } catch (error: any) {
                    notyf.error(error?.response?.data);
                    setIsApiLoading(false);
                    console.log(error);
                  }
                })}
              >
                {customerMode == 'create' ? 'บันทึกข้อมูล' : 'แก้ไขข้อมูล'}
              </Button>

              {customerMode == 'update' && (
                <Button
                  radius="full"
                  startContent={<CircleX />}
                  onClick={() => {
                    resetCustomerForm(initCustomerForm);
                    setCustomerMode('create');
                  }}
                  className="border-primary text-primary"
                  variant="bordered"
                >
                  ยกเลิก
                </Button>
              )}
            </div>

            <ScrollShadow className="max-h-96">
              <div className="grid grid-cols-2 gap-2.5">
                {customerDropdown?.map((item: any) => {
                  return (
                    <Card
                      className="my-1.5 border dark:border-dark"
                      shadow="sm"
                    >
                      <CardBody>
                        <div className="w-full flex justify-between">
                          <span>{item?.name}</span>

                          <div className="flex gap-2.5">
                            <Settings
                              onClick={async () => {
                                setCustomerId(item?.id);
                                setCustomerMode('update');

                                const { data } = await axios.get(
                                  `${apiPath}/api/customer/${item?.id}`
                                );

                                const proviceCode = data?.province;

                                const subDistrict = subDistrictJsons?.filter(
                                  (item: any) =>
                                    item?.PROVINCE_ID == proviceCode
                                );

                                const district = districtJsons?.filter(
                                  (item: any) =>
                                    item?.PROVINCE_ID == proviceCode
                                );

                                const zipcode = zipcodeJsons?.filter(
                                  (item: any) =>
                                    item?.PROVINCE_ID == proviceCode
                                );

                                setDistrictFilter(district);
                                setSubDistrictFilter(subDistrict);
                                setZipcodeFilter(zipcode);

                                resetCustomerForm(data);
                              }}
                              className="opacity-20 cursor-pointer hover:opacity-100"
                            />
                            <Trash
                              onClick={async () => {
                                try {
                                  await axios.delete(
                                    `${apiPath}/api/customer/${item?.id}`
                                  );
                                  await mutate(
                                    `/api/customer?type=dropdown&companyId=${session?.company?.id}`
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
              </div>
            </ScrollShadow>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
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
            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
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
                      `/api/project?page=${pagination?.pageIndex}&type=projects&perPage=${pagination?.pageItem}&companyId=${session?.company?.id}&status=${status}`
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
                description={
                  <>
                    ระบบจะเลือกเฉพาะสินค้าที่อยู่ในสถานะ พร้อมใช้งาน เท่านั้น
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
                title={'แจ้งเตือน'}
              />

              {productInventoryDropdown?.length == 0 && (
                <Alert
                  color="warning"
                  description={
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
                  }
                  title="แจ้งเตือน"
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
                description="เมื่อคุณทำการคืนสินค้าเรียบร้อยแล้ว จะไม่สามารถยกเลิกหรือทำรายการคืนสินค้าในครั้งเดิมซ้ำได้อีกดังนั้น โปรดตรวจสอบให้แน่ใจว่าสินค้าที่ต้องการคืนถูกต้องครบถ้วนก่อนดำเนินการสร้างใบคืนสินค้า"
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
                          `/api/project?page=${pagination?.pageIndex}&type=projects&perPage=${pagination?.pageItem}&companyId=${session?.company?.id}&status=${status}`
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

  const printPdf = async () => {
    setShowPdfRender(true);
    const element = pdfRef.current;
    const html2pdf = (await import('html2pdf.js/dist/html2pdf.min.js' as any))
      .default;

    const opt = {
      filename: `${documentType}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    };

    html2pdf()
      .from(element)
      .set(opt)
      .output('blob')
      .then((blob: any) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setShowPdfRender(false);
      });
  };

  const pdfRender = () => {
    return (
      <div ref={pdfRef}>
        <div
          className={`bg-white p-5 rounded-large text-black ${showPdfRender ? 'block' : 'hidden'} text-[14px]`}
        >
          <div className="flex justify-between mb-5">
            <div>
              <h1 className="font-bold">
                {pdfData?.company?.name} (สำนักงานใหญ่)
              </h1>
              <p>เลขประจำตัวผู้เสียภาษี {pdfData?.company?.tax}</p>
              <p>{pdfData?.company?.fullAddress}</p>
              <p>
                ติดต่อ {pdfData?.company?.telephone} แฟกซ์.{' '}
                {pdfData?.company?.fax || '-'}
              </p>
            </div>
            <div className="text-right">
              <h1 className="font-bold">
                {documentType === 'quotation' &&
                  'ใบเสนอราคา/Quotation(ต้นฉบับ)'}
                {documentType === 'delivery' &&
                  'ใบส่งของ/Delivery Note(ต้นฉบับ)'}
                {documentType === 'tax-invoice' &&
                  'ใบกำกับภาษี/Tax Invoice(ต้นฉบับ)'}
                {documentType === 'receipt' &&
                  'ใบเสร็จรับเงิน/Receipt(ต้นฉบับ)'}
              </h1>
              <p>
                เลขที่ {documentType === 'quotation' && pdfData?.no}
                {documentType === 'delivery' && pdfData?.deliveryNote?.no}
                {documentType === 'tax-invoice' && pdfData?.taxInvoice?.no}
                {documentType === 'receipt' && pdfData?.receipt?.no}
              </p>
              <p>
                วันที่{' '}
                {documentType === 'quotation' &&
                  formatThaiFullDate(pdfData?.pendingDate)}
                {documentType === 'delivery' &&
                  formatThaiFullDate(pdfData?.deliveryNote?.pendingDate)}
                {documentType === 'tax-invoice' &&
                  formatThaiFullDate(pdfData?.taxInvoice?.pendingDate)}
                {documentType === 'receipt' &&
                  formatThaiFullDate(pdfData?.receipt?.pendingDate)}
              </p>
              {(documentType == 'quotation' || documentType == 'delivery') && (
                <p>ใช้กับโครงการ (ถ้ามี) {pdfData?.name}</p>
              )}
            </div>
          </div>

          <div className="mb-5">
            <p>
              ลูกค้า {pdfData?.project?.customer?.name}{' '}
              {pdfData?.project?.customer?.type == 'private' &&
                '(สำนักงานใหญ่)'}
            </p>
            <p>เลขประจำตัวผู้เสียภาษี {pdfData?.project?.customer?.taxId}</p>
            <p>{pdfData?.project?.customer?.fullAddress}</p>
            <p>ติดต่อ {pdfData?.project?.customer?.telephone}</p>
          </div>

          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-center">
                  ลำดับ
                </th>
                <th className="border border-gray-300 p-2 text-left">รายการ</th>
                <th className="border border-gray-300 p-2 text-right">
                  ราคารวม
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="break-inside-avoid">
                <td className="border border-gray-300 p-2 text-center">1</td>
                <td className="border border-gray-300 p-2 text-wrap">
                  {pdfData?.project?.name}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  {formatAmount(pdfData?.project?.contractAmount)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end mt-5">
            <div className="w-1/3">
              <div className="flex justify-between py-1">
                <span>รวมเป็นเงิน</span>
                <span>
                  {formatAmount(pdfData?.project?.contractAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>ภาษีมูลค่าเพิ่ม (7%)</span>
                <span>
                  {formatAmount(pdfData?.project?.contractAmount * 0.07 || 0)}
                </span>
              </div>
              <div className="flex justify-between py-1 font-bold">
                <span>ยอดรวมทั้งสิ้น</span>
                <span>
                  {formatAmount(
                    pdfData?.taxType == 'vat'
                      ? pdfData?.project?.contractAmount -
                          pdfData?.project?.contractAmount * 0.07
                      : pdfData?.project?.contractAmount +
                          pdfData?.project?.contractAmount * 0.07 || 0
                  )}
                </span>
              </div>
              <div className="flex text-end py-1">
                (
                {ThaiBahtText(
                  pdfData?.taxType == 'vat'
                    ? pdfData?.project?.contractAmount -
                        pdfData?.project?.contractAmount * 0.07
                    : pdfData?.project?.contractAmount +
                        pdfData?.project?.contractAmount * 0.07 || 0
                )}
                )
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-10">
            {documentType === 'quotation' && (
              <>
                <div className="text-center">
                  <p>________________________________________________</p>
                  <p className="mb-5 mt-2.5">ผู้เสนอราคา</p>
                  <p>วันที่ {formatThaiFullDate(pdfData?.pendingDate)}</p>
                </div>
                <div className="text-center">
                  <p>________________________________________________</p>
                  <p className="mb-5 mt-2.5">ลูกค้า/ผู้อนุมัติ</p>
                  <p>วันที่ ________________________________________________</p>
                </div>
              </>
            )}
            {documentType === 'delivery' && (
              <>
                <div className="text-center">
                  <p>________________________________________________</p>
                  <p className="mb-5 mt-2.5">ผู้ส่งของ</p>
                  <p>
                    วันที่{' '}
                    {formatThaiFullDate(pdfData?.deliveryNote?.pendingDate)}
                  </p>
                </div>
                <div className="text-center">
                  <p>________________________________________________</p>
                  <p className="mb-5 mt-2.5">ผู้รับของ</p>
                  <p>วันที่ ________________________________________________</p>
                </div>
              </>
            )}
            {documentType === 'tax-invoice' && (
              <>
                <div className="text-center">
                  <p>________________________________________________</p>
                  <p className="mb-5 mt-2.5">ผู้รับเงิน</p>
                  <p>
                    วันที่{' '}
                    {formatThaiFullDate(pdfData?.taxInvoice?.pendingDate)}
                  </p>
                </div>
                <div className="text-center">
                  <p>________________________________________________</p>
                  <p className="mb-5 mt-2.5">ผู้รับสินค้า</p>
                  <p>วันที่ ________________________________________________</p>
                </div>
              </>
            )}
            {documentType === 'receipt' && (
              <>
                <div className="text-center">
                  <p>________________________________________________</p>
                  <p className="mb-5 mt-2.5">ผู้รับเงิน</p>
                  <p>
                    วันที่ {formatThaiFullDate(pdfData?.receipt?.pendingDate)}
                  </p>
                </div>
                <div className="text-center">
                  <p>________________________________________________</p>
                  <p className="mb-5 mt-2.5">ผู้อนุมัติ</p>
                  <p>วันที่ ________________________________________________</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="page-break" style={{ pageBreakBefore: 'always' }} />

        <div
          className={`bg-white p-5 rounded-large text-black ${showPdfRender ? 'block' : 'hidden'} text-[14px]`}
        >
          <div className="flex justify-between mb-5">
            <div>
              <h1 className="font-bold">
                {pdfData?.company?.name} (สำนักงานใหญ่)
              </h1>
              <p>เลขประจำตัวผู้เสียภาษี {pdfData?.company?.tax}</p>
              <p>{pdfData?.company?.fullAddress}</p>
              <p>
                ติดต่อ {pdfData?.company?.telephone} แฟกซ์.{' '}
                {pdfData?.company?.fax || '-'}
              </p>
            </div>
            <div className="text-right">
              <h1 className="font-bold">
                {documentType === 'quotation' && 'ใบเสนอราคา/Quotation(สำเนา)'}
                {documentType === 'delivery' && 'ใบส่งของ/Delivery Note(สำเนา)'}
                {documentType === 'tax-invoice' &&
                  'ใบกำกับภาษี/Tax Invoice(สำเนา)'}
                {documentType === 'receipt' && 'ใบเสร็จรับเงิน/Receipt(สำเนา)'}
              </h1>
              <p>
                เลขที่ {documentType === 'quotation' && pdfData?.no}
                {documentType === 'delivery' && pdfData?.deliveryNote?.no}
                {documentType === 'tax-invoice' && pdfData?.taxInvoice?.no}
                {documentType === 'receipt' && pdfData?.receipt?.no}
              </p>
              <p>
                วันที่{' '}
                {documentType === 'quotation' &&
                  formatThaiFullDate(pdfData?.pendingDate)}
                {documentType === 'delivery' &&
                  formatThaiFullDate(pdfData?.deliveryNote?.pendingDate)}
                {documentType === 'tax-invoice' &&
                  formatThaiFullDate(pdfData?.taxInvoice?.pendingDate)}
                {documentType === 'receipt' &&
                  formatThaiFullDate(pdfData?.receipt?.pendingDate)}
              </p>
              {(documentType == 'quotation' || documentType == 'delivery') && (
                <p>ใช้กับโครงการ (ถ้ามี) {pdfData?.name}</p>
              )}
            </div>
          </div>

          <div className="mb-5">
            <p>
              ลูกค้า {pdfData?.project?.customer?.name}{' '}
              {pdfData?.project?.customer?.type == 'private' &&
                '(สำนักงานใหญ่)'}
            </p>
            <p>เลขประจำตัวผู้เสียภาษี {pdfData?.project?.customer?.taxId}</p>
            <p>{pdfData?.project?.customer?.fullAddress}</p>
            <p>ติดต่อ {pdfData?.project?.customer?.telephone}</p>
          </div>

          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-center">
                  ลำดับ
                </th>
                <th className="border border-gray-300 p-2 text-left">รายการ</th>
                <th className="border border-gray-300 p-2 text-right">
                  ราคารวม
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="break-inside-avoid">
                <td className="border border-gray-300 p-2 text-center">1</td>
                <td className="border border-gray-300 p-2 text-wrap">
                  {pdfData?.project?.name}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  {formatAmount(pdfData?.project?.contractAmount)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end mt-5">
            <div className="w-1/3">
              <div className="flex justify-between py-1">
                <span>รวมเป็นเงิน</span>
                <span>
                  {formatAmount(pdfData?.project?.contractAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>ภาษีมูลค่าเพิ่ม (7%)</span>
                <span>
                  {formatAmount(pdfData?.project?.contractAmount * 0.07 || 0)}
                </span>
              </div>
              <div className="flex justify-between py-1 font-bold">
                <span>ยอดรวมทั้งสิ้น</span>
                <span>
                  {formatAmount(
                    pdfData?.taxType == 'vat'
                      ? pdfData?.project?.contractAmount -
                          pdfData?.project?.contractAmount * 0.07
                      : pdfData?.project?.contractAmount +
                          pdfData?.project?.contractAmount * 0.07 || 0
                  )}
                </span>
              </div>
              <div className="flex text-end py-1">
                (
                {ThaiBahtText(
                  pdfData?.taxType == 'vat'
                    ? pdfData?.project?.contractAmount -
                        pdfData?.project?.contractAmount * 0.07
                    : pdfData?.project?.contractAmount +
                        pdfData?.project?.contractAmount * 0.07 || 0
                )}
                )
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-10">
            {documentType === 'quotation' && (
              <>
                <div className="text-center">
                  <p>________________________________________________</p>
                  <p className="mb-5 mt-2.5">ผู้เสนอราคา</p>
                  <p>วันที่ {formatThaiFullDate(pdfData?.pendingDate)}</p>
                </div>
                <div className="text-center">
                  <p>________________________________________________</p>
                  <p className="mb-5 mt-2.5">ลูกค้า/ผู้อนุมัติ</p>
                  <p>วันที่ ________________________________________________</p>
                </div>
              </>
            )}
            {documentType === 'delivery' && (
              <>
                <div className="text-center">
                  <p>________________________________________________</p>
                  <p className="mb-5 mt-2.5">ผู้ส่งของ</p>
                  <p>
                    วันที่{' '}
                    {formatThaiFullDate(pdfData?.deliveryNote?.pendingDate)}
                  </p>
                </div>
                <div className="text-center">
                  <p>________________________________________________</p>
                  <p className="mb-5 mt-2.5">ผู้รับของ</p>
                  <p>วันที่ ________________________________________________</p>
                </div>
              </>
            )}
            {documentType === 'tax-invoice' && (
              <>
                <div className="text-center">
                  <p>________________________________________________</p>
                  <p className="mb-5 mt-2.5">ผู้รับเงิน</p>
                  <p>
                    วันที่{' '}
                    {formatThaiFullDate(pdfData?.taxInvoice?.pendingDate)}
                  </p>
                </div>
                <div className="text-center">
                  <p>________________________________________________</p>
                  <p className="mb-5 mt-2.5">ผู้รับสินค้า</p>
                  <p>วันที่ ________________________________________________</p>
                </div>
              </>
            )}
            {documentType === 'receipt' && (
              <>
                <div className="text-center">
                  <p>________________________________________________</p>
                  <p className="mb-5 mt-2.5">ผู้รับเงิน</p>
                  <p>
                    วันที่ {formatThaiFullDate(pdfData?.receipt?.pendingDate)}
                  </p>
                </div>
                <div className="text-center">
                  <p>________________________________________________</p>
                  <p className="mb-5 mt-2.5">ผู้อนุมัติ</p>
                  <p>วันที่ ________________________________________________</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const {
    register: registerProjectModal,
    handleSubmit: handleSubmitProjectModal,
    reset: resetProjectModal,
    control: controlProjectModal,
    formState: { errors: errorsProjectModal },
  } = useForm();

  const {
    register: registerServiceForm,
    handleSubmit: handleSubmitServiceForm,
    reset: resetServiceForm,
    setValue: setValueServiceForm,
    watch: watchServiceForm,
    control: controlServiceForm,
    formState: { errors: errorsServiceForm },
  } = useForm({
    defaultValues: initServiceForm,
  });

  const {
    register: registerTaxInvoiceForm,
    handleSubmit: handleSubmitTaxInvoiceForm,
    reset: resetTaxInvoiceForm,
    setValue: setValueInvoiceForm,
    control: controlTaxInvoiceForm,
  } = useForm({
    defaultValues: initTaxInvoiceForm,
  });
  const {
    register: registerReceiptForm,
    handleSubmit: handleSubmitReceiptForm,
    reset: resetReceiptForm,
    setValue: setValueReceiptForm,
    control: controlReceiptForm,
  } = useForm({
    defaultValues: initReceiptForm,
  });

  const {
    isOpen: isOpenServiceModal,
    onOpen: onOpenServiceModal,
    onClose: onCloseServiceModal,
  } = useDisclosure();

  const {
    isOpen: isOpenTaxInvoiceModal,
    onOpen: onOpenTaxInvoiceModal,
    onClose: onCloseTaxInvoiceModal,
  } = useDisclosure();

  const {
    isOpen: isOpenReceiptModal,
    onOpen: onOpenReceiptModal,
    onClose: onCloseReceiptModal,
  } = useDisclosure();

  const formServiceModal = () => {
    return (
      <Modal
        size="4xl"
        scrollBehavior="inside"
        isOpen={isOpenServiceModal}
        isDismissable={false}
        onClose={() => {
          resetServiceForm(initServiceForm);
          onCloseServiceModal();
        }}
      >
        <ModalContent>
          <ModalHeader>
            {formServiceMode == 'create'
              ? 'สร้างใบเหมาบริการ'
              : 'แก้ไขใบเหมาบริการ'}
          </ModalHeader>
          <ModalBody>
            <Alert
              title="แจ้งเตือน"
              description="เมื่อสร้างใบจ้างเหมาบริการ โครงการจะเปลี่ยนสถานะเป็น `ดำเนินการเสร็จแล้ว` และจะไม่สามารถแก้ไขสถานะได้อีกเว้นแต่ว่าจะลบใบจ้างเหมาบริการนั้นออก ระบบจึงจะเปลี่ยนสถานะโครงการกลับมาเป็น `กำลังดำเนินการ` อีกครั้ง"
            />

            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <Select
                variant="bordered"
                label="การชำระเงิน"
                {...registerServiceForm('paymentType', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsServiceForm?.paymentType}
                errorMessage={errorsServiceForm?.paymentType?.message}
              >
                <SelectItem key={'cash'}>เงินสด</SelectItem>
                <SelectItem key={'bank'}>เงินโอน</SelectItem>
              </Select>
              {watchServiceForm('paymentType') !== 'cash' && (
                <>
                  <Select
                    variant="bordered"
                    label="บัญชีที่รับโอน"
                    {...registerServiceForm('toBankId', {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                    })}
                    isInvalid={!!errorsServiceForm?.toBankId}
                    errorMessage={errorsServiceForm?.toBankId?.message}
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
                </>
              )}

              <Select
                variant="bordered"
                {...registerServiceForm('taxType', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsServiceForm?.taxType}
                errorMessage={errorsServiceForm?.taxType?.message}
                label="ประเภทภาษี"
                isRequired
              >
                <SelectItem key={'vat'}>รวม VAT</SelectItem>
                <SelectItem key={'nonVat'}>ไม่รวม VAT</SelectItem>
              </Select>

              <Controller
                control={controlServiceForm}
                name="completeDate"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    showMonthAndYearPickers
                    variant="bordered"
                    label="วันที่ส่งมอบโครงการ"
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
                startContent={<Settings className="opacity-50" />}
                onClick={() => {
                  onOpenCustomerModal();
                }}
                variant="bordered"
              >
                จัดการลูกค้า
              </Button>
              <Button
                radius="full"
                className="bg-primary text-white"
                isLoading={isApiLoading}
                startContent={!isApiLoading && <CircleCheck />}
                onClick={handleSubmitServiceForm(async (data) => {
                  try {
                    setIsApiLoading(true);
                    const paperResponse =
                      formServiceMode == 'create'
                        ? await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/service`,
                            {
                              ...data,
                              companyId: session?.company?.id,
                              completeDate: convertDateJsonToDbSingle(
                                data?.completeDate
                              ),
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/service/${data?.serviceId}`,
                            {
                              ...data,
                              completeDate: convertDateJsonToDbSingle(
                                data?.completeDate
                              ),
                            }
                          );
                    await mutate(
                      `/api/project?page=${pagination?.pageIndex}&type=projects&perPage=${pagination?.pageItem}&companyId=${session?.company?.id}&status=${status}`
                    );
                    notyf.success(paperResponse?.data?.message);
                    setIsApiLoading(false);
                    onCloseServiceModal();
                    resetServiceForm(initServiceForm);
                  } catch (error: any) {
                    notyf.error(error?.response?.data);
                    setIsApiLoading(false);
                    console.log(error);
                  }
                })}
              >
                {formServiceMode == 'create' ? 'บันทึกข้อมูล' : 'แก้ไขข้อมูล'}
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  const formTaxInvoiceModal = () => {
    return (
      <Modal
        size="4xl"
        scrollBehavior="inside"
        isOpen={isOpenTaxInvoiceModal}
        isDismissable={false}
        onClose={() => {
          resetTaxInvoiceForm(initTaxInvoiceForm);
          onCloseTaxInvoiceModal();
        }}
      >
        <ModalContent>
          <ModalHeader>
            {formTaxInvoiceMode == 'create'
              ? 'สร้างใบกำกับภาษี'
              : 'แก้ไขใบกำกับภาษี'}
          </ModalHeader>
          <ModalBody>
            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <Select
                variant="bordered"
                label="สถานะ"
                {...registerTaxInvoiceForm('status')}
              >
                <SelectItem key={'pending'}>ยังไม่ได้ส่งให้ลูกค้า</SelectItem>
                <SelectItem key={'complete'}>ส่งให้ลูกค้าแล้ว</SelectItem>
              </Select>
              <Controller
                control={controlTaxInvoiceForm}
                name="pendingDate"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    showMonthAndYearPickers
                    variant="bordered"
                    label="วันที่สร้างใบกำกับภาษี"
                    isRequired
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                  />
                )}
              />
              <Controller
                control={controlTaxInvoiceForm}
                name="completeDate"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    showMonthAndYearPickers
                    variant="bordered"
                    label="วันที่ส่งให้ลูกค้า"
                    isRequired
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
                {...registerTaxInvoiceForm('remark')}
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
                onClick={handleSubmitTaxInvoiceForm(async (data) => {
                  try {
                    setIsApiLoading(true);
                    const paperResponse =
                      formTaxInvoiceMode == 'create'
                        ? await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/service/taxInvoice`,
                            {
                              ...data,
                              companyId: session?.company?.id,
                              pendingDate: convertDateJsonToDbSingle(
                                data?.pendingDate
                              ),
                              completeDate: convertDateJsonToDbSingle(
                                data?.completeDate
                              ),
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/service/taxInvoice/${data?.taxInvoiceId}`,
                            {
                              ...data,
                              pendingDate: convertDateJsonToDbSingle(
                                data?.pendingDate
                              ),
                              completeDate: convertDateJsonToDbSingle(
                                data?.completeDate
                              ),
                            }
                          );
                    await mutate(
                      `/api/project?page=${pagination?.pageIndex}&type=projects&perPage=${pagination?.pageItem}&companyId=${session?.company?.id}&status=${status}`
                    );
                    notyf.success(paperResponse?.data?.message);
                    setIsApiLoading(false);
                    onCloseTaxInvoiceModal();
                    resetTaxInvoiceForm(initTaxInvoiceForm);
                  } catch (error: any) {
                    notyf.error(error?.response?.data);
                    setIsApiLoading(false);
                    console.log(error);
                  }
                })}
              >
                {formTaxInvoiceMode == 'create'
                  ? 'บันทึกข้อมูล'
                  : 'แก้ไขข้อมูล'}
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  const formReceiptModal = () => {
    return (
      <Modal
        size="4xl"
        scrollBehavior="inside"
        isOpen={isOpenReceiptModal}
        isDismissable={false}
        onClose={() => {
          resetReceiptForm(initReceiptForm);
          onCloseReceiptModal();
        }}
      >
        <ModalContent>
          <ModalHeader>
            {formReceiptMode == 'create'
              ? 'สร้างใบเสร็จรับเงิน'
              : 'แก้ไขใบเสร็จรับเงิน'}
          </ModalHeader>
          <ModalBody>
            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <Select
                variant="bordered"
                label="สถานะ"
                {...registerReceiptForm('status')}
              >
                <SelectItem key={'pending'}>ยังไม่ได้ส่งให้ลูกค้า</SelectItem>
                <SelectItem key={'complete'}>ส่งให้ลูกค้าแล้ว</SelectItem>
              </Select>
              <Controller
                control={controlReceiptForm}
                name="pendingDate"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    showMonthAndYearPickers
                    variant="bordered"
                    label="วันที่สร้างใบเสร็จรับเงิน"
                    isRequired
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                  />
                )}
              />
              <Controller
                control={controlReceiptForm}
                name="completeDate"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    showMonthAndYearPickers
                    variant="bordered"
                    label="วันที่ส่งให้ลูกค้า"
                    isRequired
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
                {...registerReceiptForm('remark')}
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
                onClick={handleSubmitReceiptForm(async (data) => {
                  try {
                    setIsApiLoading(true);
                    const paperResponse =
                      formReceiptMode == 'create'
                        ? await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/service/receipt`,
                            {
                              ...data,
                              companyId: session?.company?.id,
                              pendingDate: convertDateJsonToDbSingle(
                                data?.pendingDate
                              ),
                              completeDate: convertDateJsonToDbSingle(
                                data?.completeDate
                              ),
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/service/receipt/${data?.receiptId}`,
                            {
                              ...data,
                              pendingDate: convertDateJsonToDbSingle(
                                data?.pendingDate
                              ),
                              completeDate: convertDateJsonToDbSingle(
                                data?.completeDate
                              ),
                            }
                          );
                    await mutate(
                      `/api/project?page=${pagination?.pageIndex}&type=projects&perPage=${pagination?.pageItem}&companyId=${session?.company?.id}&status=${status}`
                    );
                    notyf.success(paperResponse?.data?.message);
                    setIsApiLoading(false);
                    onCloseReceiptModal();
                    resetReceiptForm(initReceiptForm);
                  } catch (error: any) {
                    notyf.error(error?.response?.data);
                    setIsApiLoading(false);
                    console.log(error);
                  }
                })}
              >
                {formReceiptMode == 'create' ? 'บันทึกข้อมูล' : 'แก้ไขข้อมูล'}
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  const {
    isOpen: isOpenGuaranteeModal,
    onOpen: onOpenGuaranteeModal,
    onClose: onCloseGuaranteeModal,
  } = useDisclosure();

  const formGuaranteeModal = () => {
    return (
      <Modal
        size="4xl"
        scrollBehavior="inside"
        isOpen={isOpenGuaranteeModal}
        isDismissable={false}
        onClose={() => {
          resetGuaranteeForm(initGuaranteeForm);
          onCloseGuaranteeModal();
        }}
      >
        <ModalContent>
          <ModalHeader>
            {formGuaranteeMode == 'create'
              ? 'สร้างใบเสร็จค้ำประกัน'
              : 'แก้ไขใบเสร็จค้ำประกัน'}
          </ModalHeader>
          <ModalBody>
            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <Input
                variant="bordered"
                label="เล่มที่"
                {...registerGuaranteeForm('guaranteeSlipNo', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsGuaranteeForm.guaranteeSlipNo}
                errorMessage={`${errorsGuaranteeForm.guaranteeSlipNo?.message}`}
              />

              <Input
                variant="bordered"
                label="เลขที่ใบเสร็จ"
                {...registerGuaranteeForm('guaranteeSlipNumber', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsGuaranteeForm.guaranteeSlipNumber}
                errorMessage={`${errorsGuaranteeForm.guaranteeSlipNumber?.message}`}
              />

              <Controller
                control={controlGuaranteeForm}
                name="paidGuaranteeDate"
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
                    label="ลงวันที่"
                    isInvalid={!!error}
                    errorMessage={error?.message}
                    className="mb-2"
                    isRequired
                    value={value}
                    onChange={(range: any) => onChange(range)}
                  />
                )}
              />

              <Select
                variant="bordered"
                label={'สถานะรับใบเสร็จ'}
                {...registerGuaranteeForm('status', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsGuaranteeForm?.status}
                errorMessage={errorsGuaranteeForm?.status?.message}
              >
                <SelectItem key={'pending'}>ยังไม่ได้รับเอกสาร</SelectItem>
                <SelectItem key={'complete'}>รับเอกสารแล้ว</SelectItem>
              </Select>
            </form>
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-end gap-2 flex-wrap">
              <Button
                radius="full"
                className="bg-primary text-white"
                isLoading={isApiLoading}
                startContent={!isApiLoading && <CircleCheck />}
                onClick={handleSubmitGuaranteeForm(async (data) => {
                  try {
                    setIsApiLoading(true);
                    const paperResponse =
                      formGuaranteeMode == 'create'
                        ? await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/paper/guarantee`,
                            {
                              ...data,
                              paidGuaranteeDate: data?.paidGuaranteeDate
                                ? convertDateJsonToDbSingle(
                                    data?.paidGuaranteeDate
                                  )
                                : null,
                              companyId: session?.company?.id,
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/paper/guarantee/${guaranteeId}`,
                            {
                              ...data,
                              paidGuaranteeDate: data?.paidGuaranteeDate
                                ? convertDateJsonToDbSingle(
                                    data?.paidGuaranteeDate
                                  )
                                : null,
                            }
                          );
                    await mutate(
                      `/api/project?page=${pagination?.pageIndex}&type=projects&perPage=${pagination?.pageItem}&companyId=${session?.company?.id}&status=${status}`
                    );
                    notyf.success(paperResponse?.data?.message);
                    setIsApiLoading(false);
                    onCloseGuaranteeModal();
                    resetGuaranteeForm(initGuaranteeForm);
                    setFormGuaranteeMode('create');
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
    isOpen: isOpenStampModal,
    onOpen: onOpenStampModal,
    onClose: onCloseStampModal,
  } = useDisclosure();

  const formStampModal = () => {
    return (
      <Modal
        size="4xl"
        scrollBehavior="inside"
        isOpen={isOpenStampModal}
        isDismissable={false}
        onClose={() => {
          resetStampForm(initStampForm);
          onCloseStampModal();
        }}
      >
        <ModalContent>
          <ModalHeader>
            {formMode == 'create'
              ? 'สร้างใบเสร็จตีตราสารใหม่'
              : 'แก้ไขใบเสร็จตีตราสาร'}
          </ModalHeader>
          <ModalBody>
            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <Controller
                control={controlStampForm}
                name="stampDate"
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
                    label="วันที่ตีตราสาร"
                    className="mb-2"
                    isInvalid={!!error}
                    errorMessage={error?.message}
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                  />
                )}
              />

              <Controller
                control={controlStampForm}
                name="reciveDate"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    showMonthAndYearPickers
                    variant="bordered"
                    label="วันที่ได้รับใบเสร็จ"
                    className="mb-2"
                    isRequired
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                  />
                )}
              />

              <Input
                variant="bordered"
                label="เงินค่าตราสาร"
                {...registerStampForm('stampAmount', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsStampForm.stampAmount}
                errorMessage={`${errorsStampForm.stampAmount?.message}`}
              />

              <Select
                variant="bordered"
                label={'สถานะรับใบเสร็จ'}
                {...registerStampForm('status', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsStampForm?.status}
                errorMessage={errorsStampForm?.status?.message}
              >
                <SelectItem key={'pending'}>ยังไม่ได้รับเอกสาร</SelectItem>
                <SelectItem key={'complete'}>รับเอกสารแล้ว</SelectItem>
              </Select>
            </form>
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-end gap-2 flex-wrap">
              <Button
                radius="full"
                className="bg-primary text-white"
                isLoading={isApiLoading}
                startContent={!isApiLoading && <CircleCheck />}
                onClick={handleSubmitStampForm(async (data) => {
                  try {
                    setIsApiLoading(true);
                    const paperResponse =
                      formStampMode == 'create'
                        ? await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/paper/stamp`,
                            {
                              ...data,
                              reciveDate: data?.reciveDate
                                ? convertDateJsonToDbSingle(data?.reciveDate)
                                : null,
                              stampDate: data?.stampDate
                                ? convertDateJsonToDbSingle(data?.stampDate)
                                : null,
                              companyId: session?.company?.id,
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/paper/stamp/${stampId}`,
                            {
                              ...data,
                              reciveDate: data?.reciveDate
                                ? convertDateJsonToDbSingle(data?.reciveDate)
                                : null,
                              stampDate: data?.stampDate
                                ? convertDateJsonToDbSingle(data?.stampDate)
                                : null,
                            }
                          );
                    await mutate(
                      `/api/project?page=${pagination?.pageIndex}&type=projects&perPage=${pagination?.pageItem}&companyId=${session?.company?.id}&status=${status}`
                    );
                    notyf.success(paperResponse?.data?.message);
                    setIsApiLoading(false);
                    onCloseStampModal();
                    resetStampForm(initStampForm);
                    setFormStampMode('create');
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
        header: 'รหัสประจำตัวโครงการ',
      },
      {
        accessorKey: 'status',
        header: 'สถานะโครงการ',
        Cell: ({ cell }: any) => {
          const status = cell.getValue() || null;

          return status == 'pending' ? (
            <Chip color="warning" variant="flat" startContent={<Clock />}>
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
          return row?.service?.taxInvoice?.status
            ? row?.service?.taxInvoice?.status
            : null;
        },
        header: 'สถานะใบกำกับภาษี',
        Cell: ({ cell }: any) => {
          const status = cell.getValue();
          return status == 'pending' ? (
            <Chip variant="flat" color="warning" startContent={<Clock />}>
              ยังไม่ได้ส่งให้ลูกค้า
            </Chip>
          ) : status == 'complete' ? (
            <Chip color="success" variant="flat" startContent={<CircleCheck />}>
              ส่งให้ลูกค้าแล้ว
            </Chip>
          ) : (
            <Chip variant="flat" color="danger" startContent={<CircleAlert />}>
              ยังไม่ได้ดำเนินการ
            </Chip>
          );
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.service?.receipt?.status
            ? row?.service?.receipt?.status
            : null;
        },
        header: 'สถานะใบเสร็จรับเงิน',
        size: 250,
        Cell: ({ cell }: any) => {
          const status = cell.getValue();
          return status == 'pending' ? (
            <Chip variant="flat" color="warning" startContent={<Clock />}>
              ยังไม่ได้ส่งให้ลูกค้า
            </Chip>
          ) : status == 'complete' ? (
            <Chip color="success" variant="flat" startContent={<CircleCheck />}>
              ส่งให้ลูกค้าแล้ว
            </Chip>
          ) : (
            <Chip variant="flat" color="danger" startContent={<CircleAlert />}>
              ยังไม่ได้ดำเนินการ
            </Chip>
          );
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.guarantee?.status ? row?.guarantee?.status : null;
        },
        header: 'สถานะใบเสร็จค้ำประกัน',
        size: 250,
        Cell: ({ cell }: any) => {
          const status = cell.getValue();
          return status == 'pending' ? (
            <Chip variant="flat" startContent={<Clock />} color="warning">
              ยังไม่ได้รับเอกสาร
            </Chip>
          ) : status == 'complete' ? (
            <Chip color="success" variant="flat" startContent={<CircleCheck />}>
              รับเอกสารแล้ว
            </Chip>
          ) : (
            <Chip variant="flat" color="danger" startContent={<CircleAlert />}>
              ยังไม่ได้ดำเนินการ
            </Chip>
          );
        },
      },
      {
        header: 'สถานะใบเสร็จตีตราสาร',
        accessorFn: (row: any) => {
          return row?.stamp?.status ? row?.stamp?.status : null;
        },
        size: 250,
        Cell: ({ cell }: any) => {
          const status = cell.getValue();
          return status == 'pending' ? (
            <Chip variant="flat" color="warning" startContent={<Clock />}>
              ยังไม่ได้รับเอกสาร
            </Chip>
          ) : status == 'complete' ? (
            <Chip color="success" variant="flat" startContent={<CircleCheck />}>
              รับเอกสารแล้ว
            </Chip>
          ) : (
            <Chip variant="flat" color="danger" startContent={<CircleAlert />}>
              ยังไม่ได้ดำเนินการ
            </Chip>
          );
        },
      },
      {
        accessorKey: 'name',
        header: 'โครงการ',
        size: 450,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'no',
        header: 'เลขที่โครงการ',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'contractNo',
        header: 'เลขที่สัญญา',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'organization',
        header: 'หน่วยงาน',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'contractAmount',
        muiTableBodyCellProps: {
          sx: { textAlign: 'right' },
        },
        header: 'จำนวนเงินตามสัญญา',
        Cell: ({ cell }: any) => formatAmount(cell.getValue()),
      },
      {
        accessorKey: 'guaranteeAmount',
        header: 'จำนวนเงินค้ำประกัน',
        muiTableBodyCellProps: {
          sx: { textAlign: 'right' },
        },
        Cell: ({ cell }: any) => formatAmount(cell.getValue()),
      },
      {
        accessorKey: 'contractDate',
        header: 'วันที่ทำสัญญา',
        Cell: ({ cell }: any) => formatThaiDate(cell.getValue()),
      },
      {
        accessorKey: 'contractEndDate',
        header: 'วันที่สิ้นสุดสัญญา',
        Cell: ({ cell }: any) => formatThaiDate(cell.getValue()),
      },
      {
        accessorKey: 'fineRate',
        size: 250,
        header: 'อัตราค่าปรับ (บาท/วัน)',
        Cell: ({ cell }: any) => formatAmount(cell.getValue()),
      },
      {
        accessorKey: 'guaranteeStatus',
        header: 'สถานะหลักประกัน',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'guaranteeNumber',
        header: 'เลขที่ค้ำประกัน',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorFn: (row: any) => {
          return row.guaranteeNumber ? formatThaiDate(row.contractDate) : '-';
        },
        header: 'วันที่ออกค้ำประกัน',
      },
      {
        accessorKey: 'guaranteeEndDate',
        size: 250,
        header: 'วันที่สิ้นสุดค้ำประกัน',
        Cell: ({ cell }: any) => formatThaiDate(cell.getValue()),
      },
      {
        accessorKey: 'bankName',
        header: guaranteeHeader,
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
    [guaranteeHeader]
  );

  const table = useMaterialReactTable({
    columns,
    enablePagination: false,
    enableBottomToolbar: false,
    enableRowSelection: true,
    data: !isSearch ? (projects?.data ? projects?.data : []) : searchData,
    enableGlobalFilter: true,
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableGrouping: true,
    enableColumnPinning: true,
    enableFacetedValues: true,
    enableRowActions: true,
    initialState: {
      showGlobalFilter: true,
      columnVisibility: {
        id: false,
      },
      columnPinning: {
        left: ['mrt-row-expand', 'mrt-row-select', 'name'],
        right: ['mrt-row-actions'],
      },
    },
    paginationDisplayMode: 'custom',
    renderDetailPanel: ({ row }) => {
      return (
        <div className="felx flex-col gap-2.5 w-fit">
          {!row?.original?.customer && (
            <Alert
              color="danger"
              description={
                'ขณะนี้โครงการยังไม่มีข้อมูลของลูกค้า หากไม่ดำเนินการเพิ่มข้อมูลในส่วนนี้ จะทำให้ไม่มีข้อมูลลูกค้าในใบกำกับภาษีและใบเสร็จรับเงิน'
              }
              title={'แจ้งเตือน'}
            />
          )}

          <div className="flex flex-wrap gap-2.5 mb-5 mt-2.5">
            <Button
              radius="full"
              onClick={() => {
                setValueInventoryForm('projectId', row?.original?.id);
                onOpenInventoryModal();
              }}
              variant="bordered"
            >
              เบิกสินค้า/คืนสินค้า
            </Button>
            <Dropdown>
              <DropdownTrigger>
                <Button radius="full" variant="bordered">
                  ใบเหมาบริการ
                </Button>
              </DropdownTrigger>

              {row?.original?.serviceId ? (
                <DropdownMenu aria-label="Dynamic Actions">
                  <DropdownItem
                    onAction={async () => {
                      try {
                        setModalScreenLoading(true);
                        setFormServiceMode('update');
                        const { data } = await axios.get(
                          `${apiPath}/api/service/${row?.original?.serviceId}`
                        );
                        resetServiceForm({
                          ...data,
                          completeDate: data?.completeDate
                            ? parseDate(data?.completeDate)
                            : null,
                        });
                        setValueServiceForm('projectId', row?.original.id);
                        setValueServiceForm(
                          'serviceId',
                          row?.original?.serviceId
                        );
                        onOpenServiceModal();
                        setModalScreenLoading(false);
                      } catch (error: any) {
                        console.log(error);
                        notyf.error(error?.response?.data);
                      }
                    }}
                    key={'edit'}
                  >
                    แก้ไขข้อมูล
                  </DropdownItem>
                  <DropdownItem
                    className="text-danger-800"
                    onAction={async () => {
                      if (
                        window.confirm(
                          'คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้ออกจากระบบ?'
                        )
                      ) {
                        try {
                          setModalScreenLoading(true);
                          await axios.delete(
                            `${apiPath}/api/service/${row?.original?.serviceId}`
                          );
                          await mutate(
                            `/api/project?page=${pagination?.pageIndex}&type=projects&perPage=${pagination?.pageItem}&companyId=${session?.company?.id}&status=${status}`
                          );
                          setModalScreenLoading(false);
                        } catch (error: any) {
                          console.log(error);
                          notyf.error(error?.response?.data);
                        }
                      }
                    }}
                    key={'delete'}
                  >
                    ลบข้อมูล
                  </DropdownItem>
                </DropdownMenu>
              ) : (
                <DropdownMenu aria-label="Dynamic Actions">
                  <DropdownItem
                    onAction={async () => {
                      setFormServiceMode('create');
                      setValueServiceForm('projectId', row?.original.id);
                      onOpenServiceModal();
                    }}
                    key={'create'}
                  >
                    สร้างใบเหมาบริการ
                  </DropdownItem>
                </DropdownMenu>
              )}
            </Dropdown>

            <Dropdown>
              <DropdownTrigger>
                <Button radius="full" variant="bordered">
                  ใบเสร็จค้ำประกัน
                </Button>
              </DropdownTrigger>
              {!row?.original?.guaranteeId ? (
                <DropdownMenu aria-label="Dynamic Actions">
                  <DropdownItem
                    onAction={async () => {
                      setFormGuaranteeMode('create');
                      setValueGuaranteeForm('projectId', row?.original?.id);
                      onOpenGuaranteeModal();
                    }}
                    key={'create'}
                  >
                    สร้างใบเสร็จค้ำประกัน
                  </DropdownItem>
                </DropdownMenu>
              ) : (
                <DropdownMenu aria-label="Dynamic Actions">
                  <DropdownItem
                    onAction={async () => {
                      setFormGuaranteeMode('update');
                      setGuaranteeId(row?.original?.guaranteeId);

                      const { data } = await axios.get(
                        `${apiPath}/api/paper/guarantee/${row?.original?.guaranteeId}`
                      );
                      resetGuaranteeForm({
                        ...data,
                        reciveDate: data?.reciveDate
                          ? parseDate(data?.reciveDate)
                          : null,
                        paidGuaranteeDate: data?.paidGuaranteeDate
                          ? parseDate(data?.paidGuaranteeDate)
                          : null,
                      });
                      setValueGuaranteeForm('projectId', row?.original?.id);
                      onOpenGuaranteeModal();
                    }}
                    key={'edit'}
                  >
                    แก้ไขข้อมูล
                  </DropdownItem>
                  <DropdownItem
                    className="text-danger-800"
                    onAction={async () => {
                      if (
                        window.confirm(
                          'คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้ออกจากระบบ?'
                        )
                      ) {
                        try {
                          setModalScreenLoading(true);
                          await axios.delete(
                            `${apiPath}/api/paper/guarantee/${row?.original?.guaranteeId}`
                          );
                          await mutate(
                            `/api/project?page=${pagination?.pageIndex}&type=projects&perPage=${pagination?.pageItem}&companyId=${session?.company?.id}&status=${status}`
                          );
                          setModalScreenLoading(false);
                        } catch (error: any) {
                          console.log(error);
                          notyf.error(error?.response?.data);
                        }
                      }
                    }}
                    key={'delete'}
                  >
                    ลบข้อมูล
                  </DropdownItem>
                </DropdownMenu>
              )}
            </Dropdown>

            <Dropdown>
              <DropdownTrigger>
                <Button radius="full" variant="bordered">
                  ใบเสร็จตีตราสาร
                </Button>
              </DropdownTrigger>

              {!row?.original?.stampId ? (
                <DropdownMenu aria-label="Dynamic Actions">
                  <DropdownItem
                    onAction={async () => {
                      setFormServiceMode('create');
                      setValueStampForm('projectId', row?.original?.id);
                      onOpenStampModal();
                    }}
                    key={'create'}
                  >
                    สร้างใบเสร็จตีตราสาร
                  </DropdownItem>
                </DropdownMenu>
              ) : (
                <DropdownMenu aria-label="Dynamic Actions">
                  <DropdownItem
                    onAction={async () => {
                      setFormStampMode('update');
                      setStampId(row?.original?.stampId);

                      const { data } = await axios.get(
                        `${apiPath}/api/paper/stamp/${row?.original?.stampId}`
                      );
                      resetStampForm({
                        ...data,
                        reciveDate: data?.reciveDate
                          ? parseDate(data?.reciveDate)
                          : null,
                        stampDate: data?.stampDate
                          ? parseDate(data?.stampDate)
                          : null,
                      });
                      setValueStampForm('projectId', row?.original?.id);
                      onOpenStampModal();
                    }}
                    key={'edit'}
                  >
                    แก้ไขข้อมูล
                  </DropdownItem>
                  <DropdownItem
                    className="text-danger-800"
                    onAction={async () => {
                      if (
                        window.confirm(
                          'คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้ออกจากระบบ?'
                        )
                      ) {
                        try {
                          setModalScreenLoading(true);
                          await axios.delete(
                            `${apiPath}/api/paper/stamp/${row?.original?.stampId}`
                          );
                          await mutate(
                            `/api/project?page=${pagination?.pageIndex}&type=projects&perPage=${pagination?.pageItem}&companyId=${session?.company?.id}&status=${status}`
                          );
                          setModalScreenLoading(false);
                        } catch (error: any) {
                          console.log(error);
                          notyf.error(error?.response?.data);
                        }
                      }
                    }}
                    key={'delete'}
                  >
                    ลบข้อมูล
                  </DropdownItem>
                </DropdownMenu>
              )}
            </Dropdown>

            {row?.original?.serviceId && (
              <>
                <Dropdown>
                  <DropdownTrigger>
                    <Button radius="full" variant="bordered">
                      ใบกำกับภาษี
                    </Button>
                  </DropdownTrigger>
                  {row?.original?.service?.taxInvoice ? (
                    <DropdownMenu aria-label="Dynamic Actions">
                      <DropdownItem
                        onAction={async () => {
                          try {
                            setShowPdfRender(true);
                            setDocumentType('tax-invoice');

                            const { data } = await axios.get(
                              `${process.env.NEXT_PUBLIC_API_URL}/api/service?companyId=${session?.company?.id}&serviceId=${row?.original?.service?.id}&type=pdf`
                            );

                            setPdfData(data);
                            await printPdf();
                          } catch (error) {
                            console.log(error);
                          }
                        }}
                        key={'pdf'}
                      >
                        ดาว์นโหลด .PDF
                      </DropdownItem>
                      <DropdownItem
                        onAction={async () => {
                          if (row?.original?.service?.taxInvoice) {
                            setModalScreenLoading(true);
                            setFormTaxInvoiceMode('update');

                            const { data } = await axios.get(
                              `${process.env.NEXT_PUBLIC_API_URL}/api/service/taxInvoice/${row?.original?.service?.taxInvoice?.id}`
                            );

                            resetTaxInvoiceForm({
                              ...data,
                              taxInvoiceId: data?.id,
                              pendingDate: data?.pendingDate
                                ? parseDate(data?.pendingDate)
                                : null,
                              completeDate: data?.completeDate
                                ? parseDate(data?.completeDate)
                                : null,
                            });
                            setModalScreenLoading(false);
                            onOpenTaxInvoiceModal();
                          }
                        }}
                        key={'edit'}
                      >
                        แก้ไขข้อมูล
                      </DropdownItem>
                      <DropdownItem
                        className="text-danger-800"
                        onAction={async () => {
                          if (
                            window.confirm(
                              'คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้ออกจากระบบ?'
                            )
                          ) {
                            try {
                              setModalScreenLoading(true);
                              await axios.delete(
                                `${apiPath}/api/service/taxInvoice/${row?.original?.service?.taxInvoice?.id}`
                              );
                              await mutate(
                                `/api/project?page=${pagination?.pageIndex}&type=projects&perPage=${pagination?.pageItem}&companyId=${session?.company?.id}&status=${status}`
                              );
                              setModalScreenLoading(false);
                            } catch (error: any) {
                              console.log(error);
                              notyf.error(error?.response?.data);
                            }
                          }
                        }}
                        key={'delete'}
                      >
                        ลบข้อมูล
                      </DropdownItem>
                    </DropdownMenu>
                  ) : (
                    <DropdownMenu aria-label="Dynamic Actions">
                      <DropdownItem
                        onAction={async () => {
                          setFormTaxInvoiceMode('create');
                          setValueInvoiceForm(
                            'serviceId',
                            row?.original?.service?.id
                          );
                          onOpenTaxInvoiceModal();
                        }}
                        key={'create'}
                      >
                        สร้างใบกำกับภาษี
                      </DropdownItem>
                    </DropdownMenu>
                  )}
                </Dropdown>
                <Dropdown>
                  <DropdownTrigger>
                    <Button radius="full" variant="bordered">
                      ใบเสร็จรับเงิน
                    </Button>
                  </DropdownTrigger>
                  {row?.original?.service?.receipt ? (
                    <DropdownMenu aria-label="Dynamic Actions">
                      <DropdownItem
                        onAction={async () => {
                          try {
                            setShowPdfRender(true);
                            setDocumentType('receipt');

                            const { data } = await axios.get(
                              `${process.env.NEXT_PUBLIC_API_URL}/api/service?companyId=${session?.company?.id}&serviceId=${row?.original?.service?.id}&type=pdf`
                            );

                            setPdfData(data);
                            await printPdf();
                          } catch (error) {
                            console.log(error);
                          }
                        }}
                        key={'pdf'}
                      >
                        ดาว์นโหลด .PDF
                      </DropdownItem>
                      <DropdownItem
                        onAction={async () => {
                          if (row?.original?.service?.receipt?.id) {
                            setModalScreenLoading(true);
                            setFormReceiptMode('update');

                            const { data } = await axios.get(
                              `${process.env.NEXT_PUBLIC_API_URL}/api/service/receipt/${row?.original?.service?.receipt?.id}`
                            );

                            resetReceiptForm({
                              ...data,
                              receiptId: data?.id,
                              pendingDate: data?.pendingDate
                                ? parseDate(data?.pendingDate)
                                : null,
                              completeDate: data?.completeDate
                                ? parseDate(data?.completeDate)
                                : null,
                            });
                            setModalScreenLoading(false);
                            onOpenReceiptModal();
                          }
                        }}
                        key={'edit'}
                      >
                        แก้ไขข้อมูล
                      </DropdownItem>
                      <DropdownItem
                        className="text-danger-800"
                        onAction={async () => {
                          if (
                            window.confirm(
                              'คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้ออกจากระบบ?'
                            )
                          ) {
                            try {
                              setModalScreenLoading(true);
                              await axios.delete(
                                `${apiPath}/api/service/receipt/${row?.original?.service?.receipt?.id}`
                              );
                              await mutate(
                                `/api/project?page=${pagination?.pageIndex}&type=projects&perPage=${pagination?.pageItem}&companyId=${session?.company?.id}&status=${status}`
                              );
                              setModalScreenLoading(false);
                            } catch (error: any) {
                              console.log(error);
                              notyf.error(error?.response?.data);
                            }
                          }
                        }}
                        key={'delete'}
                      >
                        ลบข้อมูล
                      </DropdownItem>
                    </DropdownMenu>
                  ) : (
                    <DropdownMenu aria-label="Dynamic Actions">
                      <DropdownItem
                        onAction={async () => {
                          setFormReceiptMode('create');
                          setValueReceiptForm(
                            'serviceId',
                            row?.original?.service?.id
                          );
                          onOpenReceiptModal();
                        }}
                        key={'create'}
                      >
                        สร้างใบเสร็จรับเงิน
                      </DropdownItem>
                    </DropdownMenu>
                  )}
                </Dropdown>
              </>
            )}
          </div>

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
              `${process.env.NEXT_PUBLIC_API_URL}/api/project/${id}`
            );

            resetProjectModal({
              ...data,
              contractDate: data?.contractDate
                ? parseDate(data?.contractDate)
                : null,
              contractEndDate: data?.contractEndDate
                ? parseDate(data?.contractEndDate)
                : null,
              guaranteeEndDate: data?.guaranteeEndDate
                ? parseDate(data?.guaranteeEndDate)
                : null,
            });
            onOpenProjectModal();
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
                `${process.env.NEXT_PUBLIC_API_URL}/api/project/${id}`
              );
              await mutate(
                `/api/project?page=${pagination?.pageIndex}&type=projects&perPage=${pagination?.pageItem}&companyId=${session?.company?.id}&status=${status}`
              );
              await mutate(`/api/project?type=dashboard`);
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
            label="กรองโครงการ"
            defaultSelectedKeys={[status]}
            onChange={async (e) => {
              setStatus(e.target.value);
            }}
            className="max-w-52 dark:text-white"
          >
            <SelectItem key={'all'}>สถานะทั้งหมด</SelectItem>
            <SelectItem key={'pending'}>กำลังดำเนินการ</SelectItem>
            <SelectItem key={'complete'}>ดำเนินการเสร็จแล้ว</SelectItem>
          </Select>

          <Button
            radius="full"
            startContent={<PlusIcon />}
            onClick={() => {
              setIsSearch(false);
              resetSearchForm({
                databaseSearch: '',
                projectDateRange: {
                  start: null,
                  end: null,
                },
              });
              setFormMode('create');
              resetProjectModal({
                contractDate: parseDate(new Date().toISOString().split('T')[0]),
              });
              onOpenProjectModal();
            }}
            className="bg-primary text-white"
          >
            เพิ่มโครงการใหม่
          </Button>

          <Button
            radius="full"
            startContent={<Settings className="opacity-50" />}
            onClick={() => {
              onOpenCustomerModal();
            }}
            variant="bordered"
          >
            จัดการลูกค้า
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/project/${id}`
                          );
                        })
                      );
                    }

                    await mutate(
                      `/api/project?page=${pagination?.pageIndex}&type=projects&perPage=${pagination?.pageItem}&companyId=${session?.company?.id}&status=${status}`
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

  const ProjectModal = () => {
    return (
      <Modal
        size="4xl"
        scrollBehavior="inside"
        isDismissable={false}
        isOpen={isOpenProjectModal}
        onClose={() => {
          onCloseProjectModal();
          resetProjectModal(resetProjectForm);
        }}
      >
        <ModalContent>
          <ModalHeader>
            {formMode == 'create' ? 'เพิ่มโครงการใหม่' : 'แก้ไขโครงการ'}
          </ModalHeader>
          <ModalBody>
            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <Input
                label="โครงการ"
                variant="bordered"
                {...registerProjectModal('name', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsProjectModal.name}
                errorMessage={`${errorsProjectModal.name?.message}`}
              />
              <Select
                variant="bordered"
                {...registerProjectModal('customerId', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsProjectModal?.customerId}
                errorMessage={`${errorsProjectModal?.customerId?.message}`}
                label="ลูกค้า"
              >
                {customerDropdown &&
                  customerDropdown?.map((item: any) => {
                    return <SelectItem key={item?.id}>{item?.name}</SelectItem>;
                  })}
              </Select>
              <Input
                variant="bordered"
                label="เลขที่โครงการ"
                {...registerProjectModal('no', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsProjectModal.no}
                errorMessage={`${errorsProjectModal.no?.message}`}
              />
              <Input
                variant="bordered"
                label="เลขที่สัญญา"
                {...registerProjectModal('contractNo', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsProjectModal.contractNo}
                errorMessage={`${errorsProjectModal.contractNo?.message}`}
              />
              <Input
                variant="bordered"
                label="หน่วยงาน"
                {...registerProjectModal('organization', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsProjectModal.organization}
                errorMessage={`${errorsProjectModal.organization?.message}`}
              />
              <Input
                variant="bordered"
                label="จำนวนเงินตามสัญญา (บาท)"
                type="number"
                {...registerProjectModal('contractAmount', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsProjectModal.contractAmount}
                errorMessage={`${errorsProjectModal.contractAmount?.message}`}
              />
              <Controller
                control={controlProjectModal}
                name="contractDate"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    showMonthAndYearPickers
                    variant="bordered"
                    label="วันที่ทำสัญญา"
                    isRequired
                    className="mb-2"
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                  />
                )}
              />
              <Controller
                control={controlProjectModal}
                name="contractEndDate"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    showMonthAndYearPickers
                    variant="bordered"
                    label="วันที่สิ้นสุดสัญญา"
                    className="mb-2"
                    isRequired
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                  />
                )}
              />
              <Input
                variant="bordered"
                label="จำนวนเงินค้ำประกัน (บาท)"
                type="number"
                {...registerProjectModal('guaranteeAmount', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsProjectModal.guaranteeAmount}
                errorMessage={`${errorsProjectModal.guaranteeAmount?.message}`}
              />
              <Input
                variant="bordered"
                label="สถานะหลักประกัน"
                {...registerProjectModal('guaranteeStatus', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsProjectModal.guaranteeStatus}
                errorMessage={`${errorsProjectModal.guaranteeStatus?.message}`}
              />
              <Input
                variant="bordered"
                label="เลขที่ค้ำประกัน"
                {...registerProjectModal('guaranteeNumber')}
                isInvalid={!!errorsProjectModal.guaranteeNumber}
                errorMessage={`${errorsProjectModal.guaranteeNumber?.message}`}
              />
              <Select
                variant="bordered"
                label={guaranteeHeader}
                {...registerProjectModal('bankName')}
              >
                <SelectItem key={'ธนาคารกสิกรไทย จำกัด (มหาชน)'}>
                  ธนาคารกสิกรไทย จำกัด (มหาชน)
                </SelectItem>
                <SelectItem key={'เงินสด'}>เงินสด</SelectItem>
              </Select>
              <Controller
                control={controlProjectModal}
                name="guaranteeEndDate"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    showMonthAndYearPickers
                    variant="bordered"
                    label="วันที่สิ้นสุดค้ำประกัน"
                    className="mb-2"
                    isRequired
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                  />
                )}
              />
              <Input
                variant="bordered"
                type="number"
                label="อัตราค่าปรับ (บาท)"
                {...registerProjectModal('fineRate')}
                isInvalid={!!errorsProjectModal.fineRate}
                errorMessage={`${errorsProjectModal.fineRate?.message}`}
              />
            </form>
          </ModalBody>
          <ModalFooter>
            {/* <Button
              radius="full"
              startContent={<Settings className="opacity-50" />}
              onClick={() => {
                onOpenCustomerModal();
              }}
              variant="bordered"
            >
              จัดการลูกค้า
            </Button> */}
            <Button
              radius="full"
              isLoading={apiLoading}
              startContent={!apiLoading && <CircleCheck />}
              className="bg-primary text-white"
              onClick={handleSubmitProjectModal(async (data) => {
                try {
                  setApiLoading(true);
                  const createProjectResponse =
                    formMode == 'create'
                      ? await axios.post(
                          `${process.env.NEXT_PUBLIC_API_URL}/api/project`,
                          {
                            ...data,
                            contractDate: convertDateJsonToDbSingle(
                              data?.contractDate
                            ),
                            contractEndDate: convertDateJsonToDbSingle(
                              data?.contractEndDate
                            ),
                            guaranteeEndDate: convertDateJsonToDbSingle(
                              data?.guaranteeEndDate
                            ),
                            companyId: session?.company?.id,
                          }
                        )
                      : await axios.put(
                          `${process.env.NEXT_PUBLIC_API_URL}/api/project/${projectSelectId}`,
                          {
                            ...data,
                            contractDate: convertDateJsonToDbSingle(
                              data?.contractDate
                            ),
                            contractEndDate: convertDateJsonToDbSingle(
                              data?.contractEndDate
                            ),
                            guaranteeEndDate: convertDateJsonToDbSingle(
                              data?.guaranteeEndDate
                            ),
                          }
                        );

                  if (!isSearch) {
                    await mutate(
                      `/api/project?page=${pagination?.pageIndex}&type=projects&perPage=${pagination?.pageItem}&companyId=${session?.company?.id}&status=${status}`
                    );
                    await mutate(
                      `/api/project?type=dashboard&companyId=${session?.company?.id}`
                    );
                  } else {
                    const { dateStart, dateEnd } = convertDateJsonToDbRange(
                      getValuesSearchForm('projectDateRange')
                    );

                    const responseProject = await axios.get(
                      `/api/project?page=${pagination?.pageIndex}&type=projects&perPage=${pagination?.pageItem}&databaseSearch=${getValuesSearchForm('databaseSearch') || ''}&dateStart=${dateStart}&dateEnd=${dateEnd}&companyId=${session?.company?.id}`
                    );

                    const responseDashboard = await axios.get(
                      `/api/project?type=dashboard&databaseSearch=${getValuesSearchForm('databaseSearch') || ''}&dateStart=${dateStart}&dateEnd=${dateEnd}&companyId=${session?.company?.id}`
                    );

                    setSearchData(responseProject?.data?.data);
                    setSearchDataDashboard(responseDashboard?.data);
                  }

                  notyf.success(createProjectResponse?.data?.message);
                  setApiLoading(false);
                  onCloseProjectModal();
                  resetProjectModal(resetProjectForm);
                } catch (error: any) {
                  console.error(error);
                  setApiLoading(false);
                  notyf.error(error?.response?.data);
                }
              })}
            >
              บันทึกข้อมูล
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  return (
    <Layout sitename={'บริหารโครงการ'}>
      {ProjectModal()}
      {modalScreenLoading && PageLoading()}
      {formServiceModal()}
      {formTaxInvoiceModal()}
      {formReceiptModal()}
      {pdfRender()}
      {formCustomerModal()}
      {formGuaranteeModal()}
      {formStampModal()}
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
          <BreadcrumbItem>โครงการจัดซื้อจัดจ้าง</BreadcrumbItem>
          <BreadcrumbItem>บริหารโครงการ</BreadcrumbItem>
        </Breadcrumbs>

        <HeaderTitle
          title="บริหารโครงการ"
          control={
            <div className="xl:w-[80%] w-full flex flex-wrap gap-2.5 items-center justify-end">
              <Input
                variant="bordered"
                endContent={<Search />}
                className="xl:max-w-96"
                label="ค้นหาโครงการ, หน่วยงาน, เงินตามสัญญา, เลขที่สัญญา"
                {...registerSearchForm('databaseSearch')}
              />
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
                    `/api/project?page=${pagination?.pageIndex}&type=projects&perPage=${e.target.value}&companyId=${session?.company?.id}`
                  );
                }}
                className="w-full xl:max-w-32"
              >
                <SelectItem key={'20'}>20 รายการ</SelectItem>
                <SelectItem key={'50'}>50 รายการ</SelectItem>
                <SelectItem key={'100'}>100 รายการ</SelectItem>
              </Select>
              <Controller
                control={controlSearchForm}
                name="projectDateRange"
                render={({ field: { value, onChange } }) => (
                  <DateRangePicker
                    variant="bordered"
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                    className="xl:max-w-72"
                    label="ช่วงข้อมูล (ถ้ามี)"
                    visibleMonths={2}
                  />
                )}
              />
              <Button
                radius="full"
                startContent={<SearchIcon />}
                className="bg-primary text-white"
                onClick={handleSubmitSearchForm(async (data) => {
                  try {
                    setModalScreenLoading(true);
                    const { dateStart, dateEnd } = convertDateJsonToDbRange(
                      data?.projectDateRange
                    );

                    const responseProject = await axios.get(
                      `/api/project?page=${pagination?.pageIndex}&type=projects&perPage=${pagination?.pageItem}&databaseSearch=${data.databaseSearch || ''}&dateStart=${dateStart}&dateEnd=${dateEnd}&companyId=${session?.company?.id}&status=${status}`
                    );

                    const responseDashboard = await axios.get(
                      `/api/project?type=dashboard&databaseSearch=${data.databaseSearch || ''}&dateStart=${dateStart}&dateEnd=${dateEnd}&companyId=${session?.company?.id}`
                    );

                    setSearchData(responseProject?.data?.data);
                    setSearchDataDashboard(responseDashboard?.data);
                    setIsSearch(true);
                    setModalScreenLoading(false);
                  } catch (error) {
                    setIsSearch(false);
                    setModalScreenLoading(false);
                    console.error(error);
                  }
                })}
              >
                ค้นหา
              </Button>
              {isSearch && (
                <Button
                  radius="full"
                  startContent={<XIcon />}
                  variant="bordered"
                  className="border-primary text-primary"
                  onClick={async () => {
                    try {
                      setModalScreenLoading(true);
                      await mutate(
                        `/api/project?page=${pagination?.pageIndex}&type=projects&perPage=${pagination?.pageItem}&companyId=${session?.company?.id}&status=${status}`
                      );
                      await mutate(
                        `/api/project?type=dashboard&companyId=${session?.company?.id}`
                      );
                      setIsSearch(false);
                      resetSearchForm({
                        databaseSearch: '',
                        projectDateRange: {
                          start: null,
                          end: null,
                        },
                      });
                      setModalScreenLoading(false);
                    } catch (error) {
                      setModalScreenLoading(false);
                      console.log(error);
                    }
                  }}
                >
                  ล้างผลการค้นหา
                </Button>
              )}
            </div>
          }
        />

        {!isSearch ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            <CardSummary
              label={'ทั้งหมด'}
              suffix="โครงการ"
              value={projectDashboard?.projectCount}
            />
            <CardSummary
              label={'กำลังดำเนินการ'}
              suffix="โครงการ"
              value={projectNewDashboard?.projectPendingCount}
            />
            <CardSummary
              label={'เสร็จสิ้นแล้ว'}
              suffix="โครงการ"
              value={projectNewDashboard?.projectSuccessCount}
            />
            <CardSummary
              label={'ความคืบหน้า'}
              suffix="%"
              value={projectNewDashboard?.successPercentage}
            />
            <CardSummary
              label={'เงินตามสัญญา'}
              suffix="บาท"
              value={projectDashboard?.totalContractAmount}
              isMoney
            />
            <CardSummary
              label={'เงินค้ำประกัน'}
              isMoney
              suffix="บาท"
              value={projectDashboard?.totalGuaranteeAmount}
            />
            <CardSummary
              label={'หนังสือค้ำประกัน'}
              value={projectDashboard?.guaranteeCount}
              suffix={'ฉบับ'}
            />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            <CardSummary
              label={'ทั้งหมด'}
              suffix="โครงการ"
              value={searchDataDashboard?.projectCount}
            />
            <CardSummary
              label={'กำลังดำเนินการ'}
              suffix="โครงการ"
              value={projectNewDashboard?.projectPendingCount}
            />
            <CardSummary
              label={'เสร็จสิ้นแล้ว'}
              suffix="โครงการ"
              value={projectNewDashboard?.projectSuccessCount}
            />
            <CardSummary
              label={'ความคืบหน้า'}
              suffix="%"
              value={projectNewDashboard?.successPercentage}
            />
            <CardSummary
              label={'เงินตามสัญญา'}
              suffix="บาท"
              value={searchDataDashboard?.totalContractAmount}
              isMoney
            />
            <CardSummary
              label={'เงินค้ำประกัน'}
              isMoney
              suffix="บาท"
              value={searchDataDashboard?.totalGuaranteeAmount}
            />
            <CardSummary
              label={'หนังสือค้ำประกัน'}
              value={searchDataDashboard?.guaranteeCount}
              suffix={'ฉบับ'}
            />
          </div>
        )}

        <MaterialReactTable table={table} />

        <div className="flex justify-end">
          <Pagination
            showControls
            total={
              !isSearch ? (projects?.allPages ? projects?.allPages : 1) : 1
            }
            initialPage={1}
            onChange={async (e) => {
              if (!isSearch) {
                setPagination((old) => ({ ...old, pageIndex: e }));
              }
            }}
          />
        </div>
      </section>
    </Layout>
  );
}
