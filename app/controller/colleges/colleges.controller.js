const db = require('../../models')
const message = require("../../services/message");
const { methods: commonServices } = require('../../services/common');
const Op = db.Sequelize.Op;

const Pincode = db.pincode;
const College = db.collages;

// tab nine exetention

// add
exports.add = async (req, res) => {
    try {
        const query = { where: { name: req.body.name } };
        console.log(query,'--------------------------------');
        
        const isExistingData = await commonServices.get(College, query);
        if (isExistingData) {
            return res.status(404).json({ success: false, message: message.DATA_EXIST('This collage') })
        }

        let obj = {
            name: req.body.name,
        }
        const data = await commonServices.create(College, obj)
        if (data) {
            res.status(200).json({ success: "true", message: message.ADD_DATA("College") })
        } else {
            res.status(200).json({ success: "false", message: message.CREATE_FAILD("College") });
        }

    } catch (error) {
        console.log(error.message);
        res.status(200).json({ success: "false", message: error.message });
    }
}

// edit by id
exports.updateById = async (req, res) => {
    try {

        const id = req.params.id
        const user = await commonServices.get(College, { where: { id: id } })
        if (!user) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("This college") });
        }

        const query = { where: [{ name: req.body.name }, { id: { [Op.ne]: [id] } }] };
        let isExisting = await commonServices.get(College, query);
        if (isExisting) {
            return res.status(200).json({ success: "false", message: message.DATA_EXIST("This college") });
        }

        const obj = {
            name: req.body.name,
        }
        let data = await commonServices.update(College, { where: { id: id } }, obj);
        if (data > 0) {
            res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("College") });
        } else {
            res.status(200).json({ success: "false", message: message.NOT_UPDATE("College") });
        }
    } catch (error) {
        console.log(error.message);
        res.status(200).json({ success: "false", message: error.message });
    }
}

// delete by id
exports.deleteById = async (req, res) => {
    try {

        const id = req.params.id
        const user = await commonServices.get(College, { where: { id: id } })
        if (!user) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("This college") });
        }


        let data = await commonServices.delete(College, { where: { id: id } });
        if (data > 0) {
            res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("College") });
        } else {
            res.status(200).json({ success: "false", message: message.NOT_DELETED("College") });
        }
    } catch (error) {
        console.log(error.message);
        res.status(200).json({ success: "false", message: error.message });
    }
}


// view by id
exports.viewById = async (req, res) => {

    try {
        const id = req.params.id;
        const user = await commonServices.get(College, { where: { id: id } })
        if (!user) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("This college") });
        }

        let query = {
            where: { id: id },
            attributes: ['id', 'name'],
        };
        let data = await commonServices.get(College, query)

        if (data) {
            res.status(200).json({ success: "true", message: message.GET_DATA("College"), data: data })
        } else {
            res.status(200).json({ success: "true", message: message.NO_DATA("This college") })
        }

    } catch (error) {
        console.log(error.message);
        res.status(200).json({ success: "false", message: error.message })
    }

};


// view all 
exports.viewAll = async (req, res) => {

    try {
        const { page, size, s } = req.query;

        let DataObj = {};
        if (s) {
            DataObj = {
                ...DataObj,
                [Op.or]: [
                    { name: { [Op.like]: `%${s}%` } },
                ]
            }
        }

        const { limit, offset } = commonServices.getPagination(page, size);
        let query = {
            where: [DataObj],
            order: [["id", "DESC"], ["createdAt", "DESC"]],
            attributes: ['id', 'name']
        };

        let data = await commonServices.getAndCountAll(College, query, limit, offset)
        if (data) {
            const response = commonServices.getPagingData(data, page, limit);
            let responseData = JSON.parse(JSON.stringify(response))

            res.status(200).json({ success: "true", message: message.GET_DATA("College"), data: responseData })
        } else {
            res.status(200).json({ success: "false", message: message.NO_DATA("This college") })
        }

    } catch (error) {
        console.log(error.message);
        res.status(200).json({ success: "false", message: error.message })
    }

};