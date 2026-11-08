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
  useDisclosure,
} from '@nextui-org/react';
import router from 'next/router';
import {
  MaterialReactTable,
  MRT_ColumnDef,
  useMaterialReactTable,
} from 'material-react-table';
import { useEffect, useMemo, useRef, useState } from 'react';
import { mdiFilterOffOutline, mdiFilterOutline } from '@mdi/js';
import useSWR, { mutate } from 'swr';
import Icon from '@mdi/react';
import { Controller, useForm } from 'react-hook-form';
import PageLoading from '@/components/LoadingPage';
import { MenuItem } from '@mui/material';
import ThaiBahtText from 'thai-baht-text';
import {
  formatThaiDate,
  formatThaiDateTime,
  formatThaiFullDate,
  formatAmount,
  textCut,
  convertDateJsonToDbSingle,
  fetcher,
} from '@/utils';
import {
  ArrowDown,
  CircleAlert,
  CircleCheck,
  Search,
  XIcon,
} from 'lucide-react';
import CardSummary from '@/components/CardSummary';
import { parseDate } from '@internationalized/date';
const initForm = {
  quoId: '',
  status: 'pending',
  pendingDate: parseDate(new Date().toISOString().split('T')[0]) as any,
  completeDate: null,
  remark: '',
  carNo: '',
  driverName: '',
  driverPhone: '',
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
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [modalScreenLoading, setModalScreenLoading] = useState(false);
  const [formMode, setFormMode] = useState('create');

  const [projectSelectId, setProjectSelectId] = useState<any>();
  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    reset: resetForm,
    control: controlForm,
  } = useForm({
    defaultValues: initForm,
  });
  const [pagination, setPagination] = useState({ pageIndex: 1, pageItem: 20 });
  const pdfRef = useRef<any>();
  const [documentType, setDocumentType] = useState('quotation');
  const [pdfData, setPdfData] = useState<any>();

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
  const [showPdfRender, setShowPdfRender] = useState(false);

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
                  formatThaiFullDate(pdfData?.createdAt)}
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
                  ราคาต่อหน่วย
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
                  <p>วันที่ {formatThaiFullDate(pdfData?.createdAt)}</p>
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
                  formatThaiFullDate(pdfData?.createdAt)}
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
                  ราคาต่อหน่วย
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
                  <p>วันที่ {formatThaiFullDate(pdfData?.createdAt)}</p>
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
    `/api/account/deliveryNote?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: quoDropdown } = useSWR(
    `/api/account/quo?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: deliveryNoteDashboard } = useSWR(
    `/api/dashboard?type=deliveryNote&companyId=${session?.company?.id}`,
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
        onClose={async () => {
          resetForm(initForm);
          onCloseModal();
        }}
      >
        <ModalContent>
          <ModalHeader>
            {formMode == 'create' ? 'เพิ่มใบส่งสินค้าใหม่' : 'แก้ไขใบส่งสินค้า'}
          </ModalHeader>
          <ModalBody>
            {quoDropdown?.length == 0 && (
              <Alert
                color="warning"
                description={
                  <>
                    <span>
                      ขณะนี้ยังไม่มีข้อมูลสินค้าที่ต้องสร้างใบจัดส่งสินค้า
                    </span>{' '}
                    <span
                      className="underline cursor-pointer"
                      onClick={() => {
                        window.open('/account/quo', '_blank');
                      }}
                    >
                      หรือตรวจสอบจากใบเสนอราคา
                    </span>
                  </>
                }
                title={'แจ้งเตือน'}
              />
            )}

            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <Select
                variant="bordered"
                {...registerForm('quoId', {
                  required: true,
                })}
                isDisabled
                label="ใบเสนอราคา"
                isRequired
              >
                {quoDropdown &&
                  quoDropdown?.map((item: any) => {
                    return <SelectItem key={item?.id}>{item?.no}</SelectItem>;
                  })}
              </Select>
              <Controller
                control={controlForm}
                name="pendingDate"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    showMonthAndYearPickers
                    variant="bordered"
                    label="วันที่เตรียมสินค้า"
                    isRequired
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                  />
                )}
              />
              <Controller
                control={controlForm}
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
                label="ทะเบียนรถขนส่ง (ถ้ามี)"
                variant="bordered"
                {...registerForm('carNo')}
              />
              <Input
                label="ชื่อผู้ขับรถขนส่ง (ถ้ามี)"
                variant="bordered"
                {...registerForm('driverName')}
              />
              <Input
                label="เบอร์ติดต่อผู้ขับรถขนส่ง (ถ้ามี)"
                variant="bordered"
                {...registerForm('driverPhone')}
              />

              <Select
                variant="bordered"
                label="สถานะ"
                isDisabled
                {...registerForm('status')}
              >
                <SelectItem key={'pending'}>กำลังเตรียมของ</SelectItem>
                <SelectItem key={'complete'}>จัดส่งเรียบร้อยแล้ว</SelectItem>
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
                startContent={!isApiLoading && <CircleCheck />}
                className="bg-primary text-white"
                isLoading={isApiLoading}
                onClick={handleSubmitForm(async (data) => {
                  try {
                    setIsApiLoading(true);
                    const paperResponse =
                      formMode == 'create'
                        ? await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/account/deliveryNote`,
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/account/deliveryNote/${projectSelectId}`,
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
                      `/api/account/deliveryNote?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
                    );
                    await mutate(
                      `/api/dashboard?type=po&companyId=${session?.company?.id}`
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
        header: 'รหัสประจำตัวใบส่งสินค้า',
        size: 50,
      },
      {
        accessorKey: 'no',
        header: 'เลขที่ใบส่งสินค้า',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorFn: (row: any) => {
          return row?.Quo?.no ? row?.Quo?.no : null;
        },
        header: 'เลขที่ใบเสนอราคา',
        accessorKey: 'quoNo',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorFn: (row: any) => {
          return row?.Quo?.name ? row?.Quo.name : null;
        },
        header: 'ใช้กับโครงการ (ถ้ามี)',
        size: 250,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'status',
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
        accessorKey: 'pendingDate',
        header: 'วันที่สร้างใบส่งสินค้า',
        size: 250,
        Cell: ({ cell }: any) => formatThaiDate(cell.getValue()) || '-',
      },
      {
        accessorKey: 'completeDate',
        header: 'วันที่ส่งให้ลูกค้า',
        Cell: ({ cell }: any) => formatThaiDate(cell.getValue()) || '-',
      },
      {
        accessorKey: 'carNo',
        header: 'ทะเบียนรถขนส่ง (ถ้ามี)',
        size: 250,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'driverName',
        header: 'ชื่อผู้ขับรถขนส่ง (ถ้ามี)',
        size: 250,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'driverPhone',
        header: 'เบอร์ติดต่อผู้ขับรถ (ถ้ามี)',
        size: 250,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorFn: (row: any) => {
          return row?.Quo?.no ? row?.Quo?.no : null;
        },
        header: 'ดาว์โหลดเอกสาร',
        Cell: ({ cell }: any) => {
          return (
            <Button
              radius="full"
              startContent={<ArrowDown className="opacity-50" />}
              variant="bordered"
              onClick={async () => {
                try {
                  setShowPdfRender(true);
                  setDocumentType('delivery');
                  const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/account/quo?type=pdf&no=${cell?.getValue()}`
                  );
                  setPdfData(data);
                  await printPdf();
                } catch (error) {
                  console.log(error);
                }
              }}
            >
              ดาว์นโหลด .PDF
            </Button>
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
    renderDetailPanel: ({ row }) => {
      return (
        <div className="flex flex-col w-fit gap-2.5">
          <MaterialReactTable
            enableBottomToolbar={false}
            enableTopToolbar={false}
            columns={warehouseColumns}
            data={row?.original?.Quo?.poProducts}
            enableColumnOrdering={false}
            enableSorting={false}
            enablePagination={false}
            muiTableContainerProps={{ sx: { maxHeight: 300 } }}
          />
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
              `${process.env.NEXT_PUBLIC_API_URL}/api/account/deliveryNote/${id}`
            );

            resetForm({
              ...data,
              pendingDate: data?.pendingDate
                ? parseDate(data?.pendingDate)
                : null,
              completeDate: data?.completeDate
                ? parseDate(data?.completeDate)
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
                `${process.env.NEXT_PUBLIC_API_URL}/api/account/deliveryNote/${id}`
              );
              await mutate(
                `/api/account/deliveryNote?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
                `/api/account/deliveryNote?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
              );
            }}
            className="max-w-32 dark:text-white"
          >
            <SelectItem key={'20'}>20 รายการ</SelectItem>
            <SelectItem key={'50'}>50 รายการ</SelectItem>
            <SelectItem key={'100'}>100 รายการ</SelectItem>
          </Select>

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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/account/deliveryNote/${id}`
                          );
                        })
                      );
                    }

                    await mutate(
                      `/api/account/deliveryNote?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
    <Layout sitename={'ใบส่งสินค้า'}>
      {formModal()}
      {modalScreenLoading && PageLoading()}
      {pdfRender()}
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
          <BreadcrumbItem>ใบส่งสินค้า</BreadcrumbItem>
        </Breadcrumbs>

        <HeaderTitle title="ใบส่งสินค้า" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          <CardSummary
            label={'ทั้งหมด'}
            value={deliveryNoteDashboard?.deliveryNoteCount}
            suffix={'รายการ'}
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
