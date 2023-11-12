Develop
- ตั้งค่า DB ที่ไฟล์ .env
- ใช้คำสั่ง npm run dev

ขั้นตอนการ Migrate DB
- npx prisma migrate dev --create-only
- npx prisma migrate dev --name migration-name --create-only
- ลบ REMOVE ออกถ้ามีคำสั่ง REMOVE ในไฟล์ MIGRATE
- prisma migrate dev



---- deploy

-- เรื่องรูป upload
แก้ .env
PATH_UPLOAD = 'http://sci.kmutnb.ac.th/sicc-static/uploads'
แก้ index.js
app.use("/sicc-static", express.static(__dirname + "/public"));
และไปตั้งค่า nginx reverse proxy manager custom location
/sicc-static ไปที่ port api