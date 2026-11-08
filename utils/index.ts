import jwt from 'jsonwebtoken';
import { cleanEnv, str, port } from 'envalid';
import axios from 'axios';
import { menu } from './menu';

export const autoRedirectCurrentPermission = (session: any, router: any) => {
  if (session && !session?.isLoggedIn) {
    router.replace('/login');
  }

  const permissions = JSON.parse(session?.permissions || session || '[]');
  const menuLists = menu();

  const permissionFormat = permissions.filter(
    (item: any) => item?.permissions?.read
  );

  const menuFormat = menuLists.filter(
    (menuItem: any) =>
      menuItem?.url ||
      menuItem?.subCategories?.some((subItem: any) => !subItem?.newTap)
  );

  const menuFilter = permissionFormat.reduce(
    (acc: any[], permissionItem: any) => {
      const matchingMenus = menuFormat.filter(
        (menuItem: any) => menuItem?.id === permissionItem?.id
      );

      if (matchingMenus.length > 0) {
        const fomatSubcategories = matchingMenus[0]?.subCategories?.filter(
          (subItem: any) => subItem?.url && !subItem?.newTap
        );
        acc.push({
          ...matchingMenus[0],
          subCategories: fomatSubcategories,
        });
      }
      return acc;
    },
    []
  );

  if (menuFilter && menuFilter?.length !== 0) {
    const firstCanAccess = menuFilter[0];

    if (
      firstCanAccess?.subCategories &&
      firstCanAccess?.subCategories?.length !== 0
    ) {
      router.replace(firstCanAccess.subCategories[0].url);
    } else {
      router.replace(firstCanAccess?.url);
    }
  } else {
    router.replace('/');
  }
};

export const env = cleanEnv(process.env, {
  DB_USER: str({ default: '' }),
  DB_PASS: str({ default: '' }),
  DB_NAME: str({ default: '' }),
  DB_HOST: str({ default: '' }),
  NEXT_PUBLIC_COOKIE_NAME: str({ default: '' }),
  NEXT_PUBLIC_COOKIE_PASS: str({ default: '' }),
  JWT_SECRET: str({ default: '' }),
  JWT_REFRESH_SECRET: str({ default: '' }),
  MAIL_HOST: str({ default: '' }),
  MAIL_PORT: port({ default: 587 }),
  MAIL_NAME: str({ default: '' }),
  MAIL_USER: str({ default: '' }),
  MAIL_PASS: str({ default: '' }),
  STRIPE_SECRET_KEY: str({ default: '' }),
  STRIPE_WEBHOOK_SECRET: str({ default: '' }),
  LINE_NOTIFY_TOKEN: str({ default: '' }),
  SECRET_KEY: str({ default: '' }),
});

export const createTokens = (user: any) => ({
  accessToken: () =>
    jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, {
      expiresIn: '15m',
    }),
  refreshToken: () =>
    jwt.sign({ id: user.id, email: user.email }, env.JWT_REFRESH_SECRET, {
      expiresIn: '1d',
    }),
});

export const verifyTokens = (token: any) => ({
  accessToken: () => jwt.verify(token, env.JWT_SECRET),
  refreshToken: () => jwt.verify(token, env.JWT_REFRESH_SECRET),
});

export const getRefreshToken = async (refreshToken: any) => {
  if (!refreshToken) throw new Error('No refresh token provided');

  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any;
    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    return { accessToken: newAccessToken };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError)
      throw new Error('Refresh token expired');
    if (err instanceof jwt.JsonWebTokenError)
      throw new Error('Invalid refresh token');
    throw new Error('Unable to process refresh token');
  }
};

export const textCut = (text: any, limit: any) =>
  text && text.length > limit ? `${text.slice(0, limit)}...` : text || '';

export const apiPath = process.env.NEXT_PUBLIC_API_URL;

export const formatThaiFullDate = (dateString: any) => {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
};

export const formatThaiDate = (dateString: any) => {
  if (!dateString || dateString === '0000-00-00') return '-';
  const [year, month, day] = dateString.split('-').map(Number);
  return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${(year + 543).toString()}`;
};

export const formatThaiDateTime = (dateString: any) => {
  if (!dateString || dateString === '0000-00-00') return '-';
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${(date.getFullYear() + 543).toString()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

export const formatAmount = (amount: any) =>
  amount != null
    ? Number(amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '0.00';

export function convertDateJsonToDbSingle(dateJson: any) {
  if (!dateJson) return null;

  let date;
  if (dateJson) {
    const { year, month, day } = dateJson;
    date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  } else {
    date = null;
  }

  return date;
}

export function convertDateJsonToDbRange(dateRangeJson: any) {
  if (!dateRangeJson?.start && !dateRangeJson?.end)
    return { dateStart: null, dateEnd: null };

  let dateStart;
  let dateEnd;

  if (dateRangeJson) {
    if (dateRangeJson?.start) {
      const { year, month, day } = dateRangeJson?.start;
      dateStart = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    } else {
      dateStart = null;
    }

    if (dateRangeJson?.end) {
      const { year, month, day } = dateRangeJson?.end;
      dateEnd = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    } else {
      dateEnd = null;
    }
  }

  return { dateStart, dateEnd };
}

export const banks = [
  'ธนาคารกรุงเทพ (Bangkok Bank)',
  'ธนาคารกสิกรไทย (Kasikorn Bank)',
  'ธนาคารกรุงไทย (Krungthai Bank)',
  'ธนาคารทหารไทยธนชาต (TTB Bank)',
  'ธนาคารไทยพาณิชย์ (Siam Commercial Bank)',
  'ธนาคารกรุงศรีอยุธยา (Krungsri Bank)',
  'ธนาคารออมสิน (Government Savings Bank)',
  'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (BAAC)',
  'ธนาคารยูโอบี (UOB)',
  'ธนาคารซีไอเอ็มบี (CIMB Thai)',
];

export const accountTypes = [
  'บัญชีออมทรัพย์ (Savings Account)',
  'บัญชีกระแสรายวัน (Current Account)',
  'บัญชีเงินฝากประจำ (Fixed Deposit Account)',
  'บัญชีออมทรัพย์พิเศษ (Special Savings Account)',
  'พร้อมเพย์ (PromptPay)',
];

export const fetcher = (url: string) => axios.get(url).then((res) => res.data);
