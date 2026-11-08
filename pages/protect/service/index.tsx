import HeaderTitle from '@/components/HeaderTitle';
import Layout from '@/components/Layout';
import {
  Alert,
  BreadcrumbItem,
  Breadcrumbs,
  Button,
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
  Select,
  SelectItem,
  useDisclosure,
} from '@nextui-org/react';
import router from 'next/router';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { useEffect, useMemo, useRef, useState } from 'react';

import { mdiFilterOffOutline, mdiFilterOutline } from '@mdi/js';
import axios from 'axios';
import useSWR, { mutate } from 'swr';
import Icon from '@mdi/react';
import { Controller, useForm } from 'react-hook-form';
import PageLoading from '@/components/LoadingPage';
import { MenuItem } from '@mui/material';
import {
  CircleAlert,
  CircleCheck,
  Clock,
  PlusIcon,
  Search,
  XIcon,
} from 'lucide-react';
import CardSummary from '@/components/CardSummary';
import { parseDate } from '@internationalized/date';
import ThaiBahtText from 'thai-baht-text';
const initForm = {
  projectId: null,
  completeDate: parseDate(new Date().toISOString().split('T')[0]) as any,
  taxType: 'vat',
  toBankId: null,
  paymentType: 'cash',
};

const initTaxInvoiceForm = {
  status: 'pending',
  pendingDate: parseDate(new Date().toISOString().split('T')[0]) as any,
  completeDate: null,
  remark: '',
};

const initReceiptForm = {
  status: 'pending',
  pendingDate: parseDate(new Date().toISOString().split('T')[0]) as any,
  completeDate: null,
  remark: '',
};
import { Notyf } from 'notyf';
import { errorRequire } from '@/utils/regex';
import {
  formatThaiFullDate,
  formatAmount,
  convertDateJsonToDbSingle,
  formatThaiDate,
  formatThaiDateTime,
  apiPath,
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
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [modalScreenLoading, setModalScreenLoading] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formTaxInvoiceMode, setFormTaxInvoiceMode] = useState('create');
  const [formReceiptMode, setFormReceiptMode] = useState('create');
  const [projectSelectId, setProjectSelectId] = useState<any>();
  const [taxInvoiceId, setTaxInvoiceId] = useState<any>();
  const [receiptId, setReceiptId] = useState<any>();
  const [serviceId, setServiceId] = useState<any>();
  const [showPdfRender, setShowPdfRender] = useState(false);
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
  const { data: categories } = useSWR(
    `/api/service?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: projectDropdown } = useSWR(
    `/api/contract/paper?type=dropdown&companyId=${session?.company?.id}&isPending=true`,
    fetcher
  );
  const { data: companyBankDropdown } = useSWR(
    `/api/company/bank?type=dropdown&companyId=${session?.company?.id}`,
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
            {formMode == 'create'
              ? 'เพิ่มจ้างเหมาบริการใหม่'
              : 'แก้ไขจ้างเหมาบริการ'}
          </ModalHeader>
          <ModalBody>
            <Alert
              title="แจ้งเตือน"
              color="warning"
              description={
                <>
                  เมื่อสร้างใบจ้างเหมาบริการ โครงการจะเปลี่ยนสถานะเป็น
                  `ดำเนินการเสร็จแล้ว` และจะไม่สามารถแก้ไขสถานะได้อีก
                  เว้นแต่ว่าจะลบใบจ้างเหมาบริการนั้นออก
                  ระบบจึงจะเปลี่ยนสถานะโครงการกลับมาเป็น `กำลังดำเนินการ`
                  อีกครั้ง
                </>
              }
            />

            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
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
                    {...registerForm('toBankId', {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                    })}
                    isInvalid={!!errorsForm?.toBankId}
                    errorMessage={errorsForm?.toBankId?.message}
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
                {...registerForm('projectId', {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsForm?.projectId}
                errorMessage={errorsForm?.projectId?.message}
                label="โครงการ"
                isRequired
              >
                {projectDropdown &&
                  projectDropdown?.map((item: any) => {
                    return <SelectItem key={item?.id}>{item?.name}</SelectItem>;
                  })}
              </Select>

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
                isRequired
              >
                <SelectItem key={'vat'}>รวม VAT</SelectItem>
                <SelectItem key={'nonVat'}>ไม่รวม VAT</SelectItem>
              </Select>

              <Controller
                control={controlForm}
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
                className="bg-primary text-white"
                isLoading={isApiLoading}
                startContent={!isApiLoading && <CircleCheck />}
                onClick={handleSubmitForm(async (data) => {
                  try {
                    setIsApiLoading(true);
                    const paperResponse =
                      formMode == 'create'
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/service/${projectSelectId}`,
                            {
                              ...data,
                              completeDate: convertDateJsonToDbSingle(
                                data?.completeDate
                              ),
                            }
                          );
                    await mutate(
                      `/api/service?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
    isOpen: isOpenTaxInvoiceModal,
    onOpen: onOpenTaxInvoiceModal,
    onClose: onCloseTaxInvoiceModal,
  } = useDisclosure();

  const {
    isOpen: isOpenReceiptModal,
    onOpen: onOpenReceiptModal,
    onClose: onCloseReceiptModal,
  } = useDisclosure();

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
                              serviceId,
                              pendingDate: convertDateJsonToDbSingle(
                                data?.pendingDate
                              ),
                              completeDate: convertDateJsonToDbSingle(
                                data?.completeDate
                              ),
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/service/taxInvoice/${taxInvoiceId}`,
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
                      `/api/service?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
                              serviceId,
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/service/receipt/${receiptId}`,
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
                      `/api/service?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'รหัสประจำตัวจ้างเหมาบริการ',
        size: 50,
      },
      {
        accessorFn: (row: any) => {
          return row?.taxInvoice?.status ? row?.taxInvoice?.status : null;
        },
        header: 'สถานะใบกำกับภาษี',
        accessorKey: 'taxStatus',
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
            <Chip variant="flat" startContent={<CircleAlert />} color="danger">
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
        accessorKey: 'receiptStatus',
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
          return row?.project?.name ? row?.project?.name : null;
        },
        accessorKey: 'name',
        header: 'โครงการ',
        size: 450,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorFn: (row: any) => {
          return row?.project?.status ? row?.project?.status : null;
        },
        header: 'สถานะโครงการ',
        Cell: ({ cell }: any) => {
          const status = cell.getValue();
          return status == 'pending' ? (
            <Chip variant="flat" color="warning" startContent={<Clock />}>
              กำลังดำเนินการ
            </Chip>
          ) : status == 'complete' ? (
            <Chip color="success" variant="flat" startContent={<CircleCheck />}>
              ส่งมอบโครงการแล้ว
            </Chip>
          ) : (
            '-'
          );
        },
      },
      {
        accessorKey: 'no',
        header: 'เลขที่ใบจ้างเหมาบริการ',
        size: 250,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorFn: (row: any) => {
          return row?.customer?.name ? row?.customer?.name : null;
        },
        header: 'ลูกค้าที่ใช้บริการ',
        Cell: ({ cell }: any) => cell.getValue() || '-',
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
          return row?.toBank?.fullBank ? row?.toBank?.fullBank : null;
        },
        size: 350,
        header: 'บัญชีที่รับโอน',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorFn: (row: any) => {
          return row?.project?.contractDate ? row?.project?.contractDate : null;
        },
        header: 'วันที่ทำสัญญา',
        Cell: ({ cell }: any) => formatThaiDate(cell.getValue()) || '-',
      },
      {
        accessorKey: 'completeDate',
        header: 'วันที่ส่งมอบโครงการ',
        Cell: ({ cell }: any) => formatThaiDate(cell.getValue()) || '-',
      },
      {
        accessorKey: 'taxType',
        header: 'ประเภทภาษี',
        size: 250,
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
        accessorFn: (row: any) => {
          return row?.project?.contractAmount
            ? row?.project?.contractAmount
            : null;
        },
        header: 'ยอดเงินรวม',
        muiTableBodyCellProps: {
          sx: { textAlign: 'right' },
        },
        Cell: ({ cell }: any) => formatAmount(cell.getValue()) || '-',
      },
      {
        accessorFn: (row: any) => {
          const vat = row?.project?.contractAmount * 0.07;

          if (row?.taxType === 'vat') {
            return { type: 'vat', data: vat };
          } else if (row?.taxType === 'nonVat') {
            return {
              type: 'nonVat',
              data: vat,
            };
          }
          return null;
        },
        header: 'ยอดภาษีมูลค่าเพิ่ม 7%',
        muiTableBodyCellProps: {
          sx: { textAlign: 'right' },
        },
        size: 250,
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
        accessorFn: (row: any) => {
          const vat = row?.project?.contractAmount * 0.07;
          if (row?.taxType === 'vat') {
            return row?.project?.contractAmount - vat;
          } else if (row?.taxType === 'nonVat') {
            return row?.project?.contractAmount + vat;
          }
          return null;
        },
        header: 'ยอดเงินสุทธิ',
        muiTableBodyCellProps: {
          sx: { textAlign: 'right' },
        },
        size: 250,
        Cell: ({ cell }: any) => formatAmount(cell.getValue()) || '-',
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
        <div className="felx flex-col w-fit gap-2.5">
          {!row?.original?.taxInvoiceId ||
            (!row?.original?.receiptId && (
              <div className="flex flex-wrap gap-2.5 mb-5 mt-2.5">
                {!row?.original?.taxInvoiceId && (
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
                            if (row?.original?.taxInvoiceId) {
                              setFormTaxInvoiceMode('update');
                              onOpenTaxInvoiceModal();
                              setTaxInvoiceId(row?.original?.taxInvoiceId);

                              const { data } = await axios.get(
                                `${process.env.NEXT_PUBLIC_API_URL}/api/service/taxInvoice/${row?.original?.taxInvoiceId}`
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
                                  `${apiPath}/api/service/taxInvoice/${row?.original?.taxInvoiceId}`
                                );
                                await mutate(
                                  `/api/service?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
                            if (!row?.original?.taxInvoiceId) {
                              onOpenTaxInvoiceModal();
                              setServiceId(row?.original.id);
                            }
                          }}
                          key={'create'}
                        >
                          สร้างใบกำกับภาษี
                        </DropdownItem>
                      </DropdownMenu>
                    )}
                  </Dropdown>
                )}

                {!row?.original?.receiptId && (
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
                              onOpenReceiptModal();
                              setReceiptId(row?.original?.receiptId);

                              const { data } = await axios.get(
                                `${process.env.NEXT_PUBLIC_API_URL}/api/service/receipt/${row?.original?.receiptId}`
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
                                  `${apiPath}/api/service/receipt/${row?.original?.receiptId}`
                                );
                                await mutate(
                                  `/api/service?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
                            if (!row?.original?.receiptId) {
                              onOpenReceiptModal();
                              setServiceId(row?.original.id);
                            }
                          }}
                          key={'create'}
                        >
                          สร้างใบเสร็จรับเงิน
                        </DropdownItem>
                      </DropdownMenu>
                    )}
                  </Dropdown>
                )}
              </div>
            ))}
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
              `${process.env.NEXT_PUBLIC_API_URL}/api/service/${id}`
            );

            resetForm({
              ...data,
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
                `${process.env.NEXT_PUBLIC_API_URL}/api/service/${id}`
              );
              await mutate(
                `/api/service?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
                `/api/service?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
            เพิ่มจ้างเหมาบริการใหม่
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/service/${id}`
                          );
                        })
                      );
                    }

                    await mutate(
                      `/api/service?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
    <Layout sitename={'จ้างเหมาบริการ'}>
      {formModal()}
      {modalScreenLoading && PageLoading()}
      {formTaxInvoiceModal()}
      {formReceiptModal()}
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
          <BreadcrumbItem>การจ้างเหมาบริการ</BreadcrumbItem>
          <BreadcrumbItem>จ้างเหมาบริการ</BreadcrumbItem>
        </Breadcrumbs>

        <HeaderTitle title="จ้างเหมาบริการ" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          <CardSummary
            label={'ทั้งหมด'}
            // value={bankDashboard?.bankCount}
            suffix="รายการ"
          />
          <CardSummary
            label={'เงินทั้งหมด'}
            isMoney
            // value={bankDashboard?.bankCount}
            suffix="บาท"
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
