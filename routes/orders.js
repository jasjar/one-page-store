'use strict'

const express = require('express')
const database = require('../modules/database.js')
const validator = require('../modules/validator.js')
const authorize = require('../modules/authorizenet.js')
const sparkpost = require('../modules/sparkpost.js')

const router = express.Router()

// place an order
router.post('/place', (req, res) => {
  // store the orderDoc for scope
  let orderDoc = null

  //validate the form data
  validator.validatePlacedOrder(req, insertOrder)

  // write to database   
  function insertOrder(err) {
    if (err) {
      res.send({ error: err })
    } else {
      database.insertOrder(req.body, req.ip, authorizeCard)
    }
  }

  // process card
  function authorizeCard(err, doc) {
    if (err) {
      res.send({ error: err })
    } else {
      if (!doc) {
        res.send({ error: 'Order was not written to the database.' })
      } else {
        orderDoc = doc
        authorize.authorizeCard(req.body, doc.payment.invoice_number, updateOrderAuthorized)
      }
    }
  }

  // update order as card being authorized
  function updateOrderAuthorized(err, authResp) {
    if (err) {
      res.send({ error: err })
    } else {
      if (authResp.getTransactionResponse().getResponseCode() !== '1') {
        res.send({ error: 'Card was not processed.  Verify your payment information and try to submit it again.' })
      } else {
        database.updateOrderAuthorized(orderDoc._id, authResp.getTransactionResponse().getTransId(),
          authResp.getTransactionResponse().getAuthCode(),
          authResp.getTransactionResponse().getMessages().getMessage()[0].getDescription(), sendOrderNotification)
      }
    }
  }

  // send order notification
  function sendOrderNotification(err, result) {
    if (err) {
      res.send({ error: err })
    } else {
      if (!result) {
        res.send({ error: 'Could not mark order as being authorized with id: ' + orderDoc._id })
      } else {
        sparkpost.sendOrderNotification(orderDoc, updateOrderNotificationSent)
      }
    }
  }

  // update order as order notification being sent
  function updateOrderNotificationSent(err) {
    if (err) {
      res.send({ error: err })
    } else {
      database.updateOrderNotificationSent(orderDoc._id, showResult)
    }
  }

  // handle the fact that the order has been placed
  function showResult(err, result) {
    if (err) {
      res.send({ error: err })
    } else {
      if (!result) {
        res.send({ error: 'Could not mark order notification for Order with id.' })
      } else {
        res.send(result);
      }
    }
  }
})

// update this order as shipped
router.post('/:orderId/markShipped/:trackingNumber', (req, res) => {
  // store the orderDoc for scope
  let orderDoc = null

  // get the order document for given order id
  database.getOrder(req.params.orderId, captureAuthorizedCard)

  // capture payment on the card with existing auth_trans_id field value
  function captureAuthorizedCard(err, doc) {
    if (err) {
      res.send({ error: err })
    } else {
      if (!doc) {
        res.send({ error: 'Order was not found for id: ' + req.params.orderId })
      } else {
        orderDoc = doc
        authorize.captureAuthorizedCard(doc.campaign_name, doc.invoice_number,
          doc.payment.auth_trans_id, updateOrderProcessed)
      }
    }
  }

  // write to database
  function updateOrderProcessed(err, authResp) {
    if (err) {
      res.send({ error: err })
    } else {
      if (authResp.getTransactionResponse().getResponseCode() !== '1') {
        res.send({ error: 'Card was not captured.  ' + JSON.stringify(authResp) })
      } else {
        database.updateOrderProcessed(orderDoc._id, authResp.getTransactionResponse().getTransId(),
          authResp.getTransactionResponse().getAuthCode(),
          authResp.getTransactionResponse().getMessages().getMessage()[0].getDescription(),
          req.params.trackingNumber, sendShipmentNotification)
      }
    }
  }

  // send shipment notification
  function sendShipmentNotification(err, result) {
    if (err) {
      res.send({ error: err })
    } else {
      if (!result) {
        res.send({ error: 'Could not mark order as being processed with id: ' + orderDoc._id })
      } else {
        sparkpost.sendShipmentNotification(orderDoc, req.params.trackingNumber, updateShipmentNotificationSent)
      }
    }
  }

  // mark order as notified of shipment
  function updateShipmentNotificationSent(err) {
    if (err) {
      res.send({ error: err })
    } else {
      database.updateShipmentNotificationSent(orderDoc._id, showResult)
    }
  }

  // handle the fact that the order has been shipped
  function showResult(err, result) {
    if (err) {
      res.send({ error: err })
    } else {
      if (!result) {
        res.send({ error: 'Could not mark shipment notification for Order with id.' })
      } else {
        res.send(result);
      }
    }
  }
})

// update this order as delivered
router.post('/:orderId/markDelivered', (req, res) => {
  // update this order as delivered
  database.updateOrderDelivered(req.params.orderId, (err, result) => {
    if (err) {
      res.send({ error: err })
    } else {
      if (result) {
        res.send(result)
      } else {
        res.send({ error: 'Could not mark as delivered Order with id: ' + req.params.orderId + '.' })
      }
    }
  })
})

module.exports = router
