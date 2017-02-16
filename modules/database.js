'use strict'

const config = require('../config/config.js')
const monk = require('monk')
const utils = require('./utils.js')

const dbUrl = config.mongoDbUrl
const db = monk(dbUrl)

// returns a JSON representation of all products for a given campaign
const getCampaignProducts = (id, callback) => {
  let campaigns = db.get('campaigns')
  campaigns.findOne({ '_id': id }).then((doc) => {
    callback(null, doc)
  }).catch((err) => {
    callback(err, null)    
  }).then(() => {
    db.close()
  })
}

// simply return an order document for a given order id
const getOrder = (id, callback) => {
  let orders = db.get('orders')
  orders.findOne({ '_id': id }).then((doc) => {
    callback(null, doc)
  }).catch((err) => {
    callback(err, null)    
  }).then(() => {
    db.close()
  })
}

// inserts data into the orders document in MongoDB
const insertOrder = (order, userIp, callback) => {
  let additionalDonation = (typeof(order.additional_donation) !== 'undefined' && order.additional_donation !== null && order.additional_donation !== '' ? parseFloat(order.additional_donation) : 0.00)
  let orderSubtotal = utils.getOrderSubTotal(order)

  let orders = db.get('orders')

  // write the order to mongo
  orders.insert({
    campaign: {
      id: monk.id(order.campaign_id),
      name: order.campaign_name
    },
    order_status: 'pending',
    payment_status: 'pending',
    shipping_status: 'pending',
    additional_donation: additionalDonation,
    order_subtotal: orderSubtotal,
    order_total: orderSubtotal + additionalDonation,
    products: order.products,
    billing: {
      first_name: order.bill_first_name,
      last_name: order.bill_last_name,
      address: order.bill_address,
      city: order.bill_city,
      state: order.bill_state,
      zip_code: order.bill_zip_code,
      email_address: order.email_address,
      phone_number: order.phone_number
    },
    shipping: {
      first_name: order.ship_first_name,
      last_name: order.ship_last_name,
      address: order.ship_address,
      city: order.ship_city,
      state: order.ship_state,
      zip_code: order.ship_zip_code
    },
    payment: {
      invoice_number: new Date().getTime()
    },
    ip_address: userIp,
    dates: {
      created_on: new Date()
    }
  }).then((doc) => {
    callback(null, doc)
  }).catch((err) => {
    callback(err, null)
  }).then(() => {
    db.close()
  })
}

// updates the order document to reflect the credit card authorization
const updateOrderAuthorized = (id, authTransId, authTransCode, authTransResult, callback) => {
  let orders = db.get('orders')
  orders.update(id, {
    $set: {
      payment_status: 'authorized',
      'payment.auth_trans_id': authTransId,
      'payment.auth_trans_code': authTransCode,
      'payment.auth_trans_result': authTransResult
    }
  }).then((result) => {
    callback(null, result)
  }).catch((err) => {
    callback(err, null)    
  }).then(() => {
    db.close()
  })
}

// updates the order document to reflect that it has been shipped & paid
const updateOrderProcessed = (id, captureTransId, captureTransCode, captureTransResult, trackingNumber, callback) => {
  let orders = db.get('orders')
  orders.update(id, {
    $set: {
      order_status: 'processed',
      shipping_status: 'shipped',
      payment_status: 'paid',
      tracking_number: trackingNumber,
      'payment.capture_trans_id': captureTransId,
      'payment.capture_trans_code': captureTransCode,
      'payment.capture_trans_result': captureTransResult,
      'dates.marked_processed_on': new Date()
    }
  }).then((result) => {
    callback(null, result)
  }).catch((err) => {
    callback(err, null)    
  }).then(() => {
    db.close()
  })
}

// updates the order document to reflect that it has been delivered
const updateOrderDelivered = (id, callback) => {
  let orders = db.get('orders')
  orders.update(id, {
    $set: {
      order_status: 'complete',
      shipping_status: 'delivered',
      'dates.marked_delivered_on': new Date()
    }
  }).then((result) => {
    callback(null, result)
  }).catch((err) => {
    callback(err, null)    
  }).then(() => {
    db.close()
  })
}

// updates the order document to reflect that the order notification email has been sent
const updateOrderNotificationSent = (id, callback) => {
  let orders = db.get('orders')
  orders.update(id, {
    $set: {
      'notifications.order_notification_sent': true,
      'dates.order_notification_sent_on': new Date()
    }
  }).then((result) => {
    callback(null, result)
  }).catch((err) => {
    callback(err, null)    
  }).then(() => {
    db.close()
  })
}

// updates the order document to reflect that the shipment notification email has been sent
const updateShipmentNotificationSent = (id, callback) => {
  let orders = db.get('orders')
  orders.update(id, {
    $set: {
      'notifications.shipment_notification_sent': true,
      'dates.shipment_notification_sent_on': new Date()
    }
  }).then((result) => {
    callback(null, result)
  }).catch((err) => {
    callback(err, null)    
  }).then(() => {
    db.close()
  })
}

module.exports = {
  getCampaignProducts,
  getOrder,
  insertOrder,
  updateOrderAuthorized,
  updateOrderProcessed,
  updateOrderDelivered,
  updateOrderNotificationSent,
  updateShipmentNotificationSent
}