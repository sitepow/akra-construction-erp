const regexPhone = () => {
  return /^[0-9]+$/;
};

const errorPhone = () => {
  return 'เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น';
};

const regexEmail = () => {
  return /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
};

const errorEmail = () => {
  return 'ที่อยู่อีเมลไม่ถูกต้อง';
};

const checkEmpty = () => {
  return /\S/;
};

const errorPasswordNotMatch = () => {
  return 'รหัสผ่านไม่ตรงกัน';
};

const errorRequire = () => {
  return 'กรุณากรอกข้อมูลให้ครบถ้วน';
};

export {
  regexEmail,
  errorEmail,
  errorPasswordNotMatch,
  errorRequire,
  regexPhone,
  errorPhone,
  checkEmpty,
};
