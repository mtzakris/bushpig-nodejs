/**
 * Created by jackerman on 14/06/15.
 */
'use strict';

var betfairClient = require('betfair');
var moment = require('moment');


function BetfairService(){
    this.settings = {
        appKey : null,
        sslOptions : {
            key: null,
            cert: null
        },
        credentials : {
            username: null,
            password: null
        },
        isBotLogin : null
    };
    this.loginMoment = null,
    this.session = null
}


BetfairService.prototype = {
    /**
     * Initialize betfairservice
     * @param {Object} credentials = {username: .. , password: ..}
     * @param {String} betfairAppKey
     * @param {Object} sslOptions = {cert: .. , key: ..}
     */
    initialize: function(credentials, betfairAppKey,  sslOptions, isBot){
        if(betfairAppKey)
            this.appKey = betfairAppKey;

        if(credentials.hasOwnProperty('username') && credentials.hasOwnProperty('password')){
            this.settings.credentials = credentials;
        }

        if(sslOptions.hasOwnProperty('cert') && sslOptions.hasOwnProperty('key')){
            this.settings.sslOptions = sslOptions;
        }

        this.settings.isBotLogin = isBot;
    },
    /**
     * Login to betfair
     */
    login: function (next) {
        this.session = betfairClient.newSession(this.appKey);;
        var sslOptions = this.settings.sslOptions;
        var username = this.settings.credentials.username;
        var password = this.settings.credentials.password;
        //set sslOptions for bot login
        this.session.setSslOptions(sslOptions);
        betLogger.info('===== Sending login ... =====');
        this.session.login(username, password, function (error, res) {
            if(error){
                betLogger.error('Login error', error);
                return next(error);
            }else{
                betLogger.info('Login OK, %s secs', res.duration / 1000);
                //session lasts for 4 hours
                this.loginMoment.expirationDate = moment().add(4, 'hours');
                return next(error)
            }

        })
    },
    /**
     * Restore session. Session ends after 4 hours
     */
    keepAlive: function (next) {
        betLogger.info('===== Sending keepAlive ... =====');
        this.session.keepAlive(function (error, res) {
            if (error) {
                betLogger.error('KeepAlive error', error);
                return next(error);
            }else{
                betLogger.info('keepAlive OK, %s secs', res.duration / 1000, res);
                return next(null)
            }
        });
    },

    listEvents: function (params, next) {
        var ids = [];
        this.session.listEvents(params, function (error, res) {
            if (error) {
                next(error)
            } else {
                for (var index in res.response.result) {
                    var item = res.response.result[index];
                    ids.push(item.event.id);
                }
                next(null, ids);
            }
        })
    },


}



//module.exports = {
//    login: function (next) {
//        var session = settings.session;
//        //set sslOptions for bot login
//        session.setSslOptions(settings.sslOptions);
//        betLogger.info('===== Sending login ... =====');
//        session.login(settings.credentials.username, settings.credentials.password, function (error, res) {
//            if(error){
//                betLogger.error('Login error', error);
//                return next(error);
//            }else{
//                betLogger.info('Login OK, %s secs', res.duration / 1000);
//                //session lasts for 4 hours
//                loginMoment.expirationDate = moment().add(4, 'hours');
//                return next(error)
//            }
//
//        })
//    },
//    keepAlive: function (next) {
//        betLogger.info('===== Sending keepAlive ... =====');
//        var session = settings.session;
//        session.keepAlive(function (error, res) {
//            if (error) {
//                betLogger.error('KeepAlive error', error);
//                return next(error);
//            }else{
//                betLogger.info('keepAlive OK, %s secs', res.duration / 1000, res);
//                return next(null)
//            }
//        });
//    },
//
//    listEvents: function (params, next) {
//        var session = settings.session;
//        var ids = [];
//        session.listEvents(params, function (error, res) {
//            if (error) {
//                next(error)
//            } else {
//                for (var index in res.response.result) {
//                    var item = res.response.result[index];
//                    ids.push(item.event.id);
//                }
//                next(null, ids);
//            }
//        })
//    },
//    listCompetitions: function (params, next) {
//        var session = settings.session;
//        var ids = [];
//        session.listCompetitions(params, function (error, res) {
//            if (error) {
//                next(error)
//            } else {
//                for (var index in res.response.result) {
//                    var item = res.response.result[index];
//                    ids.push(item.competition.id);
//                }
//                next(null, ids);
//            }
//        })
//    },
//    listMarketCatalogue: function (params, next) {
//        var session = settings.session;
//        var ids = [];
//        session.listMarketCatalogue(params, function (error, res) {
//            if (error) {
//                next(error)
//            } else {
//                for (var index in res.response.result) {
//                    var item = res.response.result[index];
//                    ids.push(item.marketId);
//                }
//                next(null, ids);
//            }
//        });
//    },
//    listMarketBook: function (params, next) {
//        var session = settings.session;
//        session.listMarketBook(params, function (error, res) {
//            if (error) {
//                next(error)
//            } else {
//                for (var index in res.response.result) {
//                    var item = res.response.result[index];
//                    console.log("test");
//                }
//                next(null);
//            }
//        })
//    },
//    /**
//     * Calculates the outcome of the bet (back and lay)
//     * @param {object} params
//     * @param {callback} next - The callback that handles the response.
//     * @return {Number} value
//     */
//    placeBet: function (params, next) {
//        var session = settings.session;
//        session.placeOrders(params, function (error, res) {
//            if (error) {
//                next(error);
//            } else {
//                next(null, res);
//            }
//        })
//    }

//};

module.exports = new BetfairService();