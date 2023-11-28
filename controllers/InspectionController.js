const { PrismaClient } = require("@prisma/client");
const uploadController = require("./UploadsController");

const prisma = new PrismaClient().$extends({
  result: {
    inspection: {
      inspection_file: {
        needs: { inspection_file: true },
        compute(inspection) {
          let inspection_file = null;
          if (inspection.inspection_file != null) {
            inspection_file =
              process.env.PATH_UPLOAD + inspection.inspection_file;
          }
          return inspection_file;
        },
      },
    },
  },
});

// ค้นหา
const filterData = (req) => {
  let $where = {
    deleted_at: null,
  };

  if (req.query.id) {
    $where["id"] = parseInt(req.query.id);
  }

  if (req.query.center_id) {
    $where["center_id"] = parseInt(req.query.center_id);
  }

  if (req.query.code) {
    $where["code"] = {
      contains: req.query.code,
    };
  }

  if (req.query.company_name) {
    $where["company_name"] = {
      contains: req.query.company_name,
    };
  }

  if (req.query.name) {
    $where["name"] = {
      contains: req.query.name,
    };
  }

  if (req.query.type) {
    $where["type"] = parseInt(req.query.type);
  }

  if (req.query.is_publish) {
    $where["is_publish"] = parseInt(req.query.is_publish);
  }

  if (req.query.created_year) {
    $where["inspection_date"] = {
      gte: new Date(req.query.created_year + "-01-01 00:00:00").toISOString(),
      lte: new Date(req.query.created_year + "-12-31 23:59:00").toISOString(),
    };
  }

  if (req.query.created_month) {
    $where["inspection_date"] = {
      gte: new Date(
        req.query.created_year + "-" + req.query.created_month + "-01 00:00:00"
      ).toISOString(),
      lte: new Date(
        req.query.created_year + "-" + req.query.created_month + "-31 23:59:00"
      ).toISOString(),
    };
  }

  if (req.query.inspection_date) {
    $where["inspection_date"] = {
      gte: new Date(req.query.inspection_date + " 00:00:00").toISOString(),
      lte: new Date(req.query.inspection_date + " 23:59:00").toISOString(),
    };
  }

  if (req.query.created_at) {
    $where["created_at"] = {
      gte: new Date(req.query.created_at + " 00:00:00").toISOString(),
      lte: new Date(req.query.created_at + " 23:59:00").toISOString(),
    };
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
    $orderBy = { created_at: "asc" };
  }

  //Count
  let $count = await prisma.inspection.findMany({
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
  center_id: true,
  code: true,
  name: true,
  company_name: true,
  inspection_date: true,
  type: true,
  inspection_file: true,
  is_active: true,
  is_publish: true,
  created_at: true,
  center: {
    select: {
      name_th: true,
    },
  },
};

const methods = {
  // ค้นหาทั้งหมด
  async onGetAll(req, res) {
    try {
      let $where = filterData(req);
      let other = await countDataAndOrder(req, $where);

      const item = await prisma.inspection.findMany({
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
      const item = await prisma.inspection.findUnique({
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
      let pathFile = await uploadController.onUploadFile(
        req,
        "/images/inspection/",
        "inspection_file"
      );

      if (pathFile == "error") {
        return res.status(500).send("error");
      }

      //
      //   let codeLastest = await prisma.inspection.findMany({
      //     where: { code: "desc" },
      //     orderBy: other.$orderBy,
      //     take: 1,
      //   });
      //   let code = codeLastest.code.split("-");
      //   let runCode = code[0].substring(5, code[0].length);
      let code = 1;
      const item = await prisma.inspection.create({
        data: {
          center_id: Number(req.body.center_id),
          code: code,
          name: req.body.name,
          company_name: req.body.company_name,
          inspection_date: new Date(req.body.inspection_date),
          type: Number(req.body.type),
          inspection_file: pathFile,
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
      let pathFile = await uploadController.onUploadFile(
        req,
        "/images/inspection/",
        "inspection_file"
      );

      if (pathFile == "error") {
        return res.status(500).send("error");
      }

      const item = await prisma.inspection.update({
        where: {
          id: Number(req.params.id),
        },
        data: {
          code: req.body.code != null ? req.body.code : undefined,
          name: req.body.name != null ? req.body.name : undefined,
          inspection_date:
            body.inspection_date != null
              ? new Date(req.body.inspection_date)
              : undefined,
          center_id:
            req.body.center_id != null ? Number(req.body.center_id) : undefined,
          company_name:
            req.body.company_name != null ? req.body.company_name : undefined,
          type: req.body.type != null ? Number(req.body.type) : undefined,
          inspection_file: pathFile != null ? pathFile : undefined,
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
      await prisma.inspection.update({
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
