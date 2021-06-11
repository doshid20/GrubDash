const { response } = require("express");
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

/**
 *  Is dish Exist
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */

function isDishExist (req, res, next) {
    const dishId = req.params.dishId;
    const foundDish = dishes.find((dish) => dish.id = dishId)
    if (foundDish) {
        res.locals.dish = foundDish;
        return next();
     }

     next({
         status: 404,
         message: `dishId is not found: ${dishId}`,
     })
}
/**
 * Dish mataches with id
 * @param {} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
function isDishIdMatches( req, res, next) {
    const { data: { id },} = req.body;
    const dishId = req.params.dishId;
    if (!id) {
        return next();
    }
    if (dishId === id) {
        return next();
    }
    next ({
        status: 400,
        message: `dish id - ${id}  does not matches with route id: - ${dishId}`,
    })
}

/**
 * Dish has name
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function hasName(req, res, next) {
    const { data: { name } = {} } = req.body;

    if (!name || name === "") {
        next({
            status: 400,
            message: `Dish must have name`,
        })
    }
    res.locals.name = name;
    next();
}

/**
 * Dish has descripption
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function hasDescription(req, res, next) {

    const { data: { description } ={}} = req.body;

    if (!description || description === "") {
        next({
            status: 400,
            message: `dish must have description`,
        })
    }
    res.locals.description = description;
    next();

}

/**
 * Dish has price
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function hasPrice(req, res, next) {

    const { data: { price } ={} } = req.body;

    if (!price) {
        next({
            status: 400,
            message: `dish must have price`,
        })
    }
    res.locals.price = price;
    next();
}

/**
 * Is price positive
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function isPricePositiveInt(req, res, next) {

    const price = res.locals.price; 
    if (price <=0 || !Number.isInteger(price)) {
        next ({
            status: 400,
            message: `dish must have price greater than 0`,
        })
    }
    next();
}

/**
 * Dish has image url
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
 function hasImgUrl(req, res, next) {

    const { data: { image_url } = {}} = req.body;

    if (!image_url || image_url === "") {
        next({
            status: 400,
            message: `dish must have image_url`,
        })
    }
    res.locals.image_url = image_url;
    next();
    
}

// Routes


/**
 * Post / create dish
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

function create (req, res, next) {
    const {
        data: {name, description, price, image_url}, 
    }  = req.body;
    const id = nextId();
    const newDish = {
        id,
        name,
        description,
        price,
        image_url
    }
    dishes.push(newDish);
    res.status(201).json({data: newDish})
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
 function read (req, res, next ) {
    res.json({data: res.locals.dish});
}

/**
 * update dish
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function update(req, res, next) {
    const dish = res.locals.dish;
    const {name, description, price, image_url} = res.locals;
        dish.name = name;
        dish.description = description
        dish.price = price;
        dish.image_url = image_url;
    
    res.json({data: dish});
}


/**
 * list dishes
 * @param {*} req 
 * @param {*} res 
 */
 function list (req, res) {
    res.json({data:dishes})
}

module.exports = {
    create : [
        hasName,
        hasDescription,
        hasPrice,
        isPricePositiveInt,
        hasImgUrl,
        create,
    ],
    update: [
        isDishExist,
        isDishIdMatches,
        hasName,
        hasDescription,
        hasPrice,
        isPricePositiveInt,
        hasImgUrl,
        update,
    ],
    read: [
        isDishExist,
        read
    ],
    list,
}