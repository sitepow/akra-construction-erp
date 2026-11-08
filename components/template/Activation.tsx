import * as handlebars from 'handlebars';

const ActivationTemplete = `<!DOCTYPE html>
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
        ยืนยันอีเมลของคุณ<br />{{email}}<br />ด้วยรหัสยืนยัน {{code}}
      </h1>
      <p class="responsive-text" style="font-size: 18px; margin-bottom: 30px">
        หรือยืนยันการสมัครผ่านลิงก์ กรุณากดที่ปุ่มด้านล่างนี้
        *ลิงก์นี้จะหมดอายุภายใน 24 ชั่วโมง*
      </p>
      <div style="text-align: center; margin-bottom: 30px">
        <a
          href="{{link}}"
          target="_blank"
          style="
            background-color: #ff0000;
            color: #ffffff;
            padding: 12px 24px;
            font-size: 16px;
            text-decoration: none;
            border-radius: 12px;
            display: inline-block;
          "
        >
          ยืนยันอีเมล
        </a>
      </div>
      <p class="responsive-text" style="font-size: 18px; text-align: center">
        หากไม่สามารถเปิดลิงก์ได้ กรุณาคลิกที่ลิงก์ด้านล่างนี้แทน
        หรือหากคุณไม่ได้เป็นผู้ที่ขอรับอีเมลนี้ โปรดละเว้นข้อความนี้
      </p>
      <a
        href="{{link}}"
        target="_blank"
        style="font-size: 16px; text-align: center; word-wrap: break-word"
      >
        {{link}}
      </a>
    </div>
  </body>
</html>
`;

export default function ActivationTempleteEmail({
  host,
  email,
  link,
  code,
}: any) {
  const template = handlebars.compile(ActivationTemplete);
  const htmlBody = template({
    host,
    email,
    link,
    code,
  });
  return htmlBody;
}
