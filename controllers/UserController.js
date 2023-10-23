const { PrismaClient } = require("@prisma/client");
const uploadController = require("./UploadsController");
const jwt = require("jsonwebtoken");
// const { expressjwt: jwt1 } = require("express-jwt");

const prisma = new PrismaClient();

// ค้นหา
const filterData = (req) => {
  let $where = {
    deleted_at: null,
  };

  if (req.query.id) {
    $where["id"] = parseInt(req.query.id);
  }

  if (req.query.email) {
    $where["email"] = parseInt(req.query.email);
  }

  if (req.query.status) {
    $where["status"] = parseInt(req.query.status);
  }

  if (req.query.group_id) {
    $where["group_id"] = parseInt(req.query.group_id);
  }

  if (req.query.is_publish) {
    $where["is_publish"] = parseInt(req.query.is_publish);
  }

  return $where;
};

// หาจำนวนทั้งหมดและลำดับ
const countDataAndOrder = async (req, $where) => {
  //   Order
  let $orderBy = {};
  if (req.query.orderBy) {
    $orderBy[req.query.orderBy] = req.query.order;
  } else {
    $orderBy = { created_at: "desc" };
  }

  //Count
  let $count = await prisma.user.findMany({
    where: $where,
  });

  $count = $count.length;
  let $perPage = req.query.perPage ? Number(req.query.perPage) : 10;
  let $currentPage = req.query.currentPage ? Number(req.query.currentPage) : 1;
  let $totalPage =
    Math.ceil($count / $perPage) == 0 ? 1 : Math.ceil($count / $perPage);
  let $offset = $perPage * ($currentPage - 1);

  return {
    $orderBy: $orderBy,
    $offset: $offset,
    $perPage: $perPage,
    $count: $count,
    $totalPage: $totalPage,
    $currentPage: $currentPage,
  };
};

// ฟิลด์ที่ต้องการ Select รวมถึง join
const selectField = {
  id: true,
  group_id: true,
  email: true,
  //   password: true,
  status: true,
  is_publish: true,
  profile: {
    select: {
      prefix: true,
      firstname: true,
      surname: true,
    },
  },
};

// ปรับ Language
// const checkLanguage = (req) => {
//   let prismaLang = prisma.$extends({
//     result: {
//       news: {
//         title: {
//           needs: { title_th: true },
//           compute(news) {
//             return req.query.lang && req.query.lang == "en"
//               ? news.title_en
//               : news.title_th;
//           },
//         },
//         detail: {
//           needs: { detail_th: true },
//           compute(news) {
//             return req.query.lang && req.query.lang == "en"
//               ? news.detail_en
//               : news.detail_th;
//           },
//         },
//       },
//       news_type: {
//         name: {
//           needs: { name_th: true },
//           compute(news_type) {
//             return req.query.lang && req.query.lang == "en"
//               ? news_type.name_en
//               : news_type.name_th;
//           },
//         },
//       },
//     },
//   });

//   return prismaLang;
// };

const methods = {
  // ค้นหาทั้งหมด
  async onGetAll(req, res) {
    try {
      let $where = filterData(req);
      let other = await countDataAndOrder(req, $where);

      const item = await prisma.user.findMany({
        select: selectField,
        where: $where,
        orderBy: other.$orderBy,
        skip: other.$offset,
        take: other.$perPage,
      });

      res.status(200).json({
        data: item,
        totalData: other.$count,
        totalPage: other.$totalPage,
        currentPage: other.$currentPage,
        msg: "success",
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
  // ค้นหาเรคคอร์ดเดียว
  async onGetById(req, res) {
    try {
      const item = await prisma.user.findUnique({
        select: selectField,
        where: {
          id: Number(req.params.id),
        },
      });
      res.status(200).json({ data: item, msg: " success" });
    } catch (error) {
      res.status(404).json({ msg: error.message });
    }
  },

  // สร้าง
  async onCreate(req, res) {
    try {
      const item = await prisma.user.create({
        data: {
          group_id: Number(req.body.group_id),
          email: req.body.email,
          password: req.body.password,
          status: Number(req.body.status),
          is_publish: Number(req.body.is_publish),
          created_by: "arnonr",
          updated_by: "arnonr",
        },
      });

      const profile = await prisma.profile.create({
        data: {
          user_id: Number(item.id),
          prefix: req.body.prefix,
          firstname: req.body.firstname,
          surname: req.body.surname,
          is_publish: Number(req.body.is_publish),
          created_by: "arnonr",
          updated_by: "arnonr",
        },
      });

      res.status(201).json({ ...item, ...profile, msg: "success" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  // แก้ไข
  async onUpdate(req, res) {
    try {
      let pathFile = await uploadController.onUploadFile(
        req,
        "/images/news/",
        "news_file"
      );

      if (pathFile == "error") {
        return res.status(500).send("error");
      }

      const item = await prisma.user.update({
        where: {
          id: Number(req.params.id),
        },
        data: {
          title_th: req.body.title_th != null ? req.body.title_th : undefined,
          title_en: req.body.title_en != null ? req.body.title_en : undefined,
          news_type_id:
            req.body.news_type_id != null
              ? Number(req.body.news_type_id)
              : undefined,
          detail_th:
            req.body.detail_th != null ? req.body.detail_th : undefined,
          detail_en:
            req.body.detail_en != null ? req.body.detail_en : undefined,
          news_file: pathFile != null ? pathFile : undefined,
          is_publish:
            req.body.is_publish != null
              ? Number(req.body.is_publish)
              : undefined,
          created_news:
            req.body.created_news != null
              ? new Date(req.body.created_news)
              : undefined,
          updated_by: "arnonr",
        },
      });

      res.status(200).json({ ...item, msg: "success" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
  // ลบ
  async onDelete(req, res) {
    try {
      const item = await prisma.user.update({
        where: {
          id: Number(req.params.id),
        },
        data: {
          deleted_at: new Date().toISOString(),
        },
      });

      res.status(200).json(item);
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  async onLogin(req, res) {
    try {
      const item = await prisma.user.findFirst({
        select: selectField,
        where: {
          email: req.body.email,
          password: req.body.password,
        },
      });

      if (item) {
        const payload = item;
        const secretKey = process.env.SECRET_KEY;

        const token = jwt.sign(payload, secretKey, {
          expiresIn: "90d",
        });

        res.status(200).json({ ...item, token: token });
      } else {
        res.status(400).json({ msg: "Invalid credential" });
      }
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = { ...methods };
