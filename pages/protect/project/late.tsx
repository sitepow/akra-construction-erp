import HeaderTitle from '@/components/HeaderTitle';
import Layout from '@/components/Layout';
import {
  BreadcrumbItem,
  Breadcrumbs,
  Chip,
  Input,
  Pagination,
  Select,
  SelectItem,
} from '@nextui-org/react';
import router from 'next/router';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { useMemo, useState } from 'react';
import CardSummary from '@/components/CardSummary';

import { mdiFilterOffOutline, mdiFilterOutline } from '@mdi/js';
import useSWR, { mutate } from 'swr';
import Icon from '@mdi/react';
import { CircleAlert, CircleCheck, Clock, Search, XIcon } from 'lucide-react';
import { formatThaiDate, formatAmount, fetcher } from '@/utils';
import getSession from '@/utils/session';

export default function Page() {
  const { session } = getSession() as any;
  const [pagination, setPagination] = useState({ pageIndex: 1, pageItem: 20 });
  const { data: ProjectLates } = useSWR(
    `/api/project/late?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: projectLateDashboard } = useSWR(
    `/api/project/late?type=dashboard&companyId=${session?.company?.id}`,
    fetcher
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: 'status',
        header: 'สถานะโครงการ',
        Cell: ({ cell }: any) => {
          const status = cell.getValue() || null;

          return status == 'pending' ? (
            <Chip variant="flat" color="warning" startContent={<Clock />}>
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
          const currentDate = new Date();
          currentDate.setHours(0, 0, 0, 0);
          const endDate =
            row.contractEndDate === '0000-00-00' || !row.contractEndDate
              ? null
              : new Date(row.contractEndDate);
          if (endDate) {
            endDate.setHours(0, 0, 0, 0);
          }
          if (!endDate) {
            return { status: 'กำลังรอวันสิ้นสุดสัญญา', color: 'default' };
          }
          const remainingTime = endDate.getTime() - currentDate.getTime();
          const remainingDays = Math.floor(
            remainingTime / (1000 * 60 * 60 * 24)
          );
          if (currentDate.toDateString() === endDate.toDateString()) {
            return { status: 'วันสุดท้ายของสัญญา', color: 'warning' };
          }
          if (currentDate > endDate) {
            const lateDays = Math.floor(
              (currentDate.getTime() - endDate.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            return { status: `เลยกำหนด ${lateDays} วัน`, color: 'danger' };
          }
          if (remainingDays > 0) {
            return { status: `${remainingDays} วัน`, color: 'success' };
          }
          return { status: 'หมดอายุแล้ว', color: 'warning' };
        },
        header: 'ระยะเวลาสัญญาคงเหลือ',
        size: 250,
        Cell: ({ cell }: any) => {
          const { status } = cell.getValue();

          return (
            <Chip variant="flat" color="danger" startContent={<CircleAlert />}>
              {status}
            </Chip>
          );
        },
      },
      {
        accessorFn: (row: any) => {
          const startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          const endDate =
            row.contractEndDate === '0000-00-00' || !row.contractEndDate
              ? null
              : new Date(row.contractEndDate);
          if (endDate) {
            endDate.setHours(0, 0, 0, 0);
          }
          if (!endDate) {
            return { status: 'กำลังรอวันสิ้นสุดสัญญา', color: 'default' };
          }
          const totalTime = endDate.getTime() - startDate.getTime();
          const totalDays = Math.floor(totalTime / (1000 * 60 * 60 * 24));
          if (totalDays < 0) {
            return { status: `-${Math.abs(totalDays)} วัน`, color: 'warning' };
          } else if (totalDays === 0) {
            return { status: '1 วัน', color: 'warning' };
          }
          return { status: `${totalDays} วัน`, color: 'success' };
        },
        header: 'ระยะเวลาของสัญญา',
        Cell: ({ cell }: any) => {
          const { status } = cell.getValue();
          return status;
        },
      },
      {
        accessorKey: 'name',
        header: 'โครงการ',
        size: 450,
        Cell: ({ cell }: any) => cell.getValue() || '-',
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
        accessorKey: 'contractAmount',
        muiTableBodyCellProps: {
          sx: { textAlign: 'right' },
        },
        header: 'จำนวนเงินตามสัญญา',
        Cell: ({ cell }: any) => formatAmount(cell.getValue()),
      },
      {
        accessorKey: 'fineRate',
        muiTableBodyCellProps: {
          sx: { textAlign: 'right' },
        },
        size: 250,
        header: 'อัตราค่าปรับ (บาท/วัน)',
        Cell: ({ cell }: any) => formatAmount(cell.getValue()),
      },
      {
        accessorFn: (row: any) => {
          const currentDate = new Date();
          currentDate.setHours(0, 0, 0, 0);

          const endDate =
            row.contractEndDate === '0000-00-00' || !row.contractEndDate
              ? null
              : new Date(row.contractEndDate);

          if (endDate) {
            endDate.setHours(0, 0, 0, 0);
          }

          if (!endDate) {
            return 0;
          }

          if (currentDate > endDate) {
            const lateDays = Math.floor(
              (currentDate.getTime() - endDate.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            return lateDays;
          }

          return 0;
        },
        header: 'รวมค่าปรับทั้งหมด (บาท)',
        size: 300,
        muiTableBodyCellProps: {
          sx: { textAlign: 'right' },
        },
        Cell: ({ cell, row }: any) =>
          formatAmount(cell.getValue() * row.original.fineRate),
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    enablePagination: false,
    enableBottomToolbar: false,
    data: ProjectLates?.data || [],
    enableGlobalFilter: true,
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableGrouping: true,
    enableColumnPinning: true,
    enableFacetedValues: true,
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
    renderTopToolbar: ({ table }) => {
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
                `/api/project/late?page=${pagination?.pageIndex}&type=projects&perPage=${e.target.value}&companyId=${session?.company?.id}`
              );
            }}
            className="max-w-32 dark:text-white"
          >
            <SelectItem key={'20'}>20 รายการ</SelectItem>
            <SelectItem key={'50'}>50 รายการ</SelectItem>
            <SelectItem key={'100'}>100 รายการ</SelectItem>
          </Select>
        </div>
      );
    },
  });

  return (
    <Layout sitename={'โครงการล่าช้า'}>
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
          <BreadcrumbItem>โครงการล่าช้า</BreadcrumbItem>
        </Breadcrumbs>

        <HeaderTitle title="โครงการล่าช้า" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          <CardSummary
            label={'ล่าช้า'}
            suffix="โครงการ"
            value={projectLateDashboard?.projectCount}
          />
          <CardSummary
            label={'เงินตามสัญญา'}
            value={projectLateDashboard?.contractAmountTotal}
            isMoney
            suffix={'บาท'}
          />
          <CardSummary
            label={'เงินค่าปรับ'}
            isMoney
            className="text-danger-800"
            value={projectLateDashboard?.fineRateTotal}
            suffix={'บาท'}
          />
          <CardSummary
            label={'เงินหลังเสียค่าปรับ'}
            isMoney
            value={projectLateDashboard?.fineRateNet}
            suffix={'บาท'}
          />
        </div>

        <MaterialReactTable table={table} />

        <div className="flex justify-end">
          <Pagination
            showControls
            total={ProjectLates?.allPages}
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
