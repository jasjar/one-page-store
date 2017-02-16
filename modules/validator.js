'use strict'

// validatePlacedOrder - validates a given order that has been posted to the app
const validatePlacedOrder = (req, callback) => {  
  // validate the form parameters
  req.checkBody('campaign_id', 'Campaign Id is empty').notEmpty()
  req.checkBody('campaign_name', 'Campaign Name is empty').notEmpty()
  req.checkBody('products', 'You have not chosen any products for this order.').notEmpty()

  req.checkBody('bill_first_name', 'Billing First Name is empty.').notEmpty()
  req.checkBody('bill_last_name', 'Billing Last Name is empty.').notEmpty()
  req.checkBody('bill_address', 'Billing Address is empty.').notEmpty()
  req.checkBody('bill_city', 'Billing City is empty.').notEmpty()
  req.checkBody('bill_state', 'Billing State is empty.').notEmpty()
  req.checkBody('bill_state', 'Billing State may only contain letters.').isAlpha()
  req.checkBody('bill_zip_code', 'Billing Zip Code is empty.').notEmpty()
  req.checkBody('bill_zip_code', 'Billing Zip Code may only contain numbers.').isNumeric()
  req.checkBody('bill_zip_code', 'Billing Zip Code must be five numeric digits.').isLength({ min: 5, max: 5 })

  req.checkBody('email_address', 'E-mail Address is empty.').notEmpty()
  req.checkBody('email_address', 'E-mail Address is not valid.').isEmail()

  req.checkBody('ship_first_name', 'Shipping First Name is empty.').notEmpty()
  req.checkBody('ship_last_name', 'Shipping Last Name is empty.').notEmpty()
  req.checkBody('ship_address', 'Shipping Address is empty.').notEmpty()
  req.checkBody('ship_city', 'Shipping City is empty.').notEmpty()
  req.checkBody('ship_state', 'Shipping State is empty.').notEmpty()
  req.checkBody('ship_state', 'Shipping State may only contain letters.').isAlpha()
  req.checkBody('ship_zip_code', 'Shipping Zip Code is empty.').notEmpty()
  req.checkBody('ship_zip_code', 'Shipping Zip Code may only contain numbers.').isNumeric()
  req.checkBody('ship_zip_code', 'Shipping Zip Code must be five numeric digits.').isLength({ min: 5, max: 5 })

  req.checkBody('card_name', 'Name on Card is empty.').notEmpty()
  req.checkBody('card_number', 'Card Number is empty.').notEmpty()
  req.checkBody('card_number', 'Card Number is not valid.').isCreditCard()
  req.checkBody('card_exp_month', 'Card Expiration Month is empty.').notEmpty()
  req.checkBody('card_exp_month', 'Card Expiration Month may only contain numbers.').isNumeric()
  req.checkBody('card_exp_year', 'Card Expiration Year is empty.').notEmpty()
  req.checkBody('card_exp_year', 'Card Expiration Year may only contain numbers.').isNumeric()
  req.checkBody('card_code', 'Card Code is empty.').notEmpty()
  req.checkBody('card_code', 'Card Code may only contain numbers.').isNumeric()

  // check additional_donation - if not empty, make sure it is a decimal/money value
  if (req.additional_donation) {
    if (req.additional_donation !== '') {
      req.checkBody('additional_donation', 'Any additional donation must be a valid dollar amount.').isDecimal()
    }
  }

  // call back with the validation errors
  callback(req.validationErrors())
}

module.exports = {
  validatePlacedOrder
}
