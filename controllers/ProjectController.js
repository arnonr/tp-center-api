const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

  if (req.query.project_type_id) {
    $where["project_type_id"] = parseInt(req.query.project_type_id);
  }

  if (req.query.name) {
    $where["name"] = {
      contains: req.query.name,
    };
  }

  if (req.query.responsible_staff) {
    $where["responsible_staff"] = {
      contains: req.query.responsible_staff,
    };
  }

  if (req.query.budget) {
    $where["budget"] = req.query.budget;
  }

  if (req.query.in_organization) {
    $where["in_organization"] = {
      contains: req.query.in_organization,
    };
  }

  if (req.query.ex_organization) {
    $where["ex_organization"] = {
      contains: req.query.ex_organization,
    };
  }

  if (req.query.trl) {
    $where["trl"] = parseInt(req.query.trl);
  }

  if (req.query.is_publish) {
    $where["is_publish"] = parseInt(req.query.is_publish);
  }

  if (req.query.created_year) {
    $where["project_date"] = {
      gte: new Date(req.query.created_year + "-01-01 00:00:00").toISOString(),
      lte: new Date(req.query.created_year + "-12-31 23:59:00").toISOString(),
    };
  }

  if (req.query.created_month) {
    $where["project_date"] = {
      gte: new Date(
        req.query.created_year + "-" + req.query.created_month + "-01 00:00:00"
      ).toISOString(),
      lte: new Date(
        req.query.created_year + "-" + req.query.created_month + "-31 23:59:00"
      ).toISOString(),
    };
  }

  if (req.query.project_date) {
    $where["project_date"] = {
      gte: new Date(req.query.project_date + " 00:00:00").toISOString(),
      lte: new Date(req.query.project_date + " 23:59:00").toISOString(),
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
  let $count = await prisma.project.findMany({
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
  project_type_id: true,
  name: true,
  responsible_staff: true,
  budget: true,
  in_organization: true,
  trl: true,
  ex_organization: true,
  project_date: true,
  is_active: true,
  is_publish: true,
  center: {
    select: {
      code: true,
      name_th: true,
      name_en: true,
    },
  },
  project_type: {
    select: {
      name: true,
    },
  },
};

const methods = {
  // ค้นหาทั้งหมด
  async onGetAll(req, res) {
    try {
      let $where = filterData(req);
      let other = await countDataAndOrder(req, $where);

      const item = await prisma.project.findMany({
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
      const item = await prisma.project.findUnique({
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
      const item = await prisma.project.create({
        data: {
          center_id: Number(req.body.center_id),
          project_type_id: Number(req.body.project_type_id),
          name: req.body.name,
          responsible_staff: req.body.responsible_staff,
          budget: Number(req.body.budget),
          in_organization: req.body.in_organization,
          trl: Number(req.body.trl),
          ex_organization: req.body.ex_organization,
          project_date: new Date(req.body.project_date).toISOString(),
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
      const item = await prisma.project.update({
        where: {
          id: Number(req.params.id),
        },
        data: {
          name: req.body.name != null ? req.body.name : undefined,
          responsible_staff:
            req.body.responsible_staff != null
              ? req.body.responsible_staff
              : undefined,
          budget: req.body.budget != null ? Number(req.body.budget) : undefined,
          in_organization:
            req.body.in_organization != null
              ? req.body.in_organization
              : undefined,
          trl: req.body.trl != null ? Number(req.body.trl) : undefined,
          ex_organization:
            req.body.ex_organization != null
              ? req.body.ex_organization
              : undefined,
          project_date:
            req.body.project_date != null
              ? new Date(req.body.project_date).toISOString()
              : undefined,
          center_id:
            req.body.center_id != null ? Number(req.body.center_id) : undefined,
          project_type_id:
            req.body.project_type_id != null
              ? Number(req.body.project_type_id)
              : undefined,
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
      await prisma.project.update({
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
