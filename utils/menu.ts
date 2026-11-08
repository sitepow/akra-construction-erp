import {
  mdiAccountCog,
  mdiBank,
  mdiChartBellCurveCumulative,
  mdiClipboard,
  mdiCog,
  mdiDomain,
  mdiFile,
  mdiLightningBoltCircle,
  mdiServerPlus,
  mdiShopping,
  mdiSignCaution,
  mdiStoreCog,
  mdiStoreSettings,
  mdiTools,
  mdiWarehouse,
} from '@mdi/js';

interface MenuItemData {
  id?: number;
  title: string;
  url: string;
  newTap?: boolean;
  subCategories?: MenuItemData[];
  disabled?: boolean;
  icon?: any;
  alert?: string;
  lock?: boolean;
}

export function menu(): MenuItemData[] {
  return [
    {
      id: 1,
      title: 'ภาพรวมผู้บริหาร',
      url: '/',
      icon: mdiChartBellCurveCumulative,
    },
    {
      id: 2,
      title: 'โหมดใช้งานง่าย',
      url: '',
      icon: mdiLightningBoltCircle,
    },
    {
      id: 3,
      title: 'บริการธนาคารกสิกรไทย',
      url: '',
      subCategories: [
        {
          title: 'K CORPORATE CONNECT',
          newTap: true,
          url: 'https://www.kasikornbank.com/TH/k-online/k-corporate-connect',
          icon: mdiDomain,
        },
        {
          title: 'K-BIZ',
          newTap: true,
          url: 'https://kbiz.kasikornbank.com/authen',
          icon: mdiBank,
        },
      ],
    },
    {
      id: 4,
      title: 'โครงการจัดซื้อจัดจ้าง',
      url: '',
      icon: mdiDomain,
      subCategories: [
        { title: 'บริหารโครงการ', url: '/protect/project', icon: mdiCog },
        {
          title: 'โครงการล่าช้า',
          url: '/protect/project/late',
          icon: mdiSignCaution,
        },
        {
          title: 'ใบเสร็จค้ำประกัน',
          url: '/protect/paper/guarantee',
          icon: mdiFile,
        },
        {
          title: 'ใบเสร็จตีตราสาร',
          url: '/protect/paper/stamp',
          icon: mdiFile,
        },
      ],
    },
    // {
    //   id: 5,
    //   title: 'ธนาคาร SME',
    //   url: '',
    //   icon: mdiBank,
    //   subCategories: [
    //     { title: 'โอนสิทธิสัญญา', url: '', icon: mdiClipboard },
    //     { title: 'รับเงินสิทธิสัญญา', url: '', icon: mdiBank },
    //   ],
    // },
    {
      id: 6,
      title: 'หนังสือสัญญาจ้าง',
      url: '',
      icon: mdiFile,
      subCategories: [
        {
          title: 'แจ้งการดำเนินงาน',
          url: '/protect/contract/work',
          icon: mdiClipboard,
        },
        {
          title: 'แผนการดำเนินงาน',
          url: '/protect/contract/construct',
          icon: mdiTools,
        },
        {
          title: 'วิศวกรโครงการ',
          url: '/protect/contract/engineer',
          icon: mdiAccountCog,
        },
        {
          title: 'ช่างควบคุมงาน',
          url: '/protect/contract/worker',
          icon: mdiTools,
        },
      ],
    },
    {
      id: 7,
      title: 'สินค้าและอะไหล่',
      url: '',
      icon: mdiStoreCog,
      subCategories: [
        { title: 'รายชื่อสินค้า', url: '/protect/product', icon: mdiClipboard },
        {
          title: 'หมวดหมู่สินค้า',
          url: '/protect/product/category',
          icon: mdiCog,
        },
      ],
    },
    {
      id: 8,
      title: 'รายชื่อผู้ติดต่อ',
      url: '',
      icon: mdiStoreSettings,
      subCategories: [
        { title: 'ลูกค้า', url: '/protect/customer', icon: mdiAccountCog },
        { title: 'ซัพพลายเออร์', url: '/protect/supplier', icon: mdiDomain },
      ],
    },
    {
      id: 9,
      title: 'คลังสินค้าและสต็อก',
      url: '',
      icon: mdiWarehouse,
      subCategories: [
        { title: 'คลังสินค้า', url: '/protect/warehouse', icon: mdiWarehouse },
        {
          title: 'เบิกสินค้า/คืนสินค้า',
          url: '/protect/warehouse/inventory',
          icon: mdiClipboard,
        },
        {
          title: 'หมวดหมู่คลังสินค้า',
          url: '/protect/warehouse/category',
          icon: mdiCog,
        },
        {
          title: 'สถานที่จัดเก็บ',
          url: '/protect/warehouse/zone',
          icon: mdiStoreCog,
        },
      ],
    },
    {
      id: 10,
      title: 'การซื้อสินค้า',
      url: '',
      icon: mdiShopping,
      subCategories: [
        {
          title: 'ใบสั่งซื้อสินค้า',
          url: '/protect/account/po',
          icon: mdiFile,
        },
        {
          title: 'ใบรับสินค้า',
          url: '/protect/receive/product',
          icon: mdiFile,
        },
      ],
    },
    {
      id: 11,
      title: 'การขายสินค้า',
      url: '',
      icon: mdiShopping,
      subCategories: [
        { title: 'ใบเสนอราคา', url: '/protect/account/quo', icon: mdiFile },
        {
          title: 'ใบส่งสินค้า',
          url: '/protect/account/deliveryNote',
          icon: mdiFile,
        },
        {
          title: 'ใบกำกับภาษี',
          url: '/protect/account/taxInvoice',
          icon: mdiFile,
        },
        {
          title: 'ใบเสร็จรับเงิน',
          url: '/protect/account/receipt',
          icon: mdiFile,
        },
      ],
    },
    {
      id: 12,
      title: 'การซ่อมบำรุง',
      url: '',
      icon: mdiTools,
      subCategories: [
        { title: 'ซ่อมบำรุง', url: '/protect/repair', icon: mdiTools },
        {
          title: 'จ่ายค่าจ้าง',
          url: '/protect/repair/payment',
          icon: mdiClipboard,
        },
      ],
    },
    {
      id: 13,
      title: 'พนักงาน',
      url: '',
      icon: mdiAccountCog,
      subCategories: [
        { title: 'พนักงาน', url: '/protect/employee', icon: mdiAccountCog },
        { title: 'แผนก', url: '/protect/employee/department', icon: mdiDomain },
        { title: 'เงินเดือน', url: '', icon: mdiBank },
        {
          title: 'สิทธิ์การเข้าถึง',
          url: '/protect/employee/permission',
          icon: mdiCog,
        },
      ],
    },
    {
      id: 15,
      title: 'การจ้างเหมาช่วง',
      url: '',
      icon: mdiClipboard,
      subCategories: [
        {
          title: 'จ้างเหมาช่วง',
          url: '/protect/subcontractor',
          icon: mdiClipboard,
        },
        {
          title: 'จ่ายค่าจ้าง',
          url: '/protect/subcontractor/payment',
          icon: mdiBank,
        },
      ],
    },
    {
      id: 16,
      title: 'การจ้างเหมาบริการ',
      url: '',
      icon: mdiServerPlus,
      subCategories: [
        {
          title: 'จ้างเหมาบริการ',
          url: '/protect/service',
          icon: mdiServerPlus,
        },
        {
          title: 'ใบกำกับภาษี',
          url: '/protect/service/taxInvoice',
          icon: mdiFile,
        },
        {
          title: 'ใบเสร็จรับเงิน',
          url: '/protect/service/receipt',
          icon: mdiFile,
        },
      ],
    },
    {
      id: 17,
      title: 'ข้อมูลบริษัท',
      url: '',
      icon: mdiCog,
      subCategories: [
        { title: 'รายชื่อบริษัท', url: '/protect/company', icon: mdiDomain },
        {
          title: 'ธนาคารและบัญชี',
          url: '/protect/company/bank',
          icon: mdiBank,
        },
      ],
    },
  ];
}
