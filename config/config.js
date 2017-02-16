process.env.NODE_ENV = process.env.NODE_ENV || 'development'

// load the config file for the current environment
var config = require('./env/' + process.env.NODE_ENV)

// extend config with universal config data
config.port = process.env.PORT || 3000

// export config
module.exports = config
