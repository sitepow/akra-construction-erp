import { useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  LineChart,
} from 'recharts';
import { Alert, Select, SelectItem } from '@nextui-org/react';
import HeaderTitle from '@/components/HeaderTitle';
import {
  MaterialReactTable,
  MRT_ColumnDef,
  useMaterialReactTable,
} from 'material-react-table';
import useSWR from 'swr';
import CardSummary from '@/components/CardSummary';
import { formatAmount, formatThaiDate, fetcher } from '@/utils';
import getSession from '@/utils/session';

export default function Page() {
  const { session } = getSession() as any;
  const months = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ];
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const years = Array.from({ length: 10 }, (_, index) =>
    String(currentYear - index)
  );
  const { data: projectLatests } = useSWR(
    `/api/chart?companyId=${session?.company?.id}&year=${selectedYear}`,
    fetcher
  );

  const { data: projectLates } = useSWR(
    `/api/chart?companyId=${session?.company?.id}&year=${parseInt(selectedYear) - 1}`,
    fetcher
  );

  const calculateMonthlyFinance = (projects: any, selectedYear: any) => {
    const results = months.map((month, index) => {
      const monthIndex = index + 1;
      const monthString = monthIndex < 10 ? `0${monthIndex}` : `${monthIndex}`;
      const fullMonthYear = `${selectedYear}-${monthString}`;

      const monthStart = new Date(`${fullMonthYear}-01`);
      const monthEnd = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth() + 1,
        0
      );

      let monthIncome = 0;
      let totalPenalty = 0;

      projects?.forEach((project: any) => {
        const startDate = project.contractDate
          ? new Date(project.contractDate)
          : null;
        const endDate = project.contractEndDate
          ? new Date(project.contractEndDate)
          : null;
        const completeDate = project.completeDate
          ? new Date(project.completeDate)
          : null;

        if (!startDate && endDate) {
          if (
            endDate.getFullYear() === monthStart.getFullYear() &&
            endDate.getMonth() === monthStart.getMonth()
          ) {
            monthIncome += project.contractAmount;
          }
        } else if (startDate && !endDate) {
          if (
            startDate.getFullYear() === monthStart.getFullYear() &&
            startDate.getMonth() === monthStart.getMonth()
          ) {
            monthIncome += project.contractAmount;
          }
        } else if (startDate && endDate) {
          const projectDuration =
            (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) + 1;
          const dailyIncome = project.contractAmount / projectDuration;

          if (startDate <= monthEnd && endDate >= monthStart) {
            const projectStart =
              startDate > monthStart ? startDate : monthStart;
            const projectEnd = endDate < monthEnd ? endDate : monthEnd;

            const daysInMonth =
              (projectEnd.getTime() - projectStart.getTime()) /
                (1000 * 3600 * 24) +
              1;

            monthIncome += dailyIncome * daysInMonth;
          }

          if (completeDate && completeDate > endDate) {
            const penaltyStart = endDate > monthStart ? endDate : monthStart;
            const penaltyEnd =
              completeDate < monthEnd ? completeDate : monthEnd;

            if (penaltyStart <= penaltyEnd) {
              const overdueDays =
                (penaltyEnd.getTime() - penaltyStart.getTime()) /
                  (1000 * 3600 * 24) +
                1;
              totalPenalty += overdueDays * project.fineRate;
            }
          }
        }
      });

      return {
        name: month,
        income: monthIncome,
        penalty: totalPenalty,
        expenses: 0,
        netIncome: monthIncome - totalPenalty,
      };
    });

    return results;
  };

  const calculateMonthlyFinanceForProject = (
    project: any,
    selectedYear: any
  ) => {
    const results = months.map((month, index) => {
      const monthIndex = index + 1;
      const monthString = monthIndex < 10 ? `0${monthIndex}` : `${monthIndex}`;
      const fullMonthYear = `${selectedYear}-${monthString}`;

      const monthStart = new Date(`${fullMonthYear}-01`);
      const monthEnd = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth() + 1,
        0
      );

      let monthIncome = 0;
      let totalPenalty = 0;

      const startDate = project.contractDate
        ? new Date(project.contractDate)
        : null;
      const endDate = project.contractEndDate
        ? new Date(project.contractEndDate)
        : null;
      const completeDate = project.completeDate
        ? new Date(project.completeDate)
        : null;

      if (!startDate && endDate) {
        if (
          endDate.getFullYear() === monthStart.getFullYear() &&
          endDate.getMonth() === monthStart.getMonth()
        ) {
          monthIncome += project.contractAmount;
        }
      } else if (startDate && !endDate) {
        if (
          startDate.getFullYear() === monthStart.getFullYear() &&
          startDate.getMonth() === monthStart.getMonth()
        ) {
          monthIncome += project.contractAmount;
        }
      } else if (startDate && endDate) {
        const projectDuration =
          (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) + 1;
        const dailyIncome = project.contractAmount / projectDuration;

        if (startDate <= monthEnd && endDate >= monthStart) {
          const projectStart = startDate > monthStart ? startDate : monthStart;
          const projectEnd = endDate < monthEnd ? endDate : monthEnd;

          const daysInMonth =
            (projectEnd.getTime() - projectStart.getTime()) /
              (1000 * 3600 * 24) +
            1;

          monthIncome += dailyIncome * daysInMonth;
        }

        if (completeDate && completeDate > endDate) {
          const penaltyStart = endDate > monthStart ? endDate : monthStart;
          const penaltyEnd = completeDate < monthEnd ? completeDate : monthEnd;

          if (penaltyStart <= penaltyEnd) {
            const overdueDays =
              (penaltyEnd.getTime() - penaltyStart.getTime()) /
                (1000 * 3600 * 24) +
              1;
            totalPenalty += overdueDays * project.fineRate;
          }
        }
      }

      return {
        name: month,
        income: monthIncome,
        penalty: totalPenalty,
        expenses: 0,
        netIncome: monthIncome - totalPenalty,
      };
    });

    return results;
  };

  const chartDataLatest = calculateMonthlyFinance(projectLatests, selectedYear);
  const chartDataLate = calculateMonthlyFinance(
    projectLates,
    parseInt(selectedYear) - 1
  );

  const totalIncome = chartDataLatest.reduce(
    (sum, month) => sum + month.income,
    0
  );
  const totalPenalty = chartDataLatest.reduce(
    (sum, month) => sum + month.penalty,
    0
  );

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'ชื่อโครงการ',
        size: 450,
      },
      {
        accessorKey: 'organization',
        header: 'หน่วยงาน',
        size: 250,
      },
      {
        accessorKey: 'contractAmount',
        header: 'มูลค่าสัญญา',
        Cell: ({ cell }) => formatAmount(cell.getValue() as number),
      },
      {
        accessorKey: 'contractDate',
        header: 'วันที่เริ่มสัญญา',
        Cell: ({ cell }) => formatThaiDate(cell.getValue() as string),
      },
      {
        accessorKey: 'contractEndDate',
        header: 'วันที่สิ้นสุดสัญญา',
        Cell: ({ cell }) => formatThaiDate(cell.getValue() as string),
      },
    ],
    []
  );

  const projectColumns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'เดือน',
      },
      {
        accessorKey: 'income',
        header: 'รายรับ (บาท)',
        Cell: ({ cell }: any) => {
          return formatAmount(cell.getValue());
        },
      },
      {
        accessorKey: 'penalty',
        header: 'ค่าปรับ (บาท)',
        Cell: ({ cell }: any) => {
          return formatAmount(cell.getValue());
        },
      },
      {
        accessorKey: 'expenses',
        header: 'รายจ่าย (บาท)',
        Cell: ({ cell }: any) => {
          return formatAmount(cell.getValue());
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.income - row?.penalty || 0;
        },
        Cell: ({ cell }: any) => {
          return formatAmount(cell.getValue());
        },
        header: 'รายได้สุทธิ (บาท)',
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: projectLatests || [],
    enableGlobalFilter: true,
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableGrouping: true,
    enableColumnPinning: true,
    enableFacetedValues: true,
    initialState: {
      columnVisibility: {
        id: false,
      },
      columnPinning: {
        left: ['mrt-row-expand', 'mrt-row-select'],
        right: ['mrt-row-actions'],
      },
    },
    renderDetailPanel: ({ row }) => {
      const project = row.original;
      const monthlyData = calculateMonthlyFinanceForProject(
        project,
        selectedYear
      );

      return (
        <div className="w-fit flex flex-col gap-3.5">
          <Alert
            title="แจ้งเตือน"
            description={`นี่เป็นการคำนวณรายได้เฉพาะจากโครงการนี้ ที่แบ่งรายได้จากการหารเฉลี่ยตามเดือนที่รับงานโครงการตามระยะเวลาการทำงานจริง ภายในปี ${selectedYear}`}
          />

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                content={({ payload, label, active }) => {
                  if (active && payload && payload.length) {
                    const truncatedLabel =
                      label.length > 35
                        ? `${label.substring(0, 35)}...`
                        : label;
                    return (
                      <div className="bg-white border shadow-smallall dark:border-dark dark:bg-[#18181b] p-2.5 rounded-large">
                        <p className="label">{truncatedLabel}</p>
                        {payload.map((entry: any, index) => (
                          <p key={index} style={{ color: entry.color }}>
                            {entry.name}: ฿{formatAmount(entry.value)}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#4CAF50"
                fill="#4CAF50"
                name="รายรับ"
              />
              <Line
                type="monotone"
                dataKey="penalty"
                stroke="#FF5722"
                fill="#FF5722"
                name="ค่าปรับ"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#F44336"
                fill="#F44336"
                name="รายจ่าย"
              />
              <Line
                type="monotone"
                dataKey="netIncome"
                stroke="#4C585B"
                fill="#4C585B"
                name="รายได้สุทธิ"
              />
            </LineChart>
          </ResponsiveContainer>

          <MaterialReactTable
            enableBottomToolbar={false}
            enableTopToolbar={false}
            columns={projectColumns}
            data={monthlyData}
            enableColumnOrdering={false}
            enableSorting={false}
            enablePagination={false}
            muiTableContainerProps={{ sx: { maxHeight: 300 } }}
          />
        </div>
      );
    },
  });

  return (
    <Layout sitename={'ภาพรวมผู้บริหาร'}>
      <HeaderTitle
        title="ภาพรวมผู้บริหาร"
        control={
          <Select
            defaultSelectedKeys={[selectedYear]}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-36"
            variant="bordered"
            label="ปีของข้อมูล"
          >
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </Select>
        }
      />

      <div className="grid lg:grid-cols-2 gap-2.5">
        <div className="w-full">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartDataLatest}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <Tooltip
                content={({ payload, label, active }) => {
                  if (active && payload && payload.length) {
                    const truncatedLabel =
                      label.length > 35
                        ? `${label.substring(0, 35)}...`
                        : label;
                    return (
                      <div className="bg-white shadow-smallall border dark:border-dark dark:bg-[#18181b] p-2.5 rounded-large">
                        <p className="label">{truncatedLabel}</p>
                        {payload.map((entry: any, index) => (
                          <p key={index} style={{ color: entry.color }}>
                            {entry.name}: ฿{formatAmount(entry.value)}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#4CAF50"
                fill="#4CAF50"
                name="รายรับ (ปีปัจจุบัน)"
              />
              <Line
                type="monotone"
                dataKey="penalty"
                stroke="#FF5722"
                fill="#FF5722"
                name="ค่าปรับ (ปีปัจจุบัน)"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#F44336"
                fill="#F44336"
                name="รายจ่าย (ปีปัจจุบัน)"
              />
              <Line
                type="monotone"
                dataKey="netIncome"
                stroke="#4C585B"
                fill="#4C585B"
                name="รายได้สุทธิ (ปีปัจจุบัน)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartDataLate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <Tooltip
                content={({ payload, label, active }) => {
                  if (active && payload && payload.length) {
                    const truncatedLabel =
                      label.length > 35
                        ? `${label.substring(0, 35)}...`
                        : label;
                    return (
                      <div className="bg-white shadow-smallall border dark:border-dark dark:bg-[#18181b] p-2.5 rounded-large">
                        <p className="label">{truncatedLabel}</p>
                        {payload.map((entry: any, index) => (
                          <p key={index} style={{ color: entry.color }}>
                            {entry.name}: ฿{formatAmount(entry.value)}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#4CAF50"
                fill="#4CAF50"
                name="รายรับ (ปีก่อนหน้า)"
              />
              <Line
                type="monotone"
                dataKey="penalty"
                stroke="#FF5722"
                fill="#FF5722"
                name="ค่าปรับ (ปีก่อนหน้า)"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#F44336"
                fill="#F44336"
                name="รายจ่าย (ปีก่อนหน้า)"
              />
              <Line
                type="monotone"
                dataKey="netIncome"
                stroke="#4C585B"
                fill="#4C585B"
                name="รายได้สุทธิ (ปีก่อนหน้า)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        <CardSummary
          label="โครงการทั้งหมด"
          value={projectLatests?.length}
          suffix="โครงการ"
        />
        <CardSummary
          label="รายรับทั้งหมด"
          isMoney
          value={totalIncome}
          suffix="บาท"
        />
        <CardSummary
          label="ค่าปรับทั้งหมด"
          isMoney
          value={totalPenalty}
          suffix="บาท"
        />
        <CardSummary label="รายจ่ายทั้งหมด" isMoney suffix="บาท" />
        <CardSummary
          label="รายได้สุทธิทั้งหมด"
          isMoney
          value={totalIncome - totalPenalty}
          suffix="บาท"
        />
      </div>

      <MaterialReactTable table={table} />
    </Layout>
  );
}
