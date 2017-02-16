'use strict'

const express = require('express')
const database = require('../modules/database.js')
const router = express.Router()

router.get('/:campaignId/products', (req, res) => {
  database.getCampaignProducts(req.params.campaignId, (err, doc) => {
    if (err) {
      res.send({ error: err })
    } else {
      if (doc) {
        res.send(doc.products)
      } else {
        res.send({ error: 'Campaign not found for id: ' + req.params.campaignId + '.' })
      }
    }
  })
})

module.exports = router
