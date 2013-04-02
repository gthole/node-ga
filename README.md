node-ga:
========
Logging middleware for express: translate your API calls to visit to your website by using Google Analytics.

This module uses the [Google Analytics for mobile websites](https://developers.google.com/analytics/devguides/collection/other/mobileWebsites) API. Thus, your account ID must start with 'MO' instead of 'UA'. You can just give your usual account ID, this module will do the translation.

Usage:
======
    var express = require('express');
    var ga = require('node-ga');
    var app = express();

    app.use(express.cookieParser());
    app.use(ga('UA-XXXXXXXX-Y', {
        safe: true
    }));

    app.get('/', function (req, res, next) {
      return res.end('Hello world!');
    });

Options:
========

    safe: (true || false)
If set to false, the log will be wrapped in a function to be called later by process.nextTick(). Defaults to true, in which case the request will be logged before being passed to next().

    cookie_name: 'string'
Custom cookie name to log the visitor ID. Defaults to "__utmnodejs".

Usage outside express:
=====================
This middleware can be used without express. The cookie is automatically added with res.setHeader(). You should however parse req.headers['cookie'] to an object in req.cookies to avoid an unique being seen as multiple visits. The module will still work fine otherwise.

    var http = require('http');
    var ga = require('node-ga')('UA-XXXXXXXX-Y', { safe: true});

    http.createServer(function (req, res) {
        return ga(req, res, function () {
          res.end('Hello world!');
        });
    }).listen(80);
