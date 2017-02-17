process.env.NODE_ENV = process.env.NODE_ENV || 'local'

// load the config file for the current environment
let config = require('./env/' + process.env.NODE_ENV)

// extend config with universal config data
config.port = process.env.PORT || 3000

// export config
module.exports = config
