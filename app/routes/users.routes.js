const controller = require("../controller/users/users.controller");
const userCommonServices = require("../controller/users/common.services");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
    next();
  });

  app.post("/api/user", /* userCommonServices.addValidation, */ controller.add);
  app.put("/api/user/:id", /* userCommonServices.bodyValidation, */ controller.updateById);
  app.delete("/api/user/:id", controller.deleteById);
  app.get("/api/user", controller.viewAll); // use page, size, ans s(seraching) in query
  app.get("/api/user/:id", controller.viewById);

  app.post("/api/key", /* userCommonServices.addValidation, */ controller.addKey);
  app.put("/api/key/:id", /* userCommonServices.bodyValidation, */ controller.updateKeyById);
  app.delete("/api/key/:id", controller.deleteKeyById);
  // app.get("/api/key", controller.viewAllKeyOfProject); // use page, size, ans s(seraching) in query
  app.get("/api/key/:id", controller.viewKeyById);

  // assign key ---------------
  app.post("/api/assignkey", /* userCommonServices.addValidation, */ controller.assignKey);
  app.get("/api/agencies", /* userCommonServices.addValidation, */ controller.getAllAgency);
  app.get("/api/occupiedkey", /* userCommonServices.addValidation, */ controller.getAllOccupiedKey);
};
