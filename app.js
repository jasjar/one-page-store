'use strict'

const config = require('./config/config.js')
const express = require('express')
const expressValidator = require('express-validator')
const path = require('path')
const logger = require('morgan')
const helmet = require('helmet')
const bodyParser = require('body-parser')

const campaigns = require('./routes/campaigns.js')
const orders = require('./routes/orders.js')

// set the port for express to listen
const listenPort = (config.port || 3000)

// set express up
const app = express()

// set express up
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(expressValidator())
app.use(helmet())
//app.use(express.static(path.join(__dirname, 'public')))
app.disable('x-powered-by')

// Add headers
app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*')
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true)
  // Pass to next layer of middleware
  next()
})

// route handling
app.use('/campaigns', campaigns)
app.use('/orders', orders)

// favicon
app.get('/favicon.ico', (req, res) => {
  res.type('image/x-icon')
  res.send('')
})

// development error handlers
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res) => {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
} else {
  // production error handler
  // no stacktraces leaked to user
  app.use((err, req, res) => {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: {}
    })
  })
}

// listen on the configured port
app.listen(listenPort, () => {
  console.log('node_onepagestore app listening on port ' + listenPort.toString() + ' ...')
})
