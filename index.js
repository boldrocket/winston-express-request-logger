var winston         = require('winston');
var util            = require('util');
var typeOf          = require('type-of-is');
var http            = require('http');
var cuid            = require('cuid');
var get_ip          = require('ipware')().get_ip;
var processModule   = require('process');

var Logger = function(options){
    Logger.super_.apply(this, arguments);
}
util.inherits(Logger, winston.Logger);

global.logger = '';

Logger.prototype.log = function () {

    var args = Array.prototype.slice.call(arguments, 0);

    var req = args[1];

    if(typeOf.is(req,http.IncomingMessage)) {
        args[1] = req.loggerRequestDetails;
    }

    for(var i=0; i < args.length; i++ ){
        if(args[i] instanceof Error){
            args[i] = args[i].stack;
        }
    }

    Logger.super_.prototype.log.apply(this, args);

};

winston.Logger = Logger;

module.exports = {
        createLogger : function createLogger(args) {
            global.logger = new Logger(args);
            return global.logger;
        },
        getLogger : function getDefaultLogger() {
            return global.logger;
        },
        requestDetails : function requestDetails(req, res, next) {
            var userid = "anonymous";


            if (typeof req !== undefined && req) {

                if(req.loggerUserId !== undefined){
                    userid = req.loggerUserId;
                } else if(req.cookies !== undefined && req.cookies && req.cookies['id'] !== undefined){
                    userid = req.cookies['id'];
                }
            }

            req.loggerRequestDetails =  "pId: " + processModule.pid + " - uId: " + cuid() + " - cId: " + userid + " - cIP: " + get_ip(req).clientIp + " - cAction: " + req.method + " " + req.url;
            next();
    }
};