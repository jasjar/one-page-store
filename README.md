# one-page-store
Basic server components necessary to run a one-page store using Express (web server), MongoDB (database), Authorize.Net (payment processing), and Sparkpost (notifications).

### Prerequisites
The following are necessary in order to run one-page-store in your development environment.
* Access to [MongoDB](https://www.mongodb.com/) instance
* Access to [Authorize.Net](http://developer.authorize.net/) environment. (need API Login Key and Transaction Key)
* Access to [Sparkpost API](https://developers.sparkpost.com/api) (need API Key)

Once you establish a connection to MongoDB, you will need to create a collection for "campaigns" and a collection for "orders."  Once you create both collections, add the following document to the "campaigns" collection:

```
{
    "name" : "ACME, Inc",
    "start_date" : ISODate("2016-12-09T00:00:00.00-06:00"),
    "end_date" : ISODate("2017-12-09T00:00:00.000-06:00"),
    "created_on" : ISODate("2016-12-09T00:00:00.000-06:00"),
    "products" : [ 
        {
            "name" : "T-Shirt",
            "image_full" : "https://upload.wikimedia.org/wikipedia/commons/2/24/Blue_Tshirt.jpg",
            "image_thumb" : "https://upload.wikimedia.org/wikipedia/commons/2/24/Blue_Tshirt.jpg",
            "options" : [ 
                {
                    "sku" : "SHIRT-L",
                    "name" : "Large",
                    "price" : 11.95
                }, 
                {
                    "sku" : "SHIRT-XL",
                    "name" : "Extra Large",
                    "price" : 12.95
                }
            ]
        }
    ]
}
```

## Configuration
Create two configuration files in the /config/env/ folder called development.js and production.js that look like this:
```
module.exports = {
  authorizeDebug: true,
  authorizeApiLoginKey: process.env.AUTHORIZE_LOGIN_KEY,
  authorizeTransactionKey: process.env.AUTHORIZE_TRANSACTION_KEY,
  // the next property is needed for production only
  authorizeProductionUrl: 'https://api.authorize.net/xml/v1/request.api', 
  mongoDbUrl: process.env.MONGODB_CONNECTION,
  sparkPostApiKey: process.env.SPARKPOST_APIKEY,
  orderNotificationTemplate: process.env.ORDER_NOTIFICATION_TEMPLATE,
  shipmentNotificationTemplate: process.env.SHIPMENT_NOTIFICATION_TEMPLATE    
}
```
**Note:** You will need to modify these two files to include your prerequisite information above.

## Notification Templates
Sample email notification templates are included in this project in the /email_templates folder.  One is for order notification and the other for shipment notification.
Both utilize substitution data (dynamic data) to show pricing, tracking, etc.  They will need to be added to SparkPost in order for notifications to work properly.

## Getting Started
```
git clone https://github.com/jasjar/one-page-store.git
npm install
npm start
```

## Authors

* **Jason Jarrett** - [jasjar](https://github.com/jasjar)

## License

This project is licensed under the MIT License
