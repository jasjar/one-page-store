'use strict'

const config = require('../config/config.js')
const SparkPost = require('sparkpost')
const client = new SparkPost(config.sparkPostApiKey)
const utils = require('./utils.js')

// sendOrderNotification - sends an e-mail notifying the customer of their order
const sendOrderNotification = (orderDoc, callback) => {
  let templateId = config.orderNotificationTemplate

  // format ext_price to currency for transactional mailing
  orderDoc.products.forEach((element) => {
    element.subtotal = utils.toCurrency(element.subtotal)
  })

  client.transmissions.send({
    content: {
      template_id: templateId
    },
    recipients: [
      {
        address: {
          email: orderDoc.billing.email_address,
          name: orderDoc.billing.first_name + ' ' + orderDoc.billing.last_name
        },
        substitution_data: {
          campaign_name: orderDoc.campaign.name,
          products: orderDoc.products,
          additional_donation: utils.toCurrency(orderDoc.additional_donation),
          order_total: utils.toCurrency(orderDoc.order_total),
          order_id: orderDoc._id.toString(),
          billing: orderDoc.billing,
          shipping: orderDoc.shipping,
          created_on: orderDoc.dates.created_on.toLocaleDateString() + ' ' + orderDoc.dates.created_on.toLocaleTimeString()
        }
      }
    ]
  })
  .then(data => {
    callback(null, data)
  })
  .catch(err => {
    callback(err, null)
  })
}

// sendShipmentNotification - sends an e-mail notifying the customer of their order shipment
const sendShipmentNotification = (orderDoc, trackingNumber, callback) => {
  let templateId = config.shipmentNotificationTemplate

  // format subtotal to currency for transactional mailing
  orderDoc.products.forEach((element) => {
    element.subtotal = utils.toCurrency(element.subtotal)
  })

  client.transmissions.send({
    content: {
      template_id: templateId
    },
    recipients: [
      {
        address: {
          email: orderDoc.billing.email_address,
          name: orderDoc.billing.first_name + ' ' + orderDoc.billing.last_name
        },
        substitution_data: {
          campaign_name: orderDoc.campaign.name,
          products: orderDoc.products,
          additional_donation: utils.toCurrency(orderDoc.additional_donation),
          order_total: utils.toCurrency(orderDoc.order_total),
          order_id: orderDoc._id.toString(),
          shipping: orderDoc.shipping,
          created_on: orderDoc.dates.created_on.toLocaleDateString() + ' ' + orderDoc.dates.created_on.toLocaleTimeString(),
          tracking_number: trackingNumber
        }
      }
    ]
  })
  .then(data => {
    callback(null, data)
  })
  .catch(err => {
    callback(err, null)
  })
}

module.exports = {
  sendOrderNotification,
  sendShipmentNotification
}
