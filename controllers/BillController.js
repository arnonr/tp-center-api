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

  if (req.query.post_company_id) {
    $where["post_company_id"] = parseInt(req.query.post_company_id);
  }

  if (req.query.send_name) {
    $where["send_name"] = { contains: req.query.send_name };
  }

  if (req.query.receive_name) {
    $where["receive_name"] = { contains: req.query.receive_name };
  }

  if (req.query.receive_address) {
    $where["receive_address"] = { contains: req.query.receive_address };
  }

  if (req.query.tracking_id) {
    $where["tracking_id"] = { contains: req.query.tracking_id };
  }

  if (req.query.price) {
    $where["price"] = { contains: req.query.price };
  }

  if (req.query.is_publish) {
    $where["is_publish"] = parseInt(req.query.is_publish);
  }

  if (req.query.created_year) {
    $where["send_date"] = {
      gte: new Date(req.query.created_year + "-01-01 00:00:00").toISOString(),
      lte: new Date(req.query.created_year + "-12-31 23:59:00").toISOString(),
    };
  }

  if (req.query.created_month) {
    $where["send_date"] = {
      gte: new Date(
        req.query.created_year + "-" + req.query.created_month + "-01 00:00:00"
      ).toISOString(),
      lte: new Date(
        req.query.created_year + "-" + req.query.created_month + "-31 23:59:00"
      ).toISOString(),
    };
  }

  if (req.query.send_date) {
    $where["send_date"] = {
      gte: new Date(req.query.send_date + " 00:00:00").toISOString(),
      lte: new Date(req.query.send_date + " 23:59:00").toISOString(),
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
    $orderBy = { id: "desc" };
  }

  //Count
  let $count = await prisma.bill.findMany({
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
  post_company_id: true,
  send_name: true,
  send_date: true,
  receive_name: true,
  receive_address: true,
  tracking_id: true,
  weight: true,
  price: true,
  is_publish: true,
};

const methods = {
  // ค้นหาทั้งหมด
  async onGetAll(req, res) {
    try {
      let $where = filterData(req);
      let other = await countDataAndOrder(req, $where);

      const item = await prisma.bill.findMany({
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
      const item = await prisma.bill.findUnique({
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
      const item = await prisma.bill.create({
        data: {
          post_company_id: Number(req.body.post_company_id),
          send_name: req.body.send_name,
          send_date: new Date(req.body.send_date),
          receive_name: req.body.receive_name,
          receive_address: req.body.receive_address,
          tracking_id: req.body.tracking_id,
          weight: req.body.weight,
          price: Number(req.body.price),
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
      const item = await prisma.bill.update({
        where: {
          id: Number(req.params.id),
        },
        data: {
          post_company_id:
            req.body.post_company_id != null
              ? Number(req.body.post_company_id)
              : undefined,
          send_name:
            req.body.send_name != null ? req.body.send_name : undefined,
          send_date:
            req.body.send_date != null
              ? new Date(req.body.send_date)
              : undefined,
          receive_name:
            req.body.receive_name != null ? req.body.receive_name : undefined,
          receive_address:
            req.body.receive_address != null
              ? req.body.receive_address
              : undefined,
          tracking_id:
            req.body.tracking_id != null ? req.body.tracking_id : undefined,
          weight: req.body.weight != null ? req.body.weight : undefined,
          price: req.body.price != null ? Number(req.body.price) : undefined,
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
      const item = await prisma.bill.update({
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
};

module.exports = { ...methods };
