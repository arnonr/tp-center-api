const { PrismaClient } = require("@prisma/client");
const uploadController = require("./UploadsController");
const prisma = new PrismaClient();

// ค้นหา
const filterData = (req) => {
  let $where = {
    deleted_at: null,
  };

  if (req.query.id) {
    $where["id"] = parseInt(req.query.id);
  }

  if (req.query.campus_id) {
    $where["campus_id"] = parseInt(req.query.campus_id);
  }

  if (req.query.code) {
    $where["code"] = {
      contains: req.query.code,
    };
  }

  if (req.query.short_name) {
    $where["short_name"] = {
      contains: req.query.short_name,
    };
  }

  if (req.query.name_th) {
    $where["name_th"] = {
      contains: req.query.name_th,
    };
  }

  if (req.query.name_en) {
    $where["name_en"] = {
      contains: req.query.name_en,
    };
  }

  if (req.query.head_of_center) {
    $where["head_of_center"] = {
      contains: req.query.head_of_center,
    };
  }

  if (req.query.is_publish) {
    $where["is_publish"] = parseInt(req.query.is_publish);
  }

  //   if (req.query.created_year) {
  //     $where["created_news"] = {
  //       gte: new Date(req.query.created_year + "-01-01 00:00:00").toISOString(),
  //       lte: new Date(req.query.created_year + "-12-31 23:59:00").toISOString(),
  //     };
  //   }

  //   if (req.query.created_month) {
  //     $where["created_news"] = {
  //       gte: new Date(
  //         req.query.created_year + "-" + req.query.created_month + "-01 00:00:00"
  //       ).toISOString(),
  //       lte: new Date(
  //         req.query.created_year + "-" + req.query.created_month + "-31 23:59:00"
  //       ).toISOString(),
  //     };
  //   }

  //   if (req.query.created_news) {
  //     $where["created_news"] = {
  //       gte: new Date(req.query.created_news + " 00:00:00").toISOString(),
  //       lte: new Date(req.query.created_news + " 23:59:00").toISOString(),
  //     };
  //   }

  return $where;
};

// หาจำนวนทั้งหมดและลำดับ
const countDataAndOrder = async (req, $where) => {
  //   Order
  let $orderBy = {};
  if (req.query.orderBy) {
    $orderBy[req.query.orderBy] = req.query.order;
  } else {
    $orderBy = { code: "asc" };
  }

  //Count
  let $count = await prisma.center.findMany({
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
  campus_id: true,
  code: true,
  short_name: true,
  name_th: true,
  name_en: true,
  head_of_center: true,
  is_active: true,
  is_publish: true,
  campus: {
    select: {
      code: true,
      name_th: true,
      name_en: true,
    },
  },
};

// ปรับ Language
const cutFroala = (detail) => {
  let detail_success =
    detail != null
      ? detail
          .replaceAll("Powered by", "")
          .replaceAll(
            '<p data-f-id="pbf" style="text-align: center; font-size: 14px; margin-top: 30px; opacity: 0.65; font-family: sans-serif;">',
            ""
          )
          .replaceAll(
            '<a href="https://www.froala.com/wysiwyg-editor?pb=1" title="Froala Editor">',
            ""
          )
          .replaceAll("Froala Editor</a></p>", "")
      : undefined;
  return detail_success;
};

const methods = {
  // ค้นหาทั้งหมด
  async onGetAll(req, res) {
    try {
      let $where = filterData(req);
      let other = await countDataAndOrder(req, $where);

      const item = await prisma.center.findMany({
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
      const item = await prisma.center.findUnique({
        select: selectField,
        where: {
          id: Number(req.params.id),
        },
      });
      res.status(200).json({ data: item, msg: "success" });
    } catch (error) {
      res.status(404).json({ msg: error.message });
    }
  },

  // สร้าง
  async onCreate(req, res) {
    try {
      const item = await prisma.center.create({
        data: {
          campus_id: Number(req.body.campus_id),
          code: req.body.code,
          short_name: req.body.short_name,
          name_th: req.body.name_th,
          name_en: req.body.name_en,
          head_of_center: req.body.head_of_center,
          is_publish: Number(req.body.is_publish),
          created_by: "arnonr",
          updated_by: "arnonr",
        },
      });

      res.status(201).json({ ...item, msg: "success" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  // แก้ไข
  async onUpdate(req, res) {
    try {
      const item = await prisma.center.update({
        where: {
          id: Number(req.params.id),
        },
        data: {
          code: req.body.code != null ? req.body.code : undefined,
          short_name: req.body.short_name != null ? req.body.short_name : undefined,
          name_th: req.body.name_th != null ? req.body.name_th : undefined,
          name_en: req.body.name_en != null ? req.body.name_en : undefined,
          head_of_center: req.body.head_of_center != null ? req.body.head_of_center : undefined,
          campus_id:
            req.body.campus_id != null ? Number(req.body.campus_id) : undefined,
          is_publish:
            req.body.is_publish != null
              ? Number(req.body.is_publish)
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
      await prisma.center.update({
        where: {
          id: Number(req.params.id),
        },
        data: {
          deleted_at: new Date().toISOString(),
        },
      });

      res.status(200).json({
        msg: "success",
      });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = { ...methods };
