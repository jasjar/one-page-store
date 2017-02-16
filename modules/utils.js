'use strict'

// get the order subtotal - gets the products in the order and calculates the price
const getOrderSubTotal = (order) => {
  return order.products.reduce((prev, curr) => {
    return prev + parseFloat(curr.subtotal)
  }, 0)
}

// convert a number to currency - if null number, return $0.00
const toCurrency = (number) => {
  return (number ? '$' + parseFloat(number).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') : '$0.00')
}

module.exports = {
  getOrderSubTotal,
  toCurrency
}
