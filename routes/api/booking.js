const express = require("express");
const router = express.Router();

const controllers = require("../../controllers/EquipmentBookingController");
const auth = require("../auth");
// const { checkPermission } = require("../accessControl");

router.get("/", controllers.onGetAll);
router.get("/check-booking-date", controllers.onCheckBookingDate);
router.get("/:id", controllers.onGetById);

router.post(
  "/",
  // auth.required,
  controllers.onCreate
);

router.put(
  "/approve/:id",
  // auth.required,
  controllers.onApprove
);

router.put(
  "/:id",
  // auth.required,
  controllers.onUpdate
);

router.delete(
  "/:id",
  //   auth.required,
  controllers.onDelete
);

module.exports = router;
