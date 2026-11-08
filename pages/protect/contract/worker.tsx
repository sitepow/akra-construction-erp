import HeaderTitle from '@/components/HeaderTitle';
import Layout from '@/components/Layout';
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
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
import * as handlebars from 'handlebars';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { MenuItem } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import TipTapEditor from '@/components/TiptapEditor';
import { Controller, useForm } from 'react-hook-form';
import useSWR, { mutate } from 'swr';
import axios from 'axios';
import { parseDate } from '@internationalized/date';
import DOMPurify from 'dompurify';
import PageLoading from '@/components/LoadingPage';
import { workerTemplete } from '@/utils/template';
import Icon from '@mdi/react';
import { mdiFilterOutline, mdiFilterOffOutline } from '@mdi/js';
import {
  ArrowDown,
  CircleCheck,
  PlusIcon,
  Printer,
  Search,
  XIcon,
} from 'lucide-react';
import CardSummary from '@/components/CardSummary';
const paperForm = {
  editorContentHtml: workerTemplete,
  projectId: '',
  dateNow: parseDate(new Date().toISOString().split('T')[0]) as any,
};
import { Notyf } from 'notyf';
import { errorRequire } from '@/utils/regex';
import {
  formatThaiFullDate,
  convertDateJsonToDbSingle,
  formatThaiDateTime,
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
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [paperSelectId, setPaperSelectId] = useState<any>();
  const [modalScreenLoading, setModalScreenLoading] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [isRenderPdf, setIsRenderPdf] = useState(false);

  const {
    register: registerPaperEditorForm,
    control: controlPaperEditorForm,
    handleSubmit: handleSubmitPaperEditorForm,
    reset: resetPaperEditorForm,
    getValues: getValuesPaperEditorForm,
    formState: { errors: errorsPaperEditorForm },
  } = useForm({ defaultValues: paperForm });

  const {
    isOpen: isOpenPaperEditorModal,
    onOpen: onOpenPaperEditorModal,
    onClose: onClosePaperEditorModal,
  } = useDisclosure();

  const [pagination, setPagination] = useState({ pageIndex: 1, pageItem: 20 });
  const { data: papers } = useSWR(
    `/api/contract/paper?page=${pagination?.pageIndex}&type=papers&perPage=${pagination?.pageItem}&category=worker&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: projectDropdown } = useSWR(
    `/api/contract/paper?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );

  const paperEditorModal = () => {
    return (
      <Modal
        scrollBehavior="inside"
        isDismissable={false}
        size="5xl"
        isOpen={isOpenPaperEditorModal}
        onClose={() => {
          resetPaperEditorForm(paperForm);
          setIsRenderPdf(false);
          onClosePaperEditorModal();
        }}
      >
        <ModalContent>
          <ModalHeader>
            {formMode == 'create'
              ? 'เพิ่มช่างควบคุมงานใหม่'
              : 'แก้ไขช่างควบคุมงาน'}
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-5">
              <div className="grid sm:grid-cols-2 gap-2.5">
                <Controller
                  control={controlPaperEditorForm}
                  name="dateNow"
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      showMonthAndYearPickers
                      variant="bordered"
                      label="วันที่เอกสาร"
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
                  {...registerPaperEditorForm('projectId', {
                    required: {
                      value: true,
                      message: errorRequire(),
                    },
                  })}
                  isInvalid={!!errorsPaperEditorForm.projectId}
                  errorMessage={errorsPaperEditorForm?.projectId?.message}
                  label="โครงการ"
                  isRequired
                >
                  {projectDropdown &&
                    projectDropdown?.map((item: any) => {
                      return (
                        <SelectItem key={item?.id}>{item?.name}</SelectItem>
                      );
                    })}
                </Select>
              </div>

              <Controller
                control={controlPaperEditorForm}
                name="editorContentHtml"
                render={({ field: { value, onChange } }) => (
                  <TipTapEditor
                    isModal
                    initialContent={value}
                    setEditorContent={onChange}
                  />
                )}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-end gap-2 flex-wrap">
              <Button
                radius="full"
                isLoading={isApiLoading}
                variant="bordered"
                startContent={<Printer className="opacity-50" />}
                onClick={handleSubmitPaperEditorForm(async (data) => {
                  try {
                    setIsRenderPdf(true);
                    const projectFind = projectDropdown?.find(
                      (item: any) => item?.id == data?.projectId
                    );

                    const editorFormat = {
                      dateNow: formatThaiFullDate(
                        convertDateJsonToDbSingle(data?.dateNow) as any
                      ),
                      ...projectFind,
                      contractDate: formatThaiFullDate(
                        projectFind?.contractDate
                      ),
                    };

                    let editorContentHtml =
                      getValuesPaperEditorForm('editorContentHtml');

                    editorContentHtml = editorContentHtml.replace(
                      /&amp;ensp;/g,
                      '&ensp;'
                    );

                    const workPaperTemplate =
                      handlebars.compile(editorContentHtml);

                    const workPaper = workPaperTemplate(editorFormat);

                    if (previewRef.current) {
                      previewRef.current.innerHTML =
                        DOMPurify.sanitize(workPaper);

                      const opt = {
                        margin: 0,
                        image: { type: 'jpeg', quality: 1 },
                        html2canvas: { scale: 3 },
                        jsPDF: {
                          unit: 'mm',
                          format: 'a4',
                          orientation: 'portrait',
                        },
                      };

                      const html2pdf = (
                        await import('html2pdf.js/dist/html2pdf.min.js' as any)
                      ).default;

                      await html2pdf()
                        .set(opt)
                        .from(previewRef.current)
                        .toPdf()
                        .get('pdf')
                        .then((pdf: any) => {
                          window.open(pdf.output('bloburl'));
                          setIsRenderPdf(false);
                        });
                    }
                  } catch (error) {
                    setIsRenderPdf(false);
                    console.log(error);
                  }
                })}
              >
                ดูตัวอย่าง .PDF
              </Button>
              <Button
                radius="full"
                startContent={!isApiLoading && <CircleCheck />}
                className="bg-primary text-white"
                isLoading={isApiLoading}
                onClick={handleSubmitPaperEditorForm(async (data) => {
                  try {
                    setIsApiLoading(true);
                    const paperResponse =
                      formMode == 'create'
                        ? await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/contract/paper`,
                            {
                              ...data,
                              dateNow: convertDateJsonToDbSingle(data?.dateNow),
                              category: 'worker',
                              companyId: session?.company?.id,
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/contract/paper/${paperSelectId}`,
                            {
                              ...data,
                              dateNow: convertDateJsonToDbSingle(data?.dateNow),
                              category: 'worker',
                            }
                          );

                    await mutate(
                      `/api/contract/paper?page=${pagination?.pageIndex}&type=papers&perPage=${pagination?.pageItem}&category=worker&companyId=${session?.company?.id}`
                    );

                    notyf.success(paperResponse?.data?.message);
                    setIsApiLoading(false);
                    onClosePaperEditorModal();
                    resetPaperEditorForm(paperForm);
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
        header: 'รหัสประจำตัวเอกสาร',
      },
      {
        accessorFn: (row: any) => {
          return row?.project?.name;
        },
        accessorKey: 'name',
        header: 'โครงการ',
        size: 450,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorFn: (row: any) => {
          return {
            project: row?.project,
            content: row?.editorContentHtml,
            dateNow: row?.dateNow,
          };
        },
        header: 'ดาว์โหลดเอกสาร',
        Cell: ({ cell }: any) => {
          const value = cell.getValue() as any;

          return (
            <Button
              radius="full"
              variant="bordered"
              startContent={<ArrowDown className="opacity-50" />}
              onClick={async () => {
                try {
                  setIsRenderPdf(true);

                  const editorFormat = {
                    dateNow: formatThaiFullDate(value?.dateNow),
                    ...value?.project,
                    contractNumber: value?.project?.contractNo,
                    contractDate: formatThaiFullDate(
                      value?.project?.contractDate
                    ),
                  };

                  let editorContentHtml = value?.content;

                  editorContentHtml = editorContentHtml.replace(
                    /&amp;ensp;/g,
                    '&ensp;'
                  );

                  const workPaperTemplate =
                    handlebars.compile(editorContentHtml);

                  const workPaper = workPaperTemplate(editorFormat);

                  if (previewRef.current) {
                    previewRef.current.innerHTML =
                      DOMPurify.sanitize(workPaper);

                    const opt = {
                      margin: 0,
                      image: { type: 'jpeg', quality: 1 },
                      html2canvas: { scale: 3 },
                      jsPDF: {
                        unit: 'mm',
                        format: 'a4',
                        orientation: 'portrait',
                      },
                    };

                    const html2pdf = (
                      await import('html2pdf.js/dist/html2pdf.min.js' as any)
                    ).default;

                    await html2pdf()
                      .set(opt)
                      .from(previewRef.current)
                      .toPdf()
                      .get('pdf')
                      .then((pdf: any) => {
                        window.open(pdf.output('bloburl'));
                        setIsRenderPdf(false);
                      });
                  }
                } catch (error) {
                  setIsRenderPdf(false);
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
    enableRowSelection: true,
    data: papers?.data || [],
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
            setPaperSelectId(id);
            setModalScreenLoading(true);
            setFormMode('update');
            const { data } = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/contract/paper/${id}`
            );

            resetPaperEditorForm({
              ...data,
              dateNow: data?.dateNow ? parseDate(data?.dateNow) : null,
            });

            onOpenPaperEditorModal();
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
                `${process.env.NEXT_PUBLIC_API_URL}/api/contract/paper/${id}`
              );
              await mutate(
                `/api/contract/paper?page=${pagination?.pageIndex}&type=papers&perPage=${pagination?.pageItem}&category=worker&companyId=${session?.company?.id}`
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

          <div className="flex flex-wrap items-center gap-2">
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

            <Button
              radius="full"
              startContent={<PlusIcon />}
              onClick={() => {
                onOpenPaperEditorModal();
                setFormMode('create');
              }}
              className="bg-primary text-white"
            >
              เพิ่มช่างควบคุมงานใหม่
            </Button>

            {selectedRows.length > 0 && (
              <Button
                radius="full"
                startContent={<XIcon />}
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
                              `${process.env.NEXT_PUBLIC_API_URL}/api/contract/paper/${id}`
                            );
                          })
                        );
                      }
                      await mutate(
                        `/api/contract/paper?page=${pagination?.pageIndex}&type=papers&perPage=${pagination?.pageItem}&category=worker&companyId=${session?.company?.id}`
                      );
                      table.resetRowSelection();
                      setModalScreenLoading(false);
                    } catch (error) {
                      setModalScreenLoading(false);
                      console.log(error);
                    }
                  }
                }}
                variant="bordered"
                className="border-primary text-primary"
              >
                ลบข้อมูล
              </Button>
            )}
          </div>
        </div>
      );
    },
  });

  return (
    <Layout sitename={'ช่างควบคุมงาน'}>
      <div
        className={`py-5 px-16 disable-text-white leading-[1.8] tiptap ${isRenderPdf ? 'block' : 'hidden'} text-[14px]`}
        ref={previewRef}
      />

      {modalScreenLoading && PageLoading()}
      {paperEditorModal()}

      <section className="flex flex-col gap-5">
        <Breadcrumbs>
          <BreadcrumbItem
            onClick={() => {
              router.push('/');
            }}
          >
            หน้าแรก
          </BreadcrumbItem>
          <BreadcrumbItem>หนังสือสัญญาจ้าง</BreadcrumbItem>
          <BreadcrumbItem>ช่างควบคุมงาน</BreadcrumbItem>
        </Breadcrumbs>

        <HeaderTitle title="ช่างควบคุมงาน" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          <CardSummary label={'ทั้งหมด'} suffix={'ฉบับ'} />
        </div>

        <MaterialReactTable table={table} />

        <div className="flex justify-end">
          <Pagination
            showControls
            total={papers?.allPages}
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
