const category = require('../model/categoryModel');

const catmiddleware = async (req, res, next) => {
    try {
        const catData = await category.find({ is_list: 1 });
        res.locals.category = catData;
        next();
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

module.exports = catmiddleware