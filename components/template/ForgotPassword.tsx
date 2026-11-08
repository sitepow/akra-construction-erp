import * as handlebars from 'handlebars';

const ForgotPasswordTemplete = `<!DOCTYPE html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      .responsive-text {
        width: 65%;
        margin: 0 auto;
      }

      .responsive-size {
        font-size: 28px;
      }

      @media (max-width: 768px) {
        .responsive-text {
          width: 100%;
        }

        .responsive-text {
          font-size: 24px;
        }
      }
    </style>
  </head>
  <body
    style="
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      padding: 20px;
      text-align: center;
      margin: 0;
    "
  >
    <div
      style="
        max-width: 850px;
        margin: auto;
        color: #212529;
        background-color: #ffffff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      "
    >
      <div style="text-align: center">
        <img
          src="{{host}}/logo.png"
          alt="Logo"
          style="max-width: 120px; margin-bottom: 20px"
        />
      </div>
      <h1 class="responsive-text" style="text-align: center">
        รหัสผ่านใหม่สำหรับอีเมลของคุณ<br />{{email}}<br />รหัสผ่านชั่วคราว
        {{password}}
      </h1>
      <p class="responsive-text" style="font-size: 18px; margin-bottom: 30px">
        หลังจากที่ได้รีเซ็ตรหัสผ่านแล้ว โปรดใช้มันเพื่อเข้าไปเปลี่ยนรหัสผ่านใหม่
        ที่เป็นรหัสผ่านสำหรับคุณทราบเพียงคนเดียวเพื่อความปลอดภัย
        *ควรรีบเปลี่ยนภายใน 24 ชั่วโมง*
      </p>
    </div>
  </body>
</html>
`;

export default function ForgotPasswordTempleteEmail({
  host,
  email,
  password,
}: any) {
  const template = handlebars.compile(ForgotPasswordTemplete);
  const htmlBody = template({
    host,
    email,
    password,
  });
  return htmlBody;
}
