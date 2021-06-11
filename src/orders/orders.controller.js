const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
/**
 * is order exist
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
function isOrderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);
  
    if (foundOrder) {
      res.locals.order = foundOrder;
      return next();
    }
    next({
      status: 404,
      message: `Order id ${orderId} does not exist`,
    });
}

/**
 * has order contain deliver to
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function hasDeliverTo( req, res, next) {
    const {
        data: { deliverTo } = {}
      } = req.body;
    
      if (!deliverTo || deliverTo === "") {
        next({
          status: 400,
          message: "Order must have a deliverTo",
        });
      }
    
      res.locals.deliverTo = deliverTo;
      next();
    
}

/**
 * has mobile number
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function hasMobileNumber( req, res, next) {
    const {
        data: { mobileNumber } = {}
      } = req.body;
    
      if (!mobileNumber || mobileNumber === "") {
        next({
          status: 400,
          message: "Order must have a mobileNumber",
        });
      }
    
      res.locals.mobileNumber = mobileNumber;
      next();
}

/**
 * has dishes
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function hasDishes( req, res, next) {
    const {
        data: { dishes } = {}
      } = req.body;
    
      if (!dishes) {
        next({
          status: 400,
          message: "Order must have a dish",
        });
      }
    
      res.locals.dishes = dishes;
      next();
}

/**
 * does order has one dish
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
function orderShouldHaveAtleastOneDish(req, res, next) {
    const dishes = res.locals.dishes;

    if (!Array.isArray(dishes) || dishes.length === 0) {
      return next({
        status: 400,
        message: "Order must have at least one dish",
      });
    }
  
    next();
}

/**
 * dish should have one quantity
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
function dishShouldHaveAtleastOneQuantity (req, res, next) {

    const dishes = res.locals.dishes;

    for (let i = 0; i < dishes.length; i++) {
      if (
        !dishes[i].quantity ||
        !(dishes[i].quantity > 0) ||
        !Number.isInteger(dishes[i].quantity)
      ) {
        return next({
          status: 400,
          message: `Given Dish ${i} must have a quantity greater than 0`,
        });
      }
    }
  
    next();
}

/**
 * does order matches
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
 function isOrderIdMatches( req, res, next) {
    const {
        data: { id } = {}
      } = req.body;
    
      const orderId = req.params.orderId;
    
      if (!id || orderId === id) {
        return next();
      }
      next({
        status: 400,
        message: `Order id - ${id}  does not matches with route id: - ${orderId}`,
      });
}

/**
 * is status valid
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function isValidStatusExist(req, res, next) {
    const { data: { status } = {} } = req.body;
  const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];
  if (!status || !status.trim() || !validStatus.includes(status)) {
    return next({
      status: 400,
      message: `Order should have a status of pending, preparing, out-for-delivery, delivered`
    })
  }
  if (status === 'delivered') {
    return next({
      status: 400,
      message: "Order has been delieverd.can not changed"
    })
  }
  return next();
}

/**
 * is delete order when in pending status
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function isOrderDeletedInPendingStatus(req, res, next) {
    const { order } = res.locals;
  if (order.status === "pending") {
    next();
  }
  next({
    status: 400,
    message: "Unable to delete order unless it is pending",
  });

}

//Routes

/**
 * create new order
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function create(req, res, next) {
    const { deliverTo, mobileNumber, dishes } = res.locals;
  // set default status of new orders as "pending", unless otherwise specified
  const { status = "pending" } = req.body;
  const id = nextId();
  const newOrder = {
    id,
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

/**
 * read order
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function read(req, res, next) {
    res.json({data: res.locals.order})
}

/**
 * update order
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function update(req, res, next) {
    const order = res.locals.order;
  const {
    data: { id, deliverTo, mobileNumber, status, dishes } = {},
  } = req.body;
  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;

  res.json({ data: order });
}

/**
 * delete order
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function destroy(req, res, next) {
    const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  orders.splice(index, 1);
  res.sendStatus(204);
}

/**
 * list all orders
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
 function list(req, res, next) {
    res.json({ data: orders })
}

module.exports = {
    
        create: [
            hasDeliverTo,
            hasMobileNumber,
            hasDishes,
            orderShouldHaveAtleastOneDish,
            dishShouldHaveAtleastOneQuantity,
            create
        ],
        read: [
            isOrderExists,
            read,
        ],
        update: [
            isOrderExists,
            isValidStatusExist,
            isOrderIdMatches,
            hasDeliverTo,
            hasMobileNumber,
            hasDishes,
            orderShouldHaveAtleastOneDish,
            dishShouldHaveAtleastOneQuantity,
            update
        ],
        delete: [
            isOrderExists,
            isOrderDeletedInPendingStatus,
            destroy
        ],
        list,
};