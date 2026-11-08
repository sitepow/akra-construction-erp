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
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
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
import { Notyf } from 'notyf';
import { useEffect, useMemo, useState, useRef } from 'react';
import { mdiFilterOffOutline, mdiFilterOutline } from '@mdi/js';
import useSWR, { mutate } from 'swr';
import Icon from '@mdi/react';
import { Controller, useForm } from 'react-hook-form';
import { fetcher, textCut } from '@/utils';
import PageLoading from '@/components/LoadingPage';
import { MenuItem } from '@mui/material';
import ThaiBahtText from 'thai-baht-text';
import { formatThaiDateTime, formatThaiFullDate } from '@/utils';
import {
  ArrowUpRight,
  CircleAlert,
  CircleCheck,
  CircleX,
  ClipboardIcon,
  Clock,
  PlusIcon,
  RefreshCcw,
  Search,
  Settings,
  Trash,
  XIcon,
} from 'lucide-react';
import CardSummary from '@/components/CardSummary';
import { formatAmount, convertDateJsonToDbSingle } from '@/utils';
import { parseDate } from '@internationalized/date';
import { errorRequire } from '@/utils/regex';
import { districtJsons } from '@/utils/address/districts';
import { proviceJsons } from '@/utils/address/provinces';
import { subDistrictJsons } from '@/utils/address/subDistricts';
import { zipcodeJsons } from '@/utils/address/zipcodes';
import { apiPath } from '@/utils';
import axios from 'axios';
const initForm = {
  customerId: '',
  quoId: '',
  no: '',
  paymentFromBankId: null,
  paymentToBankId: null,
  status: 'pending',
  remark: '',
  name: '',
  taxType: 'vat',
  vat: 0,
  paymentType: 'cash',
  pendingDate: parseDate(new Date().toISOString().split('T')[0]) as any,
  totalAmount: 0,
  netAmount: 0,
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
const initDeliveryNoteForm = {
  status: 'complete',
  pendingDate: parseDate(new Date().toISOString().split('T')[0]) as any,
  completeDate: null,
  remark: '',
  carNo: '',
  driverName: '',
  driverPhone: '',
};
const initTaxInvoiceForm = {
  status: 'complete',
  pendingDate: parseDate(new Date().toISOString().split('T')[0]) as any,
  completeDate: null,
  remark: '',
};
const initReceiptForm = {
  status: 'complete',
  pendingDate: parseDate(new Date().toISOString().split('T')[0]) as any,
  completeDate: null,
  remark: '',
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
  const pdfRef = useRef<any>();
  const [documentType, setDocumentType] = useState('quotation');
  const [pdfData, setPdfData] = useState<any>();

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
          return formatAmount(row?.price);
        },
        header: 'ราคาขาย (~ประมาน)',
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
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [modalScreenLoading, setModalScreenLoading] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formDeliveryNoteMode, setFormDeliveryNoteMode] = useState('create');
  const [formTaxInvoiceMode, setFormTaxInvoiceMode] = useState('create');
  const [formReceiptMode, setFormReceiptMode] = useState('create');
  const [deliveryNoteId, setDeliveryNoteId] = useState<any>();
  const [taxInvoiceId, setTaxInvoiceId] = useState<any>();
  const [categoryId, setCategoryId] = useState('all');
  const [receiptId, setReceiptId] = useState<any>();
  const [quoId, setQuoId] = useState<any>();
  const [customerId, setCustomerId] = useState<any>();
  const [productId, setProductId] = useState<any>(null);
  const [districtFilter, setDistrictFilter] = useState<any>();
  const [subDistrictFilter, setSubDistrictFilter] = useState<any>();
  const [customerMode, setCustomerMode] = useState('create');
  const [zipcodeFilter, setZipcodeFilter] = useState<any>();
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
  const {
    handleSubmit: handleSubmitCustomerForm,
    reset: resetCustomerForm,
    control: controlCustomerForm,
  } = useForm({
    defaultValues: initCustomerForm,
  });
  const {
    register: registerDeliveryNoteForm,
    handleSubmit: handleSubmitDeliveryNoteForm,
    reset: resetDeliveryNoteForm,
    control: controlDeliveryNoteForm,
  } = useForm({
    defaultValues: initDeliveryNoteForm,
  });
  const {
    register: registerTaxInvoiceForm,
    handleSubmit: handleSubmitTaxInvoiceForm,
    reset: resetTaxInvoiceForm,
    control: controlTaxInvoiceForm,
  } = useForm({
    defaultValues: initTaxInvoiceForm,
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
  const [showPdfRender, setShowPdfRender] = useState(false);

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
              ลูกค้า {pdfData?.customer?.name}{' '}
              {pdfData?.customer?.type == 'private' && '(สำนักงานใหญ่)'}
            </p>
            <p>เลขประจำตัวผู้เสียภาษี {pdfData?.customer?.taxId}</p>
            <p>{pdfData?.customer?.fullAddress}</p>
            <p>ติดต่อ {pdfData?.customer?.telephone}</p>
          </div>

          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-center">
                  ลำดับ
                </th>
                <th className="border border-gray-300 p-2 text-center">รหัส</th>
                <th className="border border-gray-300 p-2 text-left">รายการ</th>
                <th className="border border-gray-300 p-2 text-center">
                  หน่วย
                </th>
                <th className="border border-gray-300 p-2 text-right">จำนวน</th>
                <th className="border border-gray-300 p-2 text-right">
                  ราคาขาย (~ประมาน)
                </th>
                <th className="border border-gray-300 p-2 text-right">
                  ราคารวม
                </th>
              </tr>
            </thead>
            <tbody>
              {pdfData?.poProducts?.map((item: any, index: any) => (
                <tr key={index} className="break-inside-avoid">
                  <td className="border border-gray-300 p-2 text-center">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {item?.product?.no}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {textCut(item?.product?.name, 85)}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {item?.product?.unit}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatAmount(item?.qty)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatAmount(item?.price)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatAmount(item?.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-5">
            <div className="w-1/3">
              <div className="flex justify-between py-1">
                <span>รวมเป็นเงิน</span>
                <span>{formatAmount(pdfData?.totalAmount || 0)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>ภาษีมูลค่าเพิ่ม (7%)</span>
                <span>{formatAmount(pdfData?.vat || 0)}</span>
              </div>
              <div className="flex justify-between py-1 font-bold">
                <span>ยอดรวมทั้งสิ้น</span>
                <span>{formatAmount(pdfData?.netAmount || 0)}</span>
              </div>
              <div className="flex text-end py-1">
                ({ThaiBahtText(pdfData?.netAmount || 0)})
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
              ลูกค้า {pdfData?.customer?.name}{' '}
              {pdfData?.customer?.type == 'private' && '(สำนักงานใหญ่)'}
            </p>
            <p>เลขประจำตัวผู้เสียภาษี {pdfData?.customer?.taxId}</p>
            <p>{pdfData?.customer?.fullAddress}</p>
            <p>ติดต่อ {pdfData?.customer?.telephone}</p>
          </div>

          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-center">
                  ลำดับ
                </th>
                <th className="border border-gray-300 p-2 text-center">รหัส</th>
                <th className="border border-gray-300 p-2 text-left">รายการ</th>
                <th className="border border-gray-300 p-2 text-center">
                  หน่วย
                </th>
                <th className="border border-gray-300 p-2 text-right">จำนวน</th>
                <th className="border border-gray-300 p-2 text-right">
                  ราคาขาย (~ประมาน)
                </th>
                <th className="border border-gray-300 p-2 text-right">
                  ราคารวม
                </th>
              </tr>
            </thead>
            <tbody>
              {pdfData?.poProducts?.map((item: any, index: any) => (
                <tr key={index} className="break-inside-avoid">
                  <td className="border border-gray-300 p-2 text-center">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {item?.product?.no}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {textCut(item?.product?.name, 85)}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {item?.product?.unit}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatAmount(item?.qty)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatAmount(item?.price)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatAmount(item?.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-5">
            <div className="w-1/3">
              <div className="flex justify-between py-1">
                <span>รวมเป็นเงิน</span>
                <span>{formatAmount(pdfData?.totalAmount || 0)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>ภาษีมูลค่าเพิ่ม (7%)</span>
                <span>{formatAmount(pdfData?.vat || 0)}</span>
              </div>
              <div className="flex justify-between py-1 font-bold">
                <span>ยอดรวมทั้งสิ้น</span>
                <span>{formatAmount(pdfData?.netAmount || 0)}</span>
              </div>
              <div className="flex text-end py-1">
                ({ThaiBahtText(pdfData?.netAmount || 0)})
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

  const { data: categories } = useSWR(
    `/api/account/quo?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: customerDropdown } = useSWR(
    `/api/customer?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: companyBankDropdown } = useSWR(
    `/api/company/bank?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: productCategoryDropdown } = useSWR(
    `/api/product/category?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: productDropdown } = useSWR(
    `/api/warehouse?type=dropdown&companyId=${session?.company?.id}&categoryId=${categoryId}&isCanSell=true`,
    fetcher
  );
  const { data: quoDashboard } = useSWR(
    `/api/dashboard?type=quo&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: categoryDown } = useSWR(
    `/api/warehouse/category?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );

  const setVatProduct = (amount: any) => {
    const taxType = watchForm('taxType');

    if (taxType == 'vat') {
      const vat = parseFloat((amount * 0.07).toFixed(2));
      setValueForm('vat', parseFloat((amount * 0.07).toFixed(2)));
      setValueForm('totalAmount', amount);
      setValueForm('netAmount', amount - vat);
    } else {
      const vat = parseFloat((amount * 0.07).toFixed(2));
      setValueForm('vat', parseFloat((amount * 0.07).toFixed(2)));
      setValueForm('totalAmount', amount);
      setValueForm('netAmount', amount + vat);
    }
  };

  useEffect(() => {
    calculateTotalAmounts();
  }, [watchForm('taxType')]);

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
          setProducts([]);
          setProductId(null);
          onCloseModal();
        }}
      >
        <ModalContent>
          <ModalHeader>
            {formMode == 'create' ? 'เพิ่มใบเสนอราคาใหม่' : 'แก้ไขใบเสนอราคา'}
          </ModalHeader>
          <ModalBody>
            {customerDropdown?.length == 0 && (
              <Alert
                title="แจ้งเตือน"
                color="danger"
                description={
                  <>
                    <span>
                      ขณะนี้ยังไม่มีข้อมูลลูกค้า{' '}
                      <span
                        className="underline cursor-pointer"
                        onClick={() => {
                          window.open('/supplier', '_blank');
                        }}
                      >
                        เพิ่มลูกค้าใหม่
                      </span>
                    </span>
                  </>
                }
              />
            )}

            {watchForm('paymentType') !== 'cash' &&
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

            {formMode == 'create' && (
              <Alert
                title="แจ้งเตือน"
                description={
                  <span>
                    เมื่อสร้างใบเสนอราคาเสร็จสิ้น
                    ระบบจะทำการตัดสต็อกสินค้าล่วงหน้า
                    แต่หากใบเสนอราคาถูกยกเลิกหรือลูกค้าเปลี่ยนใจ
                    ระบบจะคืนสต็อกกลับเข้าไปในคลังสินค้าตามเดิม
                  </span>
                }
              />
            )}

            {formMode == 'update' && (
              <Alert
                title="แจ้งเตือน"
                description={
                  <span>
                    เมื่อใบเสนอราคาถูกยกเลิกหรือลูกค้าเปลี่ยนใจ
                    ระบบก็จะคืนสต็อกกลับเข้าไปเหมือนเดิม
                    และจะไม่สามารถแก้ไขสถานะใบเสนอราคาได้อีก
                  </span>
                }
              />
            )}

            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <Controller
                control={controlForm}
                name="pendingDate"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    showMonthAndYearPickers
                    variant="bordered"
                    label="วันที่สร้างใบเสนอราคา"
                    isRequired
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                  />
                )}
              />

              <Select
                variant="bordered"
                {...registerForm('customerId', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm?.customerId}
                errorMessage={errorsForm?.customerId?.message}
                label="ลูกค้า"
                isRequired
              >
                {customerDropdown &&
                  customerDropdown?.map((item: any) => {
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
                isInvalid={!!errorsForm?.paymentType}
                errorMessage={errorsForm?.paymentType?.message}
              >
                <SelectItem key={'cash'}>เงินสด</SelectItem>
                <SelectItem key={'bank'}>เงินโอน</SelectItem>
              </Select>
              {watchForm('paymentType') !== 'cash' && (
                <>
                  <Select
                    variant="bordered"
                    label="บัญชีที่รับโอน"
                    {...registerForm('paymentToBankId', {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                    })}
                    isInvalid={!!errorsForm?.paymentToBankId}
                    errorMessage={errorsForm?.paymentToBankId?.message}
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
                {...registerForm('taxType', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm?.taxType}
                errorMessage={errorsForm?.taxType?.message}
                label="ประเภทภาษี"
              >
                <SelectItem key={'vat'}>รวม VAT</SelectItem>
                <SelectItem key={'nonVat'}>ไม่รวม VAT</SelectItem>
              </Select>
              <Controller
                control={controlForm}
                name="totalAmount"
                render={({ field: { value, onChange } }) => (
                  <Input
                    variant="bordered"
                    label="ยอดเงินรวม"
                    type="number"
                    isDisabled
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                  />
                )}
              />
              <Controller
                control={controlForm}
                name="vat"
                render={({ field: { value, onChange } }) => (
                  <Input
                    variant="bordered"
                    label="ภาษีมูลค่าเพิ่ม 7%"
                    type="number"
                    isDisabled
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
                    label="ยอดเงินสุทธิ"
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
                variant="bordered"
                label="หมายเหตุ (ถ้ามี)"
                {...registerForm('remark')}
              />
              <Input
                variant="bordered"
                label="ใช้กับโครงการ (ถ้ามี)"
                {...registerForm('name')}
              />
              {formMode == 'update' && (
                <>
                  <Select
                    variant="bordered"
                    isDisabled={watchForm('status') == 'notInterested'}
                    label="สถานะ"
                    {...registerForm('status')}
                  >
                    <SelectItem key={'pending'}>รอลูกค้าตอบกลับ</SelectItem>
                    <SelectItem key={'notInterested'}>
                      ลูกค้าไม่สนใจสั่งซื้อ
                    </SelectItem>
                    <SelectItem key={'complete'}>ลูกค้าสนใจสั่งซื้อ</SelectItem>
                  </Select>
                </>
              )}
            </form>
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-end gap-2 flex-wrap">
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
                variant="bordered"
                startContent={<ClipboardIcon className="opacity-50" />}
                onClick={() => {
                  onCloseModal();
                  onOpenProductModal();
                }}
              >
                รายการสินค้า
              </Button>
              <Button
                radius="full"
                startContent={!isApiLoading && <CircleCheck />}
                className="bg-primary text-white"
                isLoading={isApiLoading}
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/account/quo`,
                            {
                              ...data,
                              companyId: session?.company?.id,
                              pendingDate: convertDateJsonToDbSingle(
                                data?.pendingDate
                              ),
                              products,
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/account/quo/${projectSelectId}`,
                            {
                              ...data,
                              pendingDate: convertDateJsonToDbSingle(
                                data?.pendingDate
                              ),
                              products,
                            }
                          );

                    if (formMode == 'update') {
                      setProducts([]);

                      const { data } = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/account/quo/${projectSelectId}`
                      );

                      const newPoProducts = data?.poProducts?.map(
                        (item: any) => {
                          return { ...item, isUpdate: true };
                        }
                      );
                      setProducts(newPoProducts);
                    }

                    await mutate(
                      `/api/account/quo?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
                    );
                    await mutate(
                      `/api/dashboard?type=po&companyId=${session?.company?.id}`
                    );
                    notyf.success(paperResponse?.data?.message);

                    setIsApiLoading(false);
                    onCloseModal();
                    resetForm(initForm);
                    setProductId(null);
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
    isOpen: isOpenDeliveryNoteModal,
    onOpen: onOpenDeliveryNoteModal,
    onClose: onCloseDeliveryNoteModal,
  } = useDisclosure();

  const formDeliveryNoteModal = () => {
    return (
      <Modal
        size="4xl"
        scrollBehavior="inside"
        isOpen={isOpenDeliveryNoteModal}
        isDismissable={false}
        onClose={async () => {
          resetDeliveryNoteForm(initDeliveryNoteForm);
          onCloseDeliveryNoteModal();
        }}
      >
        <ModalContent>
          <ModalHeader>
            {formDeliveryNoteMode == 'create'
              ? 'สร้างใบส่งสินค้า'
              : 'แก้ไขใบส่งสินค้า'}
          </ModalHeader>
          <ModalBody>
            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <Controller
                control={controlDeliveryNoteForm}
                name="pendingDate"
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
                    label="วันที่สร้างใบส่งของ"
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
              <Controller
                control={controlDeliveryNoteForm}
                name="completeDate"
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
                    label="วันที่ส่งสินค้า"
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
              <Controller
                control={controlDeliveryNoteForm}
                name="carNo"
                render={({ field: { value, onChange } }) => (
                  <Input
                    label="ทะเบียนรถขนส่ง (ถ้ามี)"
                    variant="bordered"
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                  />
                )}
              />

              <Controller
                control={controlDeliveryNoteForm}
                name="driverName"
                render={({ field: { value, onChange } }) => (
                  <Input
                    label="ชื่อผู้ขับรถขนส่ง (ถ้ามี)"
                    variant="bordered"
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                  />
                )}
              />

              <Controller
                control={controlDeliveryNoteForm}
                name="driverPhone"
                render={({ field: { value, onChange } }) => (
                  <Input
                    label="เบอร์ติดต่อผู้ขับรถขนส่ง (ถ้ามี)"
                    variant="bordered"
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                  />
                )}
              />

              <Select
                variant="bordered"
                isDisabled
                label="สถานะ"
                {...registerDeliveryNoteForm('status')}
              >
                <SelectItem key={'pending'}>กำลังเตรียมของ</SelectItem>
                <SelectItem key={'complete'}>จัดส่งเรียบร้อยแล้ว</SelectItem>
              </Select>
              <Input
                variant="bordered"
                label="หมายเหตุ (ถ้ามี)"
                {...registerDeliveryNoteForm('remark')}
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
                onClick={handleSubmitDeliveryNoteForm(async (data) => {
                  try {
                    setIsApiLoading(true);
                    const paperResponse =
                      formDeliveryNoteMode == 'create'
                        ? await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/account/deliveryNote`,
                            {
                              ...data,
                              quoId,
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/account/deliveryNote/${deliveryNoteId}`,
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
                      `/api/account/quo?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
                    );
                    notyf.success(paperResponse?.data?.message);

                    setIsApiLoading(false);
                    onCloseDeliveryNoteModal();
                    resetDeliveryNoteForm(initDeliveryNoteForm);
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
    isOpen: isOpenTaxInvoiceModal,
    onOpen: onOpenTaxInvoiceModal,
    onClose: onCloseTaxInvoiceModal,
  } = useDisclosure();

  const formTaxInvoiceModal = () => {
    return (
      <Modal
        size="4xl"
        scrollBehavior="inside"
        isOpen={isOpenTaxInvoiceModal}
        isDismissable={false}
        onClose={async () => {
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
                    label="วันที่ส่งให้ลูกค้า"
                    isRequired
                    isInvalid={!!error}
                    errorMessage={error?.message}
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                  />
                )}
              />
              <Select
                variant="bordered"
                isDisabled
                label="สถานะ"
                {...registerTaxInvoiceForm('status')}
              >
                <SelectItem key={'pending'}>ยังไม่ได้ส่งให้ลูกค้า</SelectItem>
                <SelectItem key={'complete'}>ส่งให้ลูกค้าแล้ว</SelectItem>
              </Select>
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
                startContent={!isApiLoading && <CircleCheck />}
                className="bg-primary text-white"
                isLoading={isApiLoading}
                onClick={handleSubmitTaxInvoiceForm(async (data) => {
                  try {
                    setIsApiLoading(true);
                    const paperResponse =
                      formTaxInvoiceMode == 'create'
                        ? await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/account/taxInvoice`,
                            {
                              ...data,
                              quoId,
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/account/taxInvoice/${taxInvoiceId}`,
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
                      `/api/account/quo?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
                {formMode == 'create' ? 'บันทึกข้อมูล' : 'แก้ไขข้อมูล'}
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  const {
    isOpen: isOpenReceiptModal,
    onOpen: onOpenReceiptModal,
    onClose: onCloseReceiptModal,
  } = useDisclosure();

  const formReceiptModal = () => {
    return (
      <Modal
        size="4xl"
        scrollBehavior="inside"
        isOpen={isOpenReceiptModal}
        isDismissable={false}
        onClose={async () => {
          resetReceiptForm(initReceiptForm);
          onCloseReceiptModal();
        }}
      >
        <ModalContent>
          <ModalHeader>
            {formMode == 'create'
              ? 'สร้างใบเสร็จรับเงิน'
              : 'แก้ไขใบเสร็จรับเงิน'}
          </ModalHeader>
          <ModalBody>
            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
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
                    label="วันที่ส่งให้ลูกค้า"
                    isInvalid={!!error}
                    errorMessage={error?.message}
                    isRequired
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                  />
                )}
              />
              <Select
                variant="bordered"
                label="สถานะ"
                isDisabled
                {...registerReceiptForm('status')}
              >
                <SelectItem key={'pending'}>ยังไม่ได้ส่งให้ลูกค้า</SelectItem>
                <SelectItem key={'complete'}>ส่งให้ลูกค้าแล้ว</SelectItem>
              </Select>
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
                startContent={!isApiLoading && <CircleCheck />}
                className="bg-primary text-white"
                isLoading={isApiLoading}
                onClick={handleSubmitReceiptForm(async (data) => {
                  try {
                    setIsApiLoading(true);
                    const paperResponse =
                      formReceiptMode == 'create'
                        ? await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/account/receipt`,
                            {
                              ...data,
                              quoId,
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/account/receipt/${receiptId}`,
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
                      `/api/account/quo?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
    let amount = 0;
    const updatedProducts = products.map((product: any) => {
      const total = product.qty * product.price;
      amount += total;
      return {
        ...product,
        totalAmount: total,
      };
    });
    setProducts(updatedProducts);

    setVatProduct(amount);
  };

  const productModal = () => {
    return (
      <Modal
        size="4xl"
        isDismissable={false}
        onClose={() => {
          setValueForm('netAmount', 0);
          setValueForm('totalAmount', 0);
          setValueForm('vat', 0);
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
            {formMode == 'create'
              ? 'เพิ่มสินค้าในใบเสนอราคา'
              : 'แก้ไขสินค้าในใบเสนอราคา'}
          </ModalHeader>
          <ModalBody>
            {productCategoryDropdown?.length == 0 && (
              <Alert
                title="แจ้งเตือน"
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
                color="danger"
              />
            )}
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
                    return <SelectItem key={item?.id}>{item?.name}</SelectItem>;
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
                          price: findProduct?.product?.priceSell || 1,
                          totalAmount: '',
                          remark: '',
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
                        label="ราคาขาย (~ประมาน)"
                        isDisabled={formMode == 'update'}
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
                startContent={!isApiLoading && <CircleCheck />}
                className="bg-primary text-white"
                isLoading={isApiLoading}
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

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'รหัสประจำตัวใบเสนอราคา',
        size: 50,
      },
      {
        accessorKey: 'no',
        header: 'เลขที่ใบเสนอราคา',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'status',
        header: 'สถานะใบเสนอราคา',
        Cell: ({ cell }: any) => {
          const status = cell.getValue();
          return status == 'pending' ? (
            <Chip variant="flat" color="warning" startContent={<Clock />}>
              รอลูกค้าตอบกลับ
            </Chip>
          ) : status == 'notInterested' ? (
            <Chip color="danger" variant="flat" startContent={<CircleX />}>
              ลูกค้าไม่สนใจสั่งซื้อ
            </Chip>
          ) : status == 'complete' ? (
            <Chip color="success" variant="flat" startContent={<CircleCheck />}>
              ลูกค้าสนใจสั่งซื้อ
            </Chip>
          ) : (
            '-'
          );
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.deliveryNote?.status ? row?.deliveryNote?.status : null;
        },
        header: 'สถานะใบส่งสินค้า',
        Cell: ({ cell }: any) => {
          const status = cell.getValue();
          return status == 'pending' ? (
            <Chip variant="flat" startContent={<CircleAlert />} color="warning">
              ยังไม่ได้ส่งให้ลูกค้า
            </Chip>
          ) : status == 'complete' ? (
            <Chip color="success" variant="flat" startContent={<CircleCheck />}>
              ส่งให้ลูกค้าแล้ว
            </Chip>
          ) : (
            <Chip variant="flat" startContent={<CircleAlert />} color="danger">
              ยังไม่ได้ดำเนินการ
            </Chip>
          );
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.taxInvoice?.status ? row?.taxInvoice?.status : null;
        },
        header: 'สถานะใบกำกับภาษี',
        Cell: ({ cell }: any) => {
          const status = cell.getValue();
          return status == 'pending' ? (
            <Chip variant="flat" color="warning" startContent={<CircleAlert />}>
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
          return row?.receipt?.status ? row?.receipt?.status : null;
        },
        header: 'สถานะใบเสร็จรับเงิน',
        Cell: ({ cell }: any) => {
          const status = cell.getValue();
          return status == 'pending' ? (
            <Chip variant="flat" color="warning" startContent={<CircleAlert />}>
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
        accessorKey: 'name',
        header: 'ใช้กับโครงการ (ถ้ามี)',
        size: 450,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorFn: (row: any) => {
          return row?.customer?.name ? row?.customer?.name : '-';
        },
        header: 'ชื่อลูกค้า',
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
        accessorKey: 'taxType',
        header: 'ประเภทภาษี',
        Cell: ({ cell }: any) => {
          const taxType = cell.getValue();

          return taxType == 'vat'
            ? 'รวม VAT'
            : taxType == 'nonVat'
              ? 'ไม่รวม VAT'
              : '-';
        },
      },
      {
        accessorKey: 'totalAmount',
        header: 'ยอดเงินรวมสินค้า',
        muiTableBodyCellProps: {
          sx: { textAlign: 'right' },
        },
        Cell: ({ cell }: any) => formatAmount(cell.getValue()) || '-',
      },
      {
        accessorFn: (row: any) => {
          if (row?.taxType === 'vat') {
            return { type: 'vat', data: row?.vat };
          } else if (row?.taxType === 'nonVat') {
            return { type: 'nonVat', data: row?.vat };
          }
          return null;
        },
        header: 'ยอดภาษีมูลค่าเพิ่ม 7%',
        size: 250,
        muiTableBodyCellProps: {
          sx: { textAlign: 'right' },
        },
        Cell: ({ cell }: any) => {
          const vat = cell.getValue();

          return vat?.type === 'vat' ? (
            <span className="text-danger-800">-{formatAmount(vat?.data)}</span>
          ) : vat?.type === 'nonVat' ? (
            <span className="text-success-800">+{formatAmount(vat?.data)}</span>
          ) : (
            '-'
          );
        },
      },
      {
        accessorKey: 'netAmount',
        header: 'ยอดเงินสุทธิ',
        muiTableBodyCellProps: {
          sx: { textAlign: 'right' },
        },
        Cell: ({ cell }: any) => formatAmount(cell.getValue()) || '-',
      },
      {
        accessorFn: (row: any) => {
          return row?.toCompany?.fullBank ? row?.toCompany?.fullBank : '-';
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
    paginationDisplayMode: 'custom',
    renderDetailPanel: ({ row }) => {
      return (
        <div className="felx flex-col gap-2.5">
          <div className="flex flex-wrap gap-2.5 mb-5 mt-2.5">
            <Dropdown>
              <DropdownTrigger>
                <Button radius="full" variant="bordered">
                  ใบเสนอราคา
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Dynamic Actions">
                <DropdownItem
                  onAction={() => {
                    setDocumentType('quotation');
                    setPdfData(row?.original);
                    printPdf();
                  }}
                  key={'pdf'}
                >
                  ดาว์นโหลด .PDF
                </DropdownItem>
                <DropdownItem
                  onAction={async () => {
                    try {
                      const id = row?.original?.id;
                      setModalScreenLoading(true);
                      setFormMode('update');
                      setProjectSelectId(id);
                      const { data } = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/account/quo/${id}`
                      );

                      const newPoProducts = data?.poProducts?.map(
                        (item: any) => {
                          return { ...item, isUpdate: true };
                        }
                      );
                      setProducts(newPoProducts);

                      resetForm({
                        ...data,
                        pendingDate: data?.pendingDate
                          ? parseDate(data?.pendingDate)
                          : null,
                      });

                      onOpenModal();
                      setModalScreenLoading(false);
                    } catch (error) {
                      setModalScreenLoading(false);
                      console.log(error);
                    }
                  }}
                  key={'edit'}
                >
                  แก้ไขข้อมูล
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
                <Button radius="full" variant="bordered">
                  ใบส่งสินค้า
                </Button>
              </DropdownTrigger>
              {row?.original?.deliveryNoteId ? (
                <DropdownMenu aria-label="Dynamic Actions">
                  <DropdownItem
                    onAction={() => {
                      setDocumentType('delivery');
                      setPdfData(row?.original);
                      printPdf();
                    }}
                    key={'pdf'}
                  >
                    ดาว์นโหลด .PDF
                  </DropdownItem>
                  <DropdownItem
                    onAction={async () => {
                      if (row?.original?.deliveryNoteId) {
                        setFormDeliveryNoteMode('update');
                        onOpenDeliveryNoteModal();
                        setDeliveryNoteId(row?.original?.deliveryNoteId);

                        const { data } = await axios.get(
                          `${process.env.NEXT_PUBLIC_API_URL}/api/account/deliveryNote/${row?.original?.deliveryNoteId}`
                        );

                        resetDeliveryNoteForm({
                          ...data,
                          pendingDate: data?.pendingDate
                            ? parseDate(data?.pendingDate)
                            : null,
                          completeDate: data?.completeDate
                            ? parseDate(data?.completeDate)
                            : null,
                        });
                      }
                    }}
                    key={'edit'}
                  >
                    แก้ไขข้อมูล
                  </DropdownItem>
                </DropdownMenu>
              ) : (
                <DropdownMenu aria-label="Dynamic Actions">
                  <DropdownItem
                    onAction={async () => {
                      setFormDeliveryNoteMode('create');
                      if (!row?.original?.deliveryNoteId) {
                        onOpenDeliveryNoteModal();
                        setQuoId(row?.original.id);
                      }
                    }}
                    key={'create'}
                  >
                    สร้างใบส่งสินค้า
                  </DropdownItem>
                </DropdownMenu>
              )}
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
                <Button radius="full" variant="bordered">
                  ใบกำกับภาษี
                </Button>
              </DropdownTrigger>
              {row?.original?.taxInvoiceId ? (
                <DropdownMenu aria-label="Dynamic Actions">
                  <DropdownItem
                    onAction={() => {
                      setDocumentType('tax-invoice');
                      setPdfData(row?.original);
                      printPdf();
                    }}
                    key={'pdf'}
                  >
                    ดาว์นโหลด .PDF
                  </DropdownItem>
                  <DropdownItem
                    onAction={async () => {
                      if (row?.original?.deliveryNoteId) {
                        setFormTaxInvoiceMode('update');
                        onOpenTaxInvoiceModal();
                        setTaxInvoiceId(row?.original?.taxInvoiceId);

                        const { data } = await axios.get(
                          `${process.env.NEXT_PUBLIC_API_URL}/api/account/taxInvoice/${row?.original?.taxInvoiceId}`
                        );

                        resetTaxInvoiceForm({
                          ...data,
                          pendingDate: data?.pendingDate
                            ? parseDate(data?.pendingDate)
                            : null,
                          completeDate: data?.completeDate
                            ? parseDate(data?.completeDate)
                            : null,
                        });
                      }
                    }}
                    key={'edit'}
                  >
                    แก้ไขข้อมูล
                  </DropdownItem>
                </DropdownMenu>
              ) : (
                <DropdownMenu aria-label="Dynamic Actions">
                  <DropdownItem
                    onAction={async () => {
                      if (!row?.original?.taxInvoiceId) {
                        onOpenTaxInvoiceModal();
                        setQuoId(row?.original.id);
                      }
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
              {row?.original?.receiptId ? (
                <DropdownMenu aria-label="Dynamic Actions">
                  <DropdownItem
                    onAction={() => {
                      setDocumentType('receipt');
                      setPdfData(row?.original);
                      printPdf();
                    }}
                    key={'pdf'}
                  >
                    ดาว์นโหลด .PDF
                  </DropdownItem>
                  <DropdownItem
                    onAction={async () => {
                      if (row?.original?.receiptId) {
                        setFormReceiptMode('update');
                        onOpenTaxInvoiceModal();
                        setReceiptId(row?.original?.receiptId);

                        const { data } = await axios.get(
                          `${process.env.NEXT_PUBLIC_API_URL}/api/account/receipt/${row?.original?.receiptId}`
                        );

                        resetReceiptForm({
                          ...data,
                          pendingDate: data?.pendingDate
                            ? parseDate(data?.pendingDate)
                            : null,
                          completeDate: data?.completeDate
                            ? parseDate(data?.completeDate)
                            : null,
                        });
                      }
                    }}
                    key={'edit'}
                  >
                    แก้ไขข้อมูล
                  </DropdownItem>
                </DropdownMenu>
              ) : (
                <DropdownMenu aria-label="Dynamic Actions">
                  <DropdownItem
                    onAction={async () => {
                      if (!row?.original?.receiptId) {
                        onOpenReceiptModal();
                        setQuoId(row?.original.id);
                      }
                    }}
                    key={'create'}
                  >
                    สร้างใบเสร็จรับเงิน
                  </DropdownItem>
                </DropdownMenu>
              )}
            </Dropdown>
          </div>

          {row?.original?.poProducts?.length !== 0 && (
            <div className="flex w-fit flex-col gap-2.5">
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
              `${process.env.NEXT_PUBLIC_API_URL}/api/account/quo/${id}`
            );

            const newPoProducts = data?.poProducts?.map((item: any) => {
              return { ...item, isUpdate: true };
            });
            setProducts(newPoProducts);

            resetForm({
              ...data,
              pendingDate: data?.pendingDate
                ? parseDate(data?.pendingDate)
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
                `${process.env.NEXT_PUBLIC_API_URL}/api/account/quo/${id}`
              );
              await mutate(
                `/api/account/quo?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
                `/api/account/quo?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
            เพิ่มใบเสนอราคาใหม่
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/account/quo/${id}`
                          );
                        })
                      );
                    }

                    await mutate(
                      `/api/account/quo?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
    <Layout sitename={'ใบเสนอราคา'}>
      {formModal()}
      {productModal()}
      {formDeliveryNoteModal()}
      {formTaxInvoiceModal()}
      {formReceiptModal()}
      {modalScreenLoading && PageLoading()}
      {pdfRender()}
      {formCustomerModal()}

      <section className="flex flex-col gap-5">
        <Breadcrumbs>
          <BreadcrumbItem
            onClick={() => {
              router.push('/');
            }}
          >
            หน้าแรก
          </BreadcrumbItem>
          <BreadcrumbItem>การขายสินค้า</BreadcrumbItem>
          <BreadcrumbItem>ใบเสนอราคา</BreadcrumbItem>
        </Breadcrumbs>

        <HeaderTitle title="ใบเสนอราคา" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          <CardSummary
            label={'ทั้งหมด'}
            value={quoDashboard?.quoCount}
            suffix={'รายการ'}
          />
          <CardSummary
            label={'รอลูกค้าตอบกลับ'}
            value={quoDashboard?.quoPendingCount}
            suffix={'รายการ'}
          />
          <CardSummary
            label={'ไม่สนใจสั่งซื้อ'}
            value={quoDashboard?.quoNotInterestedCount}
            suffix={'รายการ'}
          />
          <CardSummary
            label={'สนใจสั่งซื้อ'}
            value={quoDashboard?.quoSuccessCount}
            suffix={'รายการ'}
          />
          <CardSummary
            label={'เงินทั้งหมด'}
            isMoney
            value={quoDashboard?.quoNetTotal}
            suffix={'บาท'}
          />
          <CardSummary
            label={'ไม่สนใจสั่งซื้อ'}
            isMoney
            value={quoDashboard?.quoNotInterestedNetTotal}
            suffix={'บาท'}
          />
          <CardSummary
            label={'สนใจสั่งซื้อ'}
            isMoney
            value={quoDashboard?.quoSuccessNetTotal}
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
