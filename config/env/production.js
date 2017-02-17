module.exports = {
  authorizeDebug: false,
  authorizeApiLoginKey: process.env.AUTHORIZE_LOGIN_KEY,
  authorizeTransactionKey: process.env.AUTHORIZE_TRANSACTION_KEY,
  authorizeProductionUrl: process.env.AUTHORIZE_PRODUCTION_URL,
  mongoDbUrl: process.env.MONGODB_CONNECTION,
  sparkPostApiKey: process.env.SPARKPOST_APIKEY,
  orderNotificationTemplate: process.env.ORDER_NOTIFICATION_TEMPLATE,
  shipmentNotificationTemplate: process.env.SHIPMENT_NOTIFICATION_TEMPLATE
}
