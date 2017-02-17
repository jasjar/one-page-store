'use strict'

const config = require('../config/config.js')
const utils = require('./utils.js')
const ApiContracts = require('authorizenet').APIContracts
const ApiControllers = require('authorizenet').APIControllers

const loginKey = config.authorizeApiLoginKey
const transactionKey = config.authorizeTransactionKey
const debugMode = config.authorizeDebug
const productionUrl = config.authorizeProductionUrl

// authorizes a card for this particular order - does not collect money initially - that is done at shipment/capture
const authorizeCard = (order, invoiceNumber, callback) => {
  let merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType()
  merchantAuthenticationType.setName(loginKey)
  merchantAuthenticationType.setTransactionKey(transactionKey)

  let creditCard = new ApiContracts.CreditCardType()
  creditCard.setCardNumber(order.card_number)
  creditCard.setExpirationDate(order.card_exp_month.toString() + order.card_exp_year.toString())
  creditCard.setCardCode(order.card_code)

  let paymentType = new ApiContracts.PaymentType()
  paymentType.setCreditCard(creditCard)

  let orderDetails = new ApiContracts.OrderType()
  orderDetails.setInvoiceNumber(invoiceNumber)
  orderDetails.setDescription(order.campaign_name)

  let billTo = new ApiContracts.CustomerAddressType()
  billTo.setFirstName(order.bill_first_name)
  billTo.setLastName(order.bill_last_name)
  billTo.setAddress(order.bill_address)
  billTo.setCity(order.bill_city)
  billTo.setState(order.bill_state)
  billTo.setZip(order.bill_zip_code)
  billTo.setCountry('USA')
  billTo.setEmail(order.email_address)
  billTo.setPhoneNumber(order.phone_number)

  let shipTo = new ApiContracts.CustomerAddressType()
  shipTo.setFirstName(order.ship_first_name)
  shipTo.setLastName(order.ship_last_name)
  shipTo.setAddress(order.ship_address)
  shipTo.setCity(order.ship_city)
  shipTo.setState(order.ship_state)
  shipTo.setZip(order.ship_zip_code)
  shipTo.setCountry('USA')

  let transactionRequestType = new ApiContracts.TransactionRequestType()
  transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHONLYTRANSACTION)
  transactionRequestType.setPayment(paymentType)
  transactionRequestType.setAmount(utils.getOrderSubTotal(order) + (typeof (order.additional_donation) !== 'undefined' && order.additional_donation !== null && order.additional_donation !== '' ? parseFloat(order.additional_donation) : 0.00))
  transactionRequestType.setOrder(orderDetails)
  transactionRequestType.setBillTo(billTo)
  transactionRequestType.setShipTo(shipTo)

  let createRequest = new ApiContracts.CreateTransactionRequest()
  createRequest.setMerchantAuthentication(merchantAuthenticationType)
  createRequest.setTransactionRequest(transactionRequestType)

  // pretty print request
  if (debugMode) {
    console.log('REQUEST SENT.......................................')
    console.log(JSON.stringify(createRequest.getJSON(), null, 2))
  }
  // end pretty print request

  let ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON())
  if (productionUrl) {
    ctrl.setEnvironment(productionUrl)
  }

  ctrl.execute(() => {
    let apiResponse = ctrl.getResponse()
    let response = new ApiContracts.CreateTransactionResponse(apiResponse)

    // pretty print response
    if (debugMode) {
      console.log('RESPONSE RECEIVED.......................................')
      console.log(JSON.stringify(response, null, 2))

      if (response !== null) {
        if (response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
          if (response.getTransactionResponse().getMessages() !== null) {
            console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId())
            console.log('Response Code: ' + response.getTransactionResponse().getResponseCode())
            console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode())
            console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription())
          } else {
            console.log('Failed Transaction.')
            if (response.getTransactionResponse().getErrors() !== null) {
              console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode())
              console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText())
            }
          }
        } else {
          console.log('Failed Transaction.')
          if (response.getTransactionResponse() !== null && response.getTransactionResponse().getErrors() !== null) {
            console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode())
            console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText())
          } else {
            console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode())
            console.log('Error message: ' + response.getMessages().getMessage()[0].getText())
          }
        }
      } else {
        console.log('Null Response.')
      }
    }
    // end pretty print response

    // call back with Authorize.Net response
    callback(null, response)
  })
}

// captures an existing authorized card - money is collected at this point - called after order is shipped
const captureAuthorizedCard = (campaignName, invoiceNumber, authTransId, callback) => {
  let merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType()
  merchantAuthenticationType.setName(loginKey)
  merchantAuthenticationType.setTransactionKey(transactionKey)

  let orderDetails = new ApiContracts.OrderType()
  orderDetails.setInvoiceNumber(invoiceNumber)
  orderDetails.setDescription(campaignName)

  let transactionRequestType = new ApiContracts.TransactionRequestType()
  transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.PRIORAUTHCAPTURETRANSACTION)
  transactionRequestType.setRefTransId(authTransId)
  transactionRequestType.setOrder(orderDetails)

  let createRequest = new ApiContracts.CreateTransactionRequest()
  createRequest.setMerchantAuthentication(merchantAuthenticationType)
  createRequest.setTransactionRequest(transactionRequestType)

  // pretty print request
  if (debugMode) {
    console.log('REQUEST SENT.......................................')
    console.log(JSON.stringify(createRequest.getJSON(), null, 2))
  }
  // end pretty print request

  let ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON())
  if (productionUrl) {
    ctrl.setEnvironment(productionUrl)
  }

  ctrl.execute(() => {
    let apiResponse = ctrl.getResponse()
    let response = new ApiContracts.CreateTransactionResponse(apiResponse)

    // pretty print response
    if (debugMode) {
      console.log('RESPONSE RECEIVED.......................................')
      console.log(JSON.stringify(response, null, 2))

      if (response !== null) {
        if (response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
          if (response.getTransactionResponse().getMessages() !== null) {
            console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId())
            console.log('Response Code: ' + response.getTransactionResponse().getResponseCode())
            console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode())
            console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription())
          } else {
            console.log('Failed Transaction.')
            if (response.getTransactionResponse().getErrors() !== null) {
              console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode())
              console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText())
            }
          }
        } else {
          console.log('Failed Transaction. ')
          if (response.getTransactionResponse() !== null && response.getTransactionResponse().getErrors() !== null) {
            console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode())
            console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText())
          } else {
            console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode())
            console.log('Error message: ' + response.getMessages().getMessage()[0].getText())
          }
        }
      } else {
        console.log('Null Response.')
      }
    }
    // end pretty print response

    // call back with Authorize.Net response
    callback(null, response)
  })
}

module.exports = {
  authorizeCard,
  captureAuthorizedCard
}
