const message = require("../../utils/message.js");
const { methods: commonServices } = require("../../services/common");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const { ROLE } = require("../../utils/constant");
const AWSUpload = require("../../services/imgploads.js");
const Role = require("../../models/roles.model");
const Users = require("../../models/users.model");
const Towers = require("../../models/towers.model.js");
const Floors = require("../../models/floors.model.js");
const Flats = require("../../models/flats.model.js");
const Doors = require("../../models/doors.model.js");
const DoorKey = require("../../models/door_keys.model");
const KeyAssignment = require("../../models/key_assignments.model");
const Histories = require("../../models/histories.model.js");


// admin login
exports.login = async (req, res) => {
  try {
    const { email_or_phone_no, password } = req.body;
    let query = {};
    let user = {};

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phonePattern = /^\+?\d{10,15}$/;

    if (emailPattern.test(email_or_phone_no)) {
      query.email = email_or_phone_no;
      user = await Users.findOne(query);
      if (!user) {
        return res.status(400).json({ success: false, message: message.DATA_EXIST("This Email") });
      }
    } else if (phonePattern.test(email_or_phone_no)) {
      query.phone_no = email_or_phone_no;
      user = await Users.findOne(query);
      if (!user) {
        return res.status(400).json({ success: false, message: message.DATA_EXIST("This Phone") });
      }
    } else {
      return res.status(400).json({ success: false, message: message.INVALID("This Phone and Email is") });
    }

    if (!(await commonServices.comparePassword({ password, hashPwd: user?.password }))) {
      return res.status(400).json({ success: false, message: message.NOT_MATCH("Password") });
    }

    user = user.toJSON();
    console.log(typeof user, "----------------------- user type");

    const token = await commonServices.generateToken({ role_id: user.role_id, user_id: user._id });

    user.token = token;
    delete user.password;
    delete user.otp;
    delete user.is_delete;

    return res.status(201).json({ success: "true", message: message.LOG_IN, data: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: "false", message: error.message });
  }
};

// add tower of project
exports.addTower = async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id;
    const { tower_name, image_url } = req.body;

    const isExist = await Towers.findOne({ tower_name: { $regex: `^${tower_name}$`, $options: "i" }, project_id: userId });
    if (isExist) {
      return res.status(400).json({ success: false, message: message.DATA_EXIST("This tower") });
    }

    const obj = new Towers({
      project_id: userId, // project owner id
      tower_name: tower_name.toLowerCase(),
      image_url: image_url ? image_url : null,
    });

    const data = await obj.save();

    // add history
    const msg = `A new tower ${tower_name.toLocaleUpperCase()}🗼 has been added 🏗️ to the ${user.full_name} project 🚧.`;
    commonServices.addHistoryData({ project_id: project_id, note: msg });

    return res.status(201).json({ success: "true", message: message.ADD_DATA("Tower"), data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: "false", message: error.message });
  }
};

// get all tower of project
exports.getAllTower = async (req, res) => {
  try {
    const userId = req.user._id;
    const tower = await Towers.find({ project_id: userId, is_delete: false });
    const total = tower.length;

    return res.status(201).json({ success: "true", message: message.GET_DATA("Tower data"), data: { totalTower: total, tower: tower } });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: "false", message: error.message });
  }
};

// add floor tower
exports.addFloorOfTower = async (req, res) => {
  try {
    const userId = req.user._id;
    const { floor_no, tower_id, image_url } = req.body;

    const tower = await Towers.findOne({ _id: tower_id, project_id: userId });
    if (!tower) {
      return res.status(400).json({ success: false, message: message.NO_DATA("This tower") });
    }

    const isExist = await Floors.findOne({ floor_no: { $regex: `^${floor_no}$`, $options: "i" }, tower_id: tower_id, project_id: userId });
    if (isExist) {
      return res.status(400).json({ success: false, message: message.DATA_EXIST("This floor") });
    }

    const obj = new Floors({
      project_id: userId, // project owner id
      tower_id: tower_id,
      floor_no: floor_no.toLowerCase(),
      image_url: image_url ? image_url : null,
    });

    const data = await obj.save();

    // add history
    const msg = `A new floor ${floor_no} has been added🚧 to Tower ${tower_name.toLocaleUpperCase()}🗼.`;
    commonServices.addHistoryData({ project_id: project_id, note: msg });

    return res.status(201).json({ success: "true", message: message.ADD_DATA("Floor"), data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: "false", message: error.message });
  }
};

// get all floor of tower
exports.getAllFloorTower = async (req, res) => {
  try {
    const userId = req.user._id;
    const { tower_id } = req.query;
    const floor = await Floors.find({ project_id: userId, tower_id: tower_id, is_delete: false });
    const total = floor.length;

    return res.status(201).json({ success: "true", message: message.GET_DATA("Floor data"), data: { totalFloor: total, floor: floor } });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: "false", message: error.message });
  }
};

// add flat no of tower
exports.addFlatNoOfTower = async (req, res) => {
  try {
    const userId = req.user._id;
    const { tower_id, floor_id, flat_no, image_url } = req.body;

    const tower = await Towers.findOne({ _id: tower_id, project_id: userId });
    if (!tower) {
      return res.status(400).json({ success: false, message: message.NO_DATA("This tower") });
    }

    const floor = await Floors.findOne({ tower_id: tower_id, _id: floor_id, project_id: userId });
    if (!floor) {
      return res.status(400).json({ success: false, message: message.NO_DATA("This floor") });
    }

    const isExist = await Flats.findOne({ flat_no: flat_no, tower_id: tower_id, floor_id: floor_id, project_id: userId });
    if (isExist) {
      return res.status(400).json({ success: false, message: message.DATA_EXIST("This flat") });
    }

    const obj = new Flats({
      project_id: userId, // project owner id
      tower_id: tower_id,
      floor_id: floor_id,
      flat_no: flat_no,
      image_url: image_url ? image_url : null,
    });

    const data = await obj.save();

    // add history
    const msg = `A new flat no ${flat_no} has been added🚧 to ${floor.floor_no} in Tower ${tower.tower_name.toLocaleUpperCase()}🗼.`;
    commonServices.addHistoryData({ project_id: project_id, note: msg });

    return res.status(201).json({ success: "true", message: message.ADD_DATA("Flate"), data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: "false", message: error.message });
  }
};

// get all flate of tower
exports.getAllFlatNoOfTower = async (req, res) => {
  try {
    const userId = req.user._id;
    const { tower_id, floor_id } = req.query;

    let query = {
      project_id: userId,
      is_delete: false,
    };

    if (tower_id) {
      query.tower_id = tower_id;
    }

    if (floor_id) {
      query.floor_id = floor_id;
    }

    const floor = await Flats.find(query);
    const total = floor.length;

    return res.status(201).json({ success: "true", message: message.GET_DATA("Flat data"), data: { totalFloor: total, floor: floor } });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: "false", message: error.message });
  }
};

// add door type
exports.addDoorForDropDown = async (req, res) => {
  try {
    const project_id = req.user._id;
    const { door_type, image_url } = req.body;

    const isExist = await Doors.findOne({ door_type: { $regex: `^${door_type}$`, $options: "i" }, project_id: project_id });
    if (isExist) {
      return res.status(400).json({ success: false, message: message.DATA_EXIST("This door type") });
    }

    const obj = new Doors({
      project_id: project_id, // project owner id
      door_type: door_type.toLowerCase(),
      image_url: image_url ? image_url : null,
    });

    const data = await obj.save();

    // add history
    const msg = `🚧 A new door type ${door_type}🚪 has been added.`;
    commonServices.addHistoryData({ project_id: project_id, note: msg });

    return res.status(201).json({ success: "true", message: message.ADD_DATA("Door"), data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: "false", message: error.message });
  }
};

// get all door type
exports.getAllDoorType = async (req, res) => {
  try {
    const userId = req.user._id;
    const door = await Doors.find({ project_id: userId, is_delete: false }).select("_id door_type");

    return res.status(201).json({ success: "true", message: message.GET_DATA("Door type data"), data: door });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: "false", message: error.message });
  }
};

// agency ------------------------------------------------------
// Add agency
exports.add = async (req, res) => {
  try {
    const project_id = req.user._id;
    const { full_name, email, phone_no, password } = req.body;

    const [role, isExist] = await Promise.all([commonServices.findOne(Role, { role: ROLE.AGENCY, is_active: true, is_delete: false }), commonServices.findOne(Users, { phone_no: phone_no, is_delete: false })]);

    if (!role) {
      return res.status(400).json({ success: false, message: message.CREATION_RESTRICTED("New agency") });
    }

    if (isExist) {
      return res.status(400).json({ success: false, message: message.DATA_EXIST("This User") });
    }

    const obj = new Users({
      role_id: role._id,
      project_id: project_id,
      full_name: full_name,
      email: email,
      phone_no: phone_no,
      password: await commonServices.hashPassword({ password }),
      profile_image: null,
    });

    // Convert to string for code
    let stringdata = JSON.stringify({
      full_name: full_name,
      phone_no: phone_no,
      user_id: obj._id,
    });

    // Generate QR code properly
    const storagePath = path.join(__dirname, "..", "..", "uploads", "images", "agency", `${phone_no}-qrcode.png`);
    await QRCode.toFile(storagePath, stringdata, { errorCorrectionLevel: "L", version: 10 });

    // Ensure QR Code file exists before reading
    if (!fs.existsSync(storagePath)) {
      throw new Error("QR Code generation failed, file not found.");
    }

    // Read the QR code file as a buffer
    const qrBuffer = fs.readFileSync(storagePath);

    // Upload QR Code to S3
    let awsQrCodeUrl = await AWSUpload.uploadAWSImage({
      file: {
        buffer: qrBuffer,
        originalname: `${phone_no}-qrcode.png`,
        mimetype: "image/png",
      },
    });

    obj.profile_image = awsQrCodeUrl.image_url;

    const data = await obj.save();

    // add history
    const msg = `A new agency ${full_name}👷 has been added📌.`;
    commonServices.addHistoryData({ project_id: project_id, note: msg });

    return res.status(201).json({ success: "true", message: message.ADD_DATA("User"), data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: "false", message: error.message });
  }
};

// Update User by ID
exports.updateById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ success: "false", message: message.NO_DATA("This User") });
    }

    const isExisting = await Users.findOne({
      phone_no: req.body.phone_no,
      _id: { $ne: id },
    });
    if (isExisting) {
      return res.status(400).json({ success: "false", message: message.DATA_EXIST("This Number") });
    }

    const obj = {
      role_id: req.body.role_id,
      full_name: req.body.full_name,
      email: req.body.email,
      profile_image: req.body.profile_image,
    };

    const updatedUser = await Users.findByIdAndUpdate(id, obj, { new: true });
    res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("User"), data: updatedUser });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: "false", message: error.message });
  }
};

// Delete User by ID
exports.deleteById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ success: "false", message: message.NO_DATA("This User") });
    }

    await Users.findByIdAndDelete(id);
    res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("User") });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: "false", message: error.message });
  }
};

// View User by ID
exports.viewById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ success: "false", message: message.NO_DATA("This user") });
    }

    res.status(200).json({ success: "true", message: message.GET_DATA("User"), data: user });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: "false", message: error.message });
  }
};

// View All Users with Pagination & Search
exports.viewAllAgency = async (req, res) => {
  try {
    const project_id = req.user._id;
    const { page = 1, size = 10, s } = req.query;
    const limit = parseInt(size);
    const skip = (page - 1) * limit;

    let query = {
      project_id: project_id,
      is_delete: false,
    };
    if (s) {
      query = { full_name: { $regex: s, $options: "i" } };
    }

    const data = await Users.find(query).sort({ createdAt: -1 }).select("_id full_name phone_no is_active").limit(limit).skip(skip);
    const total = await Users.countDocuments(query);

    res.status(200).json({
      success: "true",
      message: message.GET_DATA("Agency"),
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: "false", message: error.message });
  }
};

// project agency dropdown
exports.agencyDropDown = async (req, res) => {
  try {
    const project_id = req.user._id;
    const role = await Role.findOne({ role: ROLE.AGENCY });
    if (!role) {
      return res.status(400).json({ success: false, message: message.NO_DATA("This Role") });
    }

    const agencies = await Users.find({ project_id: project_id, role_id: role._id, is_delete: false }).select("_id full_name phone_no profile_image created_at");

    return res.status(201).json({ success: "true", message: message.GET_DATA("Agency data"), agencies });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: "false", message: error.message });
  }
};

// add keys ----------------------------------------------------
// Add Key with save Qr in local
exports.addKey = async (req, res) => {
  try {
    const project_id = req.user._id;
    const { tower_id, floor_id, flat_id, door_id, key_number } = req.body;

    const [tower, floor, flat, doorType, keyNumber] = await Promise.all([Towers.findOne({ _id: tower_id }), Floors.findOne({ _id: floor_id }), Flats.findOne({ _id: flat_id }), Doors.findOne({ _id: door_id }), DoorKey.findOne({ project_id: project_id, key_number: key_number })]);
    if (!tower) {
      return res.status(400).json({ success: false, message: message.NO_DATA("This Tower") });
    }
    if (!floor) {
      return res.status(400).json({ success: false, message: message.NO_DATA("This floor") });
    }
    if (!flat) {
      return res.status(400).json({ success: false, message: message.NO_DATA("This flat") });
    }
    if (!doorType) {
      return res.status(400).json({ success: false, message: message.NO_DATA("This doorType") });
    }
    if (keyNumber) {
      return res.status(400).json({ success: false, message: message.DATA_EXIST("This Key number") });
    }

    const obj = new DoorKey({
      project_id: project_id,
      tower_id: tower_id,
      floor_id: floor_id,
      flat_id: flat_id,
      door_id: door_id,
      key_number: key_number,
      image_url: null,
    });

    // Convert to string for code
    let stringdata = JSON.stringify({
      project_id: project_id,
      key_number: key_number,
      door_key_id: obj._id,
    });

    // Generate QR code properly
    const storagePath = path.join(__dirname, "..", "..", "uploads", "images", "agency", `${key_number}-qrcode.png`);
    await QRCode.toFile(storagePath, stringdata, { errorCorrectionLevel: "L", version: 10 });

    // Ensure QR Code file exists before reading
    if (!fs.existsSync(storagePath)) {
      throw new Error("QR Code generation failed, file not found.");
    }

    // Read the QR code file as a buffer
    const qrBuffer = fs.readFileSync(storagePath);

    // Upload QR Code to S3
    let awsQrCodeUrl = await AWSUpload.uploadAWSImage({
      file: {
        buffer: qrBuffer,
        originalname: `${key_number}-qrcode.png`,
        mimetype: "image/png",
      },
    });
    obj.image_url = awsQrCodeUrl.image_url;
    const data = await obj.save();

    // add history
    const msg = `Added a new key for Tower ${tower.tower_name.toLocaleUpperCase()}, Floor ${floor.floor_no}, Flat ${flat.flat_no} ${doorType.door_type}.🚪🔑`;
    commonServices.addHistoryData({ project_id: project_id, note: msg });

    return res.status(201).json({ success: "true", message: message.ADD_DATA("Key"), data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: "false", message: error.message });
  }
};

// Update Key by ID
exports.updateKeyById = async (req, res) => {
  try {
    const id = req.params.id;
    const { key_name, project_id, key_number } = req.body;

    const user = await DoorKey.findById(id);
    if (!user) {
      return res.status(404).json({ success: "false", message: message.NO_DATA("This key") });
    }

    const isExisting = await DoorKey.findOne({
      project_id: project_id ? project_id : {},
      key_name: key_name ? key_name : {},
      key_number: key_number ? key_number : {},
      _id: { $ne: id },
    });
    if (isExisting) {
      return res.status(400).json({ success: "false", message: message.DATA_EXIST("This key") });
    }

    const obj = {
      project_id: req.body?.project_id,
      key_name: req.body.key_name,
      key_number: req.body.key_number,
      image_url: req.body.image_url,
    };

    const updatedUser = await DoorKey.findByIdAndUpdate(id, obj, { new: true });
    res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Key"), data: updatedUser });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: "false", message: error.message });
  }
};

// Delete Key by ID
exports.deleteKeyById = async (req, res) => {
  try {
    const id = req.params.id;
    const key = await DoorKey.findById(id);
    if (!key) {
      return res.status(404).json({ success: "false", message: message.NO_DATA("This key") });
    }

    await DoorKey.findByIdAndDelete(id);
    res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Key") });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: "false", message: error.message });
  }
};

// View Key by ID  ( if occoupied show agency details for hower system )
exports.viewKeyById = async (req, res) => {
  try {
    const id = req.params.id;
    const key = await DoorKey.findOne({ _id: id, is_delete: false })
      .populate({
        path: "assign_data",
        select: "_id user_id agency_employee",
        populate: {
          path: "user_id",
          select: "full_name phone_no",
        },
        match: { is_occupied: true },
        options: { limit: 1, sort: { created_at: -1 } },
      })
      .populate("project_id", "full_name")
      .populate("tower_id", "tower_name")
      .populate("floor_id", "floor_no")
      .populate("flat_id", "flat_no")
      .populate("door_id", "door_type");

    if (!key) {
      return res.status(404).json({ success: "false", message: message.NO_DATA("This key") });
    }

    const modifyResponse = {
      _id: key._id,
      full_name: key.project_id.full_name,
      tower_name: key.tower_id.tower_name,
      floor_no: key.floor_id.floor_no,
      flat_no: key.flat_id.flat_no,
      door_type: key.door_id.door_type,
      key_number: key.key_number,
      is_occupied: key.is_occupied,
      image_url: key.image_url,
      created_at: key.created_at,
      assign_data: {
        full_name: key?.assign_data[0]?.user_id?.full_name,
        phone_no: key?.assign_data[0]?.user_id?.phone_no,
        agency_employee: key?.assign_data[0]?.agency_employee,
      },
    };

    return res.status(200).json({ success: "true", message: message.GET_DATA("Key"), data: modifyResponse });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: "false", message: error.message });
  }
};

// View All Key with Pagination & Search
exports.viewAllKey = async (req, res) => {
  try {
    const project_id = req.user._id;
    const { tower_id, is_occupied, door_type, page = 1, size = 10, s } = req.query;
    const limit = parseInt(size);
    const skip = (page - 1) * limit;

    let query = {
      project_id: project_id,
      is_delete: false,
    };

    tower_id ? (query.tower_id = tower_id) : null;
    is_occupied ? (query.is_occupied = is_occupied) : null;
    door_type ? (query.door_id = door_type) : null;

    if (s) {
      query.key_number = { $regex: s, $options: "i" };
    }

    const data = await DoorKey.find(query).sort({ createdAt: -1 }).populate("project_id", "full_name").populate("tower_id", "tower_name").populate("floor_id", "floor_no").populate("flat_id", "flat_no").populate("door_id", "door_type").limit(limit).skip(skip);
    const total = await DoorKey.countDocuments(query);

    return res.status(200).json({
      success: "true",
      message: message.GET_DATA("Key data"),
      data,
      total,
      page,
      totalPages: Math.ceil(total == 0 ? 1 : 0 / limit),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// assign key --------------------------------------------------

// Add Key with enerate Qr in local
exports.assignKey = async (req, res) => {
  try {
    const project_id = req.user._id;
    const { user_id, door_key_id, agency_employee } = req.body;

    const [key, user] = await Promise.all([DoorKey.findOne({ _id: door_key_id, project_id: project_id }).populate("tower_id", "tower_name").populate("floor_id", "floor_no").populate("flat_id", "flat_no").populate("door_id", "door_type"), Users.findOne({ _id: user_id, project_id: project_id })]);

    if (!key) {
      return res.status(400).json({ success: false, message: message.NO_DATA("This key") });
    }

    if (!user) {
      return res.status(400).json({ success: false, message: message.NO_DATA("This agency") });
    }

    if (key?.is_occupied == true) {
      const keyOccupiedUserData = await KeyAssignment.findOne({ door_key_id: door_key_id }).sort({ created_at: -1 }).select("user_id agency_employee").populate("user_id", "full_name phone_no agency_employee");
      return res.status(400).json({ success: false, message: message.OCCUPIED("This key"), keyOccupiedUserData });
    }

    const obj = new KeyAssignment({
      project_id: project_id,
      user_id: user_id,
      door_key_id: door_key_id,
      agency_employee: {
        full_name: agency_employee?.full_name,
        phone_no: agency_employee?.phone_no,
        profile_image: agency_employee?.profile_image,
      },
    });

    const [data] = await Promise.all([obj.save(), DoorKey.findOneAndUpdate({ _id: door_key_id }, { is_occupied: true })]);

    // set voice asistance
    const voiceString = `${key.flat_id.flat_no} ${key.door_id.door_type}`;
    commonServices.voiceAsistant(voiceString);

    // add history
    const msg = `The agency 🚧 took the key 🔑 for Tower ${key.tower_id.tower_name.toLocaleUpperCase()}🏢, Floor ${key.floor_id.floor_no}, Flat ${key.flat_id.flat_no} 🏠 ${key.door_id.door_type}🚪 from the store 🏬.`;
    commonServices.addHistoryData({ project_id: project_id, note: msg });

    return res.status(201).json({ success: "true", message: message.ADD_DATA("Key Assign"), data });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: "false", message: error.message });
  }
};

// Add Key with enerate Qr in local
exports.keyReceive = async (req, res) => {
  try {
    const project_id = req.user._id;
    const { door_key_id } = req.body;

    const key = await DoorKey.findOne({ _id: door_key_id, project_id: project_id }).populate("tower_id", "tower_name").populate("floor_id", "floor_no").populate("flat_id", "flat_no").populate("door_id", "door_type");
    if (!key) {
      return res.status(400).json({ success: false, message: message.NO_DATA("This key") });
    }

    if (key?.is_occupied == false) {
      return res.status(400).json({ success: false, message: message.WITHOUT_PERMISSION("This key") });
    }

    const [, data] = await Promise.all([DoorKey.findOneAndUpdate({ _id: door_key_id }, { is_occupied: false }), KeyAssignment.findOneAndUpdate({ door_key_id: door_key_id }, { is_occupied: false }, { new: true }).populate("user_id", "full_name phone_no")]);

    // set voice asistance
    const voiceString = `${key.flat_id.flat_no} ${key.door_id.door_type}`;
    commonServices.voiceAsistant(voiceString);

    // add history
    const msg = `Flat no ${key.flat_id.flat_no}, ${key.door_id.door_type}🚪, of Floor no ${key.floor_id.floor_no}, Tower ${key.tower_id.tower_name.toLocaleUpperCase()}🏢, key🔑 has been received✅ from the agency ${data.user_id.full_name} (${data.user_id.phone_no}-${data.agency_employee.phone_no}).`;
    commonServices.addHistoryData({ project_id: project_id, note: msg });

    return res.status(201).json({ success: true, message: message.RECEIVED(`Flat no ${key.flat_id.flat_no}, ${key.door_id.door_type} key`), data: `${key.flat_id.flat_no} ${key.door_id.door_type}` });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// history of assign/receive key of my project
exports.assignReceiveHistory = async (req, res) => {
  try {
    const project_id = req.user._id;
    const history = await Histories.find({ project_id: project_id, is_delete: false }).select("note").sort({ created_at: -1 });

    return res.status(201).json({ success: true, message: message.GET_DATA("History data"), data: history });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// upload image in S3
exports.uploadS3Image = async (req, res) => {
  try {
    const { image_url } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: message.NO_DATA("File") });
    }

    // Upload QR Code to S3
    let awsQrCodeUrl = await AWSUpload.uploadAWSImage({
      file: {
        buffer: req.file.buffer,
        originalname: `${req.file.originalname}`,
        mimetype: req.file.mimetype,
      },
    });
    return res.status(201).json({ success: "true", message: message.ADD_DATA("Image"), data: awsQrCodeUrl.image_url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: "false", message: error.message });
  }
};
