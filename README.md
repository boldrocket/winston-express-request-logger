# Winston express request loggger
Winston express request logger is a library that extends winston to print out request, process, error and user information. It also prints out a unique identifier per request to be able to track which request a log line belongs to.

List of elements added to the log as a prefix
* Process id e.g pId: 9472
* Unique request identifier e.g uId: cidstmimz000ob43upnw7xp2b
* User identifier e.g cId: 123
* User ip address e.g cIP: 127.0.0.1
* User action e.g cAction: GET /api/user/55dc48232a8708a3078e995a

Additionally if there is an err object as part of the log arguments the error stack trace will be printed in the logs.

## install ##
`npm install winston-express-request-logger`

## initialisation ##
There are two steps to initialise the module.
The first is to initialise your logger which takes the same arguments as a winston logger. This needs winston as a prerequisite to be able to create the transports. This step needs to be done before the logger is used.

```
// Initialise logger
var winston = require('winston');
var winstonExRegLogger = require("winston-express-request-logger");
winstonExRegLogger.createLogger({
    transports: [
        new (winston.transports.File)({
            filename: 'knugget-service.log',
            handleExceptions: true,
            timestamp:true,
            level:"info"
        }),
        new (winston.transports.Console)({
            handleExceptions: true,
            timestamp: true,
            level:"info"
        })
    ],
    exitOnError: false
});
```

The second step is to add the request interceptor to express in order to get the necessary information from the express request object. The user id in this case is retrieved by getting the cookie named id from express (req.cookies['id']).

```
// Request Interceptor setup
var winstonExRegLogger = require("winston-express-request-logger");
function configureApp(app, env) {
	.....
	.....
	app.use(winstonExRegLogger.requestDetails);
	.....
	.....
}

```

An optional step if you would like to override the user id printed by the module, is to add your own interceptor that initialises the req.loggerUserId variable. This needs to go before the requestDetails one.

```
// Custom Request Interceptor setup
var winstonExRegLogger = require("winston-express-request-logger");
function configureApp(app, env) {
	.....
	.....
	var customUserID = function customUserID(req, res, next) {
        req.loggerUserId = 123;
        next();
    };
    app.use(customUserID);

	app.use(winstonExRegLogger.requestDetails);
	.....
	.....
}
```

## logging ##
After the initialisation you can use the logger exactly as winston logger (log level, dynamic number of arguments). The only difference is that if you would like the request information to be printed the first argument of your logger needs to be the req object. Additionally, any Error object would be printed based on its stack trace.

```
// Logging
var logger = require("winston-express-request-logger").getLogger();

logger.info(req,"Get the user's details"); 
// prints 2015-08-26T13:59:16.659Z - info: pId:9677 - uId:cidsul8ry000pgt3ugwebvei5 - cId:55dc48232a8708a3078e995a - cIP: 127.0.0.1 - cAction: GET /api/user/55dc48232a8708a3078e995a Get user details

logger.info("Get the user's details");
// prints 2015-08-26T13:59:16.659Z - info: Get the user's details
```