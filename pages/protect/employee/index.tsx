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
  Input,
  Link,
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
  User,
} from '@nextui-org/react';
import router from 'next/router';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { useEffect, useMemo, useState } from 'react';

import { mdiFilterOffOutline, mdiFilterOutline } from '@mdi/js';
import axios from 'axios';
import useSWR, { mutate } from 'swr';
import Icon from '@mdi/react';
import { Controller, useForm } from 'react-hook-form';
import PageLoading from '@/components/LoadingPage';
import { MenuItem } from '@mui/material';
import {
  ArrowUpRight,
  Building2,
  CircleAlert,
  CircleCheck,
  CircleX,
  Eye,
  EyeOff,
  Key,
  PlusIcon,
  Search,
  Settings,
  Trash,
  XIcon,
} from 'lucide-react';
import CardSummary from '@/components/CardSummary';
import { proviceJsons } from '@/utils/address/provinces';
import { subDistrictJsons } from '@/utils/address/subDistricts';
import { districtJsons } from '@/utils/address/districts';
import { zipcodeJsons } from '@/utils/address/zipcodes';
import { parseDate } from '@internationalized/date';
import { errorRequire } from '@/utils/regex';
const initForm = {
  id: '',
  companies: [],
  prefix: '',
  salary: '',
  employeeType: '',
  departmentId: null,
  permissionId: null,
  firstname: '',
  lastname: '',
  address: '',
  fullAddress: '',
  district: '',
  subDistrict: '',
  province: '',
  zipcode: '',
  telephone: '',
  email: '',
  password: '',
  nationalId: null,
  birthday: null,
  bankName: '',
  bankType: '',
  bankBranch: '',
  bankAccount: '',
  socialSecurityNumber: '',
  startDate: parseDate(new Date().toISOString().split('T')[0]) as any,
  endDate: null,
  employmentStatus: 'active',
  jobTitle: '',
  healthConditions: '',
  allergies: '',
  hospital: '',
  educationLevel: '',
  institutionName: '',
  graduationYear: '',
  workPermitNumber: '',
  visaType: '',
  visaExpiryDate: null,
};
const initDepartmentForm = {
  departmentId: null,
  name: '',
  remark: '',
};
import { Notyf } from 'notyf';
import {
  convertDateJsonToDbSingle,
  apiPath,
  formatAmount,
  formatThaiDate,
  formatThaiDateTime,
  accountTypes,
  banks,
  fetcher,
} from '@/utils';
import getSession from '@/utils/session';

export default function Page() {
  const { session } = getSession() as any;
  const [showPassword, setShowPassword] = useState(false);
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
  const [proviceId, setProviceId] = useState<any>();
  const [districtFilter, setDistrictFilter] = useState<any>();
  const [subDistrictFilter, setSubDistrictFilter] = useState<any>();
  const [zipcodeFilter, setZipcodeFilter] = useState<any>();
  const [departmentMode, setDepartmentMode] = useState('create');
  const [projectSelectId, setProjectSelectId] = useState<any>();
  const [newPassword, setNewPassword] = useState('');

  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    reset: resetForm,
    control: controlForm,
    formState: { errors: errorsForm },
  } = useForm({
    defaultValues: initForm,
  });
  const {
    handleSubmit: handleSubmitDepartmentForm,
    reset: resetDepartmentForm,
    setValue: setValueDepartmentForm,
    control: controlDepartmentForm,
  } = useForm({
    defaultValues: initDepartmentForm,
  });

  const [pagination, setPagination] = useState({ pageIndex: 1, pageItem: 20 });
  const { data: categories } = useSWR(
    `/api/employee?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: employeeDashboard } = useSWR(
    `/api/dashboard?type=employee&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: employeeDepartmentDashboard } = useSWR(
    `/api/employee/department?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: employeePermission } = useSWR(
    `/api/employee/permission?type=dropdown&companyId=${session?.company?.id}`,
    fetcher
  );
  const { data: companies } = useSWR(`/api/company?type=dropdown`, fetcher);

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
            {formMode == 'create' ? 'เพิ่มพนักงานใหม่' : 'แก้ไขพนักงาน'}
          </ModalHeader>
          <ModalBody>
            {employeeDepartmentDashboard?.length == 0 && (
              <Alert
                title="แจ้งเตือน"
                color="danger"
                description={
                  <>
                    <span>ขณะนี้ยังไม่มีข้อมูลแผนกพนักงาน</span>{' '}
                    <span
                      className="underline cursor-pointer"
                      onClick={() => {
                        onOpenDepartmentModal();
                      }}
                    >
                      เพิ่มแผนกใหม่
                    </span>
                  </>
                }
              />
            )}
            {employeePermission?.length == 0 && (
              <Alert
                title="แจ้งเตือน"
                color="danger"
                description={
                  <>
                    <span>ขณะนี้ยังไม่มีข้อมูลสิทธิ์การเข้าถึง</span>{' '}
                    <span
                      className="underline cursor-pointer"
                      onClick={() => {
                        window.open('/employee/permission', '_blank');
                      }}
                    >
                      เพิ่มสิทธิ์การเข้าถึงใหม่
                    </span>
                  </>
                }
              />
            )}

            <form className="flex flex-col gap-2.5">
              <fieldset className="border p-2.5 dark:border-dark rounded-large">
                <legend>ข้อมูลพื้นฐาน</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <Controller
                    control={controlForm}
                    name="companies"
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
                        label="บริษัท"
                        variant="bordered"
                        selectionMode="multiple"
                        isInvalid={!!error}
                        selectedKeys={value}
                        errorMessage={error?.message}
                        value={value as any}
                        onChange={(range: any) => {
                          onChange(range);
                        }}
                      >
                        {companies?.map((item: any) => {
                          return (
                            <SelectItem key={item?.id}>{item?.name}</SelectItem>
                          );
                        })}
                      </Select>
                    )}
                  />
                  <Controller
                    control={controlForm}
                    name="startDate"
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
                        label="วันที่เริ่มงาน"
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
                    control={controlForm}
                    name="endDate"
                    render={({ field: { value, onChange } }) => (
                      <DatePicker
                        showMonthAndYearPickers
                        variant="bordered"
                        label="วันที่สิ้นสุดงาน (ถ้ามี)"
                        value={value as any}
                        onChange={(range: any) => {
                          onChange(range);
                        }}
                      />
                    )}
                  />
                  <Select
                    variant="bordered"
                    label="สถานะการทำงาน"
                    {...registerForm('employmentStatus', {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                    })}
                    isInvalid={!!errorsForm.employmentStatus}
                    errorMessage={`${errorsForm.employmentStatus?.message}`}
                  >
                    <SelectItem key={'active'}>กำลังกำลังทำงานอยู่</SelectItem>
                    <SelectItem key={'resign'}>ลาออกแล้ว</SelectItem>
                  </Select>
                  <Select
                    variant="bordered"
                    label="คำนำหน้า"
                    {...registerForm('prefix', {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                    })}
                    isInvalid={!!errorsForm.prefix}
                    errorMessage={`${errorsForm.prefix?.message}`}
                  >
                    <SelectItem key={'นาย'}>นาย</SelectItem>
                    <SelectItem key={'นาง'}>นาง</SelectItem>
                    <SelectItem key={'นางสาว'}>นางสาว</SelectItem>
                  </Select>
                  <Input
                    variant="bordered"
                    label="ชื่อจริง"
                    {...registerForm('firstname', {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                    })}
                    isInvalid={!!errorsForm.firstname}
                    errorMessage={`${errorsForm.firstname?.message}`}
                  />
                  <Input
                    variant="bordered"
                    {...registerForm('lastname', {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                    })}
                    isInvalid={!!errorsForm.lastname}
                    errorMessage={`${errorsForm.lastname?.message}`}
                    label="นามสกุล"
                  />
                  <Select
                    variant="bordered"
                    label="ประเภทพนักงาน"
                    {...registerForm('employeeType', {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                    })}
                    isInvalid={!!errorsForm.employeeType}
                    errorMessage={`${errorsForm.employeeType?.message}`}
                  >
                    <SelectItem key={'พนักงานประจำ'}>พนักงานประจำ</SelectItem>
                    <SelectItem key={'พนักงานชั่วคราว'}>
                      พนักงานชั่วคราว
                    </SelectItem>
                    <SelectItem key={'พนักงานรายวัน'}>พนักงานรายวัน</SelectItem>
                    <SelectItem key={'ผู้รับเหมาช่วง'}>
                      ผู้รับเหมาช่วง
                    </SelectItem>
                  </Select>
                  <Input
                    variant="bordered"
                    {...registerForm('jobTitle')}
                    label="ตำแหน่งงาน"
                  />
                  <Select
                    variant="bordered"
                    label="แผนกพนักงาน"
                    {...registerForm('departmentId')}
                  >
                    {employeeDepartmentDashboard &&
                      employeeDepartmentDashboard?.map((item: any) => {
                        return (
                          <SelectItem key={item?.id}>{item?.name}</SelectItem>
                        );
                      })}
                  </Select>
                  <Select
                    variant="bordered"
                    label="สิทธิ์การเข้าถึง"
                    {...registerForm('permissionId', {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                    })}
                    isInvalid={!!errorsForm.permissionId}
                    errorMessage={`${errorsForm.permissionId?.message}`}
                  >
                    {employeePermission &&
                      employeePermission?.map((item: any) => {
                        return (
                          <SelectItem key={item?.id}>{item?.name}</SelectItem>
                        );
                      })}
                  </Select>
                  <Input
                    variant="bordered"
                    {...registerForm('telephone', {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                    })}
                    isInvalid={!!errorsForm.telephone}
                    errorMessage={`${errorsForm.telephone?.message}`}
                    label="เบอร์โทรศัพท์"
                  />
                  <Input
                    variant="bordered"
                    {...registerForm('email', {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                    })}
                    isInvalid={!!errorsForm.email}
                    errorMessage={`${errorsForm.email?.message}`}
                    label="อีเมล"
                  />
                  <Input
                    variant="bordered"
                    type={`${!showPassword && `password`}`}
                    endContent={
                      !showPassword ? (
                        <Eye
                          className="opacity-50 cursor-pointer"
                          onClick={() => {
                            setShowPassword(true);
                          }}
                        />
                      ) : (
                        <EyeOff
                          onClick={() => {
                            setShowPassword(false);
                          }}
                          className="opacity-50 cursor-pointer"
                        />
                      )
                    }
                    {...registerForm('password', {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                    })}
                    isInvalid={!!errorsForm.password}
                    errorMessage={`${errorsForm.password?.message}`}
                    label="รหัสผ่าน"
                  />
                  <Input
                    variant="bordered"
                    {...registerForm('nationalId', {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                    })}
                    isInvalid={!!errorsForm.nationalId}
                    errorMessage={`${errorsForm.nationalId?.message}`}
                    label="เลขบัตรประชาชน"
                  />
                  <Controller
                    control={controlForm}
                    name="birthday"
                    render={({ field: { value, onChange } }) => (
                      <DatePicker
                        showMonthAndYearPickers
                        variant="bordered"
                        label="วันเดือนปีเกิด"
                        isRequired
                        value={value as any}
                        onChange={(range: any) => {
                          onChange(range);
                        }}
                      />
                    )}
                  />
                </div>
              </fieldset>

              <fieldset className="border p-2.5 dark:border-dark rounded-large">
                <legend>บัญชีและการเงิน</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <Input
                    variant="bordered"
                    {...registerForm('salary', {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                    })}
                    isInvalid={!!errorsForm.salary}
                    errorMessage={`${errorsForm.salary?.message}`}
                    type="number"
                    label="ค่าแรง"
                  />
                  <Select
                    label="ธนาคาร"
                    variant="bordered"
                    {...registerForm('bankName', {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                    })}
                    isInvalid={!!errorsForm.bankName}
                    errorMessage={`${errorsForm.bankName?.message}`}
                  >
                    {banks.map((bank: any) => (
                      <SelectItem key={bank}>{bank}</SelectItem>
                    ))}
                  </Select>

                  <Input
                    variant="bordered"
                    label="สาขา"
                    {...registerForm('bankBranch', {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                    })}
                    isInvalid={!!errorsForm.bankBranch}
                    errorMessage={`${errorsForm.bankBranch?.message}`}
                  />

                  <Select
                    label="ประเภทบัญชี"
                    variant="bordered"
                    {...registerForm('bankType', {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                    })}
                    isInvalid={!!errorsForm.bankType}
                    errorMessage={`${errorsForm.bankType?.message}`}
                  >
                    {accountTypes.map((account: any) => (
                      <SelectItem key={account}>{account}</SelectItem>
                    ))}
                  </Select>

                  <Input
                    variant="bordered"
                    label="เลขบัญชี"
                    {...registerForm('bankAccount', {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                    })}
                    isInvalid={!!errorsForm.bankAccount}
                    errorMessage={`${errorsForm.bankAccount?.message}`}
                  />
                </div>
              </fieldset>

              <fieldset className="border p-2.5 dark:border-dark rounded-large">
                <legend>ที่อยู่</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <Input
                    variant="bordered"
                    {...registerForm('address')}
                    label="ที่อยู่ (ที่ติดต่อได้)"
                  />
                  <Select
                    variant="bordered"
                    label="จังหวัด"
                    selectedKeys={proviceId ? [proviceId] : undefined}
                    onChange={(e: any) => {
                      const proviceCode = e.target.value;
                      setProviceId(proviceCode);

                      const subDistrict = subDistrictJsons?.filter(
                        (item: any) => item?.PROVINCE_ID == proviceCode
                      );

                      const district = districtJsons?.filter(
                        (item: any) => item?.PROVINCE_ID == proviceCode
                      );

                      const zipcode = zipcodeJsons?.filter(
                        (item: any) => item?.PROVINCE_ID == proviceCode
                      );

                      setDistrictFilter(district);
                      setSubDistrictFilter(subDistrict);
                      setZipcodeFilter(zipcode);
                    }}
                  >
                    {proviceJsons?.map((item: any) => {
                      return (
                        <SelectItem key={item?.PROVINCE_ID}>
                          {item?.PROVINCE_NAME}
                        </SelectItem>
                      );
                    })}
                  </Select>

                  <Select
                    variant="bordered"
                    label="อำเภอ"
                    {...registerForm('district')}
                  >
                    {districtFilter?.map((item: any) => {
                      return (
                        <SelectItem key={item?.DISTRICT_ID}>
                          {item?.DISTRICT_NAME}
                        </SelectItem>
                      );
                    })}
                  </Select>

                  <Select
                    variant="bordered"
                    label="ตำบล"
                    {...registerForm('subDistrict')}
                  >
                    {subDistrictFilter?.map((item: any) => {
                      return (
                        <SelectItem key={item?.SUB_DISTRICT_ID}>
                          {item?.SUB_DISTRICT_NAME}
                        </SelectItem>
                      );
                    })}
                  </Select>

                  <Select
                    variant="bordered"
                    label="รหัสไปรณีย์"
                    {...registerForm('zipcode')}
                  >
                    {zipcodeFilter?.map((item: any) => {
                      return (
                        <SelectItem key={item?.ZIPCODE_ID}>
                          {item?.ZIPCODE}
                        </SelectItem>
                      );
                    })}
                  </Select>
                </div>
              </fieldset>

              <fieldset className="border p-2.5 dark:border-dark rounded-large">
                <legend>ประกันสังคม</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <Input
                    variant="bordered"
                    {...registerForm('socialSecurityNumber')}
                    label="เลขที่ประกันสังคม"
                  />
                  <Input
                    variant="bordered"
                    {...registerForm('hospital')}
                    label="โรงพยาบาลที่เอาประกัน"
                  />
                </div>
              </fieldset>

              <fieldset className="border p-2.5 dark:border-dark rounded-large">
                <legend>สุขภาพ</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <Input
                    variant="bordered"
                    {...registerForm('healthConditions')}
                    label="โรคประจำตัว"
                  />
                  <Input
                    variant="bordered"
                    {...registerForm('allergies')}
                    label="อาการแพ้ต่างๆ"
                  />
                </div>
              </fieldset>

              <fieldset className="border p-2.5 dark:border-dark rounded-large">
                <legend>การศึกษา</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <Input
                    variant="bordered"
                    {...registerForm('educationLevel')}
                    label="ระดับการศึกษา"
                  />
                  <Input
                    variant="bordered"
                    {...registerForm('institutionName')}
                    label="ชื่อสถาบันการศึกษา"
                  />
                  <Input
                    variant="bordered"
                    {...registerForm('graduationYear')}
                    label="ปีที่สำเร็จการศึกษา"
                  />
                </div>
              </fieldset>

              <fieldset className="border p-2.5 dark:border-dark rounded-large">
                <legend>เอกสารพิเศษ</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <Input
                    variant="bordered"
                    {...registerForm('workPermitNumber')}
                    label="หมายเลขใบอนุญาตทำงาน(สำหรับชาวต่างชาติ)"
                  />
                  <Input
                    variant="bordered"
                    {...registerForm('visaType')}
                    label="ประเภทวีซ่า (ถ้ามี)"
                  />
                  <Controller
                    control={controlForm}
                    name="visaExpiryDate"
                    render={({ field: { value, onChange } }) => (
                      <DatePicker
                        showMonthAndYearPickers
                        variant="bordered"
                        label="วันที่หมดอายุของวีซ่า"
                        isRequired
                        value={value as any}
                        onChange={(range: any) => {
                          onChange(range);
                        }}
                      />
                    )}
                  />
                </div>
              </fieldset>
            </form>
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-end gap-2 flex-wrap">
              {/* <Button
              radius="full"
                variant="bordered"
                startContent={<Settings className="opacity-50" />}
                onClick={() => {
                  onOpenDepartmentModal();
                }}
              >
                จัดการแผนก
              </Button> */}

              <Button
                radius="full"
                startContent={!isApiLoading && <CircleCheck />}
                className="bg-primary text-white"
                isLoading={isApiLoading}
                onClick={handleSubmitForm(async (data) => {
                  try {
                    setIsApiLoading(true);
                    const province = proviceJsons?.find(
                      (item: any) => item?.PROVINCE_ID == proviceId
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
                    const fullBank = `${data?.bankAccount} ${data?.bankName}`;
                    const fullAddress = `${data.address} ตำบล${subDistrict?.SUB_DISTRICT_NAME} อำเภอ${district?.DISTRICT_NAME} จังหวัด${province?.PROVINCE_NAME} ${zipcode?.ZIPCODE}`;
                    const paperResponse =
                      formMode == 'create'
                        ? await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/employee`,
                            {
                              ...data,
                              birthday: convertDateJsonToDbSingle(
                                data?.birthday
                              ),
                              startDate: convertDateJsonToDbSingle(
                                data?.startDate
                              ),
                              endDate: convertDateJsonToDbSingle(data?.endDate),
                              visaExpiryDate: convertDateJsonToDbSingle(
                                data?.visaExpiryDate
                              ),
                              province: proviceId,
                              companyId: session?.company?.id,
                              fullAddress,
                              fullBank,
                            }
                          )
                        : await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/employee/${projectSelectId}`,
                            {
                              ...data,
                              birthday: convertDateJsonToDbSingle(
                                data?.birthday
                              ),
                              startDate: convertDateJsonToDbSingle(
                                data?.startDate
                              ),
                              endDate: convertDateJsonToDbSingle(data?.endDate),
                              visaExpiryDate: convertDateJsonToDbSingle(
                                data?.visaExpiryDate
                              ),
                              province: proviceId,
                              companyId: session?.company?.id,
                              fullAddress,
                              fullBank,
                            }
                          );
                    await mutate(
                      `/api/employee?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
    isOpen: isOpenResetPassword,
    onOpen: onOpenResetPassword,
    onClose: onCloseResetPassword,
  } = useDisclosure();

  const formResetPasswordModal = () => {
    return (
      <Modal
        scrollBehavior="inside"
        isOpen={isOpenResetPassword}
        isDismissable={false}
        onClose={() => {
          setNewPassword('');
          onCloseResetPassword();
        }}
      >
        <ModalContent>
          <ModalHeader>รีเซ็ตรหัสผ่าน</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-2.5">
              <Alert
                title="แจ้งเตือน"
                description="ถ้าหากคุณกดปุ่ม `ขอรหัสผ่านใหม่` แสดงว่ารหัสผ่านของผู้ใช้งานท่านนั้น จะถูกรีเซ็ตเป็นรหัสผ่านใหม่ ดังนั้นโปรดแจ้งรหัสผ่านใหม่นั้นให้ผู้ใช้งานทราบด้วย"
              />
              {newPassword && (
                <Input
                  value={newPassword}
                  isReadOnly
                  variant="bordered"
                  className="text-lg font-semibold"
                  label="รหัสผ่านใหม่ของผู้ใช้งาน"
                />
              )}

              <Button
                radius="full"
                isLoading={isApiLoading}
                startContent={!isApiLoading && <Key />}
                onClick={async () => {
                  try {
                    setIsApiLoading(true);
                    const { data } = await axios.post(
                      `${process.env.NEXT_PUBLIC_API_URL}/api/user/resetPassword`,
                      {
                        employeeId: projectSelectId,
                      }
                    );

                    notyf.success(data?.message);
                    setNewPassword(data?.password);
                    setIsApiLoading(false);
                  } catch (error: any) {
                    setIsApiLoading(false);
                    notyf.error(error?.response?.data);
                    console.log(error);
                  }
                }}
                className="bg-primary text-white"
              >
                ขอรหัสผ่านใหม่
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };

  const {
    isOpen: isOpenDepartmentModal,
    onOpen: onOpenDepartmentModal,
    onClose: onCloseDepartmentModal,
  } = useDisclosure();

  const formDepartmentModal = () => {
    return (
      <Modal
        scrollBehavior="inside"
        isOpen={isOpenDepartmentModal}
        isDismissable={false}
        onClose={() => {
          resetDepartmentForm(initDepartmentForm);
          setDepartmentMode('create');
          onCloseDepartmentModal();
        }}
      >
        <ModalContent>
          <ModalHeader>จัดการแผนก</ModalHeader>
          <ModalBody>
            <form className="flex flex-col gap-2.5">
              <Controller
                control={controlDepartmentForm}
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
                    value={value as any}
                    onChange={(range: any) => {
                      onChange(range);
                    }}
                    isInvalid={!!error}
                    errorMessage={error?.message}
                    variant="bordered"
                    label="ชื่อแผนก"
                  />
                )}
              />
              <div className="flex gap-2.5 justify-end">
                <Button
                  radius="full"
                  startContent={!isApiLoading && <CircleCheck />}
                  onClick={handleSubmitDepartmentForm(async (data) => {
                    try {
                      let response;
                      if (departmentMode == 'create') {
                        response = await axios.post(
                          `${apiPath}/api/employee/department`,
                          {
                            ...data,
                            companyId: session?.company?.id,
                          }
                        );
                      } else {
                        response = await axios.put(
                          `${apiPath}/api/employee/department/${data?.departmentId}`,
                          {
                            ...data,
                          }
                        );
                      }
                      await mutate(
                        `/api/employee/department?type=dropdown&companyId=${session?.company?.id}`
                      );
                      resetDepartmentForm(initDepartmentForm);
                      setDepartmentMode('create');
                      notyf.success(response?.data?.message);
                    } catch (error: any) {
                      notyf?.error(error?.response?.data);
                      console.log(error);
                    }
                  })}
                  className="bg-primary text-white"
                >
                  {departmentMode == 'create' ? 'บันทึกข้อมูล' : 'แก้ไขข้อมูล'}
                </Button>
                {departmentMode == 'update' && (
                  <Button
                    radius="full"
                    startContent={<CircleX />}
                    onClick={() => {
                      resetDepartmentForm(initDepartmentForm);
                      setDepartmentMode('create');
                    }}
                    className="border-primary text-primary"
                    variant="bordered"
                  >
                    ยกเลิก
                  </Button>
                )}
              </div>
            </form>

            <ScrollShadow className="max-h-96">
              {employeeDepartmentDashboard?.map((item: any) => {
                return (
                  <Card className="my-1.5 border dark:border-dark" shadow="sm">
                    <CardBody>
                      <div className="w-full flex justify-between">
                        <span>{item?.name}</span>

                        <div className="flex gap-2.5">
                          <Settings
                            onClick={() => {
                              setValueDepartmentForm('name', item?.name);
                              setValueDepartmentForm('departmentId', item?.id);
                              setDepartmentMode('update');
                            }}
                            className="opacity-20 cursor-pointer hover:opacity-100"
                          />
                          <Trash
                            onClick={async () => {
                              try {
                                await axios.delete(
                                  `${apiPath}/api/employee/department/${item?.id}`
                                );
                                await mutate(
                                  `/api/employee/department?type=dropdown&companyId=${session?.company?.id}`
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
            </ScrollShadow>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'รหัสประจำตัวพนักงาน',
        size: 50,
      },
      {
        accessorKey: 'employmentStatus',
        header: 'สถานะพนักงาน',
        Cell: ({ cell }: any) => {
          const status = cell.getValue();
          return status == 'active' ? (
            <Chip color="success" variant="flat" startContent={<CircleCheck />}>
              กำลังทำงานอยู่
            </Chip>
          ) : status == 'resign' ? (
            <Chip color="danger" variant="flat" startContent={<CircleAlert />}>
              ลาออกแล้ว
            </Chip>
          ) : (
            <Chip color="danger" variant="flat" startContent={<CircleAlert />}>
              ไม่มีทราบสถานะ
            </Chip>
          );
        },
      },
      {
        accessorFn: (row: any) => {
          return row?.permission?.name || null;
        },
        accessorKey: 'permission',
        header: 'สิทธิ์การเข้าถึง',
        Cell: ({ cell }: any) => {
          const permission = cell.getValue();
          return permission ? (
            <Chip variant="flat" startContent={<Key />}>
              สิทธิ์{permission}
            </Chip>
          ) : (
            <Chip color="danger" variant="flat" startContent={<CircleAlert />}>
              ไม่มีสิทธิ์ทำอะไรเลย
            </Chip>
          );
        },
      },
      {
        accessorKey: 'companiesArray',
        header: 'บริษัท',
        Cell: ({ cell }: any) => {
          const value = cell.getValue();

          return (
            <div className="flex gap-2.5 flex-wrap">
              {value?.map((item: any) => {
                return (
                  <Chip variant="flat" startContent={<Building2 />}>
                    {item}
                  </Chip>
                );
              })}
            </div>
          );
        },
      },
      {
        accessorFn: (row: any) => {
          const prefix = row?.prefix;
          const firstname = row?.firstname;
          const lastname = row?.lastname;

          return {
            name: `${prefix}${firstname} ${lastname}`,
            email: row?.email,
          };
        },
        accessorKey: 'name',
        header: 'ชื่อ-นามสกุล',
        Cell: ({ cell }: any) => {
          const data = cell.getValue();

          return (
            <User
              name={data?.name || '-'}
              description={<Link>{data?.email || '-'}</Link>}
              avatarProps={{
                src: '/uploads/profile-no-image.png',
              }}
            />
          );
        },
      },
      {
        accessorKey: 'employeeType',
        header: 'ประเภทพนักงาน',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorFn: (row: any) => {
          return row?.department?.name ? row?.department?.name : null;
        },
        header: 'แผนกพนักงาน',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'jobTitle',
        header: 'ตำแหน่งงาน',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'salary',
        header: 'ค่าแรง',
        Cell: ({ cell }: any) => formatAmount(cell.getValue()) || '-',
      },
      {
        accessorKey: 'startDate',
        header: 'วันที่เริ่มงาน',
        Cell: ({ cell }: any) => formatThaiDate(cell.getValue()) || '-',
      },
      {
        accessorKey: 'endDate',
        header: 'วันที่สิ้นสุดงาน',
        Cell: ({ cell }: any) =>
          cell.getValue() ? formatThaiDate(cell.getValue()) : '-',
      },
      {
        accessorKey: 'fullAddress',
        header: 'ที่อยู่',
        size: 350,
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'telephone',
        header: 'เบอร์โทรศัพท์',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'email',
        header: 'อีเมล',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'nationalId',
        header: 'เลขบัตรประชาชน',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'socialSecurityNumber',
        header: 'เลขประกันสังคม',
        Cell: ({ cell }: any) => cell.getValue() || '-',
      },
      {
        accessorKey: 'birthday',
        header: 'วันเกิด',
        Cell: ({ cell }: any) => formatThaiDate(cell.getValue()) || '-',
      },
      {
        accessorKey: 'fullBank',
        size: 350,
        header: 'เลขที่บัญชี',
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
              `${process.env.NEXT_PUBLIC_API_URL}/api/employee/${id}`
            );

            setProviceId(data?.province);
            const subDistrict = subDistrictJsons?.filter(
              (item: any) => item?.PROVINCE_ID == data?.province
            );

            const district = districtJsons?.filter(
              (item: any) => item?.PROVINCE_ID == data?.province
            );

            const zipcode = zipcodeJsons?.filter(
              (item: any) => item?.PROVINCE_ID == data?.province
            );

            setDistrictFilter(district);
            setSubDistrictFilter(subDistrict);
            setZipcodeFilter(zipcode);

            resetForm({
              ...data,
              companies: JSON.parse(data?.companies),
              birthday: data?.birthday ? parseDate(data?.birthday) : null,
              startDate: data?.startDate ? parseDate(data?.startDate) : null,
              endDate: data?.endDate ? parseDate(data?.endDate) : null,
              visaExpiryDate: data?.visaExpiryDate
                ? parseDate(data?.visaExpiryDate)
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
          try {
            closeMenu();
            const id = row.getValue('id');
            setProjectSelectId(id);
            onOpenResetPassword();
          } catch (error) {
            console.log(error);
          }
        }}
        sx={{ m: 0 }}
      >
        รีเซ็ตรหัสผ่าน
      </MenuItem>,
      <MenuItem
        onClick={async () => {
          closeMenu();
          const id = row.getValue('id');
          if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้ออกจากระบบ?')) {
            try {
              setModalScreenLoading(true);
              await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/api/employee/${id}`
              );
              await mutate(
                `/api/employee?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
                `/api/employee?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
            เพิ่มพนักงานใหม่
          </Button>

          <Button
            radius="full"
            variant="bordered"
            startContent={<Settings className="opacity-50" />}
            onClick={() => {
              onOpenDepartmentModal();
            }}
          >
            จัดการแผนก
          </Button>

          <Button
            radius="full"
            variant="bordered"
            startContent={<ArrowUpRight className="opacity-50" />}
            onClick={() => {
              window.open('/protect/employee/permission', '_blank');
            }}
          >
            สิทธิ์การเข้าถึง
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/employee/${id}`
                          );
                        })
                      );
                    }

                    await mutate(
                      `/api/employee?page=${pagination?.pageIndex}&perPage=${pagination?.pageItem}&type=projects&companyId=${session?.company?.id}`
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
    <Layout sitename={'พนักงาน'}>
      {formModal()}
      {modalScreenLoading && PageLoading()}
      {formDepartmentModal()}
      {formResetPasswordModal()}

      <section className="flex flex-col gap-5">
        <Breadcrumbs>
          <BreadcrumbItem
            onClick={() => {
              router.push('/');
            }}
          >
            หน้าแรก
          </BreadcrumbItem>
          <BreadcrumbItem>พนักงาน</BreadcrumbItem>
        </Breadcrumbs>

        <HeaderTitle title="พนักงาน" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          <CardSummary
            label={'ทั้งหมด'}
            value={employeeDashboard?.employeeCount}
            suffix={'คน'}
          />
          <CardSummary
            label={'ประจำ'}
            value={employeeDashboard?.employeeFullTimeCount}
            suffix={'คน'}
          />
          <CardSummary
            label={'ชั่วคราว'}
            value={employeeDashboard?.employeePartTimeCount}
            suffix={'คน'}
          />
          <CardSummary
            label={'รายวัน'}
            value={employeeDashboard?.employeeDayCount}
            suffix={'คน'}
          />
          <CardSummary
            label={'รับเหมาช่วง'}
            value={employeeDashboard?.employeeSubcontractorCount}
            suffix={'คน'}
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
