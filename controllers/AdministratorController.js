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

  if (req.query.prefix) {
    $where["prefix"] = {
      contains: req.query.prefix,
    };
  }

  if (req.query.firstname) {
    $where["firstname"] = {
      contains: req.query.firstname,
    };
  }

  if (req.query.surname) {
    $where["surname"] = {
      contains: req.query.surname,
    };
  }

  if (req.query.position) {
    $where["position"] = {
      contains: req.query.position,
    };
  }

  if (req.query.position_level) {
    $where["position_level"] = {
      contains: req.query.position_level,
    };
  }

  if (req.query.center_id) {
    $where["center_id"] = parseInt(req.query.center_id);
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
    $orderBy = { level: "asc" };
  }

  //Count
  let $count = await prisma.administrator.findMany({
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
  prefix: true,
  firstname: true,
  surname: true,
  position: true,
  position_level: true,
  phone: true,
  email: true,
  level: true,
  center_id: true,
  team_file: true,
  is_publish: true,
  center: {
    select: {
      name_th: true,
    },
  },
  prefix: true,
  firstname: true,
  surname: true,
  position: true,
  position_level: true,
};

const methods = {
  // ค้นหาทั้งหมด
  async onGetAll(req, res) {
    try {
      let $where = filterData(req);
      let other = await countDataAndOrder(req, $where);

      const item = await prisma.administrator.findMany({
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
      const item = await prisma.administrator.findUnique({
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
      let pathFile = await uploadController.onUploadFile(
        req,
        "/images/administrator/",
        "team_file"
      );

      if (pathFile == "error") {
        return res.status(500).send("error");
      }

      const checkLevel = await prisma.administrator.findFirst({
        where: { center_id: Number(req.body.center_id) },
        orderBy: {
          level: "desc",
        },
      });

      let level = 1;
      if (checkLevel) {
        level = checkLevel.level + 1;
      }
      console.log(level);

      const item = await prisma.administrator.create({
        data: {
          center_id: Number(req.body.center_id),
          prefix: req.body.prefix,
          firstname: req.body.firstname,
          surname: req.body.surname,
          position: req.body.position,
          //   position_level: req.body.position_level,
          //   email: req.body.email,
          //   phone: req.body.phone,
          //   level: level,
          team_file: pathFile,
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
        "/images/administrator/",
        "team_file"
      );

      if (pathFile == "error") {
        return res.status(500).send("error");
      }

      const item = await prisma.administrator.update({
        where: {
          id: Number(req.params.id),
        },
        data: {
          center_id:
            req.body.center_id != null ? Number(req.body.center_id) : undefined,
          prefix: req.body.prefix != null ? req.body.prefix : undefined,
          firstname:
            req.body.firstname != null ? req.body.firstname : undefined,
          surname: req.body.surname != null ? req.body.surname : undefined,
          position: req.body.position != null ? req.body.position : undefined,
          email: req.body.email != null ? req.body.email : undefined,
          phone: req.body.phone != null ? req.body.phone : undefined,
          team_file: pathFile != null ? pathFile : undefined,
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
      await prisma.administrator.update({
        where: {
          id: Number(req.params.id),
        },
        data: {
          level: null,
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

  //   ChangeLevel
  async onChangeLevel(req, res) {
    try {
      const item = await prisma.administrator.findUnique({
        where: {
          id: Number(req.params.id),
        },
      });

      let item1 = null;

      if (req.body.type == "up") {
        item1 = await prisma.administrator.findFirst({
          where: {
            level: item.level - 1,
            center_id: item.center_id,
          },
        });
      }

      if (req.body.type == "down") {
        item1 = await prisma.administrator.findFirst({
          where: {
            level: item.level + 1,
            center_id: item.center_id,
          },
        });
      }

      if (item1 != null) {
        let level = item1.level;
        let level1 = item.level;

        item.level = level;

        await prisma.center.update({
          where: {
            id: Number(req.params.id),
          },
          data: {
            level: level,
            updated_by: "arnonr",
          },
        });

        await prisma.center.update({
          where: {
            id: item1.id,
          },
          data: {
            level: level1,
            updated_by: "arnonr",
          },
        });
      }

      res.status(200).json({ msg: "success" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = { ...methods };
