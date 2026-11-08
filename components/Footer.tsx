export default function FooterCustom() {
  return (
    <footer className={`mt-2.5 text-center px-6 py-2.5 border-t dark:border-dark`}>
      <div>
        © {new Date().getFullYear()} ห้างหุ้นส่วนจำกัด อัครวิศว์ก่อสร้าง
        สงวนลิขสิทธิ์
      </div>
    </footer>
  );
}
