(function () {
	var crypto = require('crypto');
	var http   = require('http');
	var url    = require('url');


	var cookie_name = '__utmnodejs';


	function filter (obj, list) {
		var ret = { };
		for (var i = 0; i < list.length; ++i) {
			if (Object.hasOwnProperty.call(obj, list[i])) {
				ret[list[i]] = obj[list[i]];
			}
		}
		return ret;
	};


	function buildQueryUrl (options) {
		var ret = '/__utm.gif'
		        + '?utmwv='  + '4.4sh'
		        + '&utmn='   + Math.floor(Math.random() * 2147483647)
		        + '&utmhn='  + encodeURI(options.host)
		        + '&utmr='   + encodeURI(options.referer)
		        + '&utmp='   + encodeURI(options.path)
		        + '&utmac='  + options.account
		        + '&utmcc='  + '__utma%3D999.999.999.999.999.1%3B'
		        + '&utmvid=' + options.account
		        + '&utmip='  + options.ip;
		return ret;
	};


	function getAnalytics (options, cb) {
		return function () {
			var reqOpt = {
				hostname: 'www.google-analytics.com',
				port: 80,
				path: buildQueryUrl(options),
				method: 'GET',
				headers: options.headers
			};

			return http.request(reqOpt, function (res) {
				var data = '';
				res.on('data', function (chunk) {
					data += chunk;
				});
				res.on('end', function () {
					return cb(null, data);
				})
				res.on('error', function (err) {
					return cb(err);
				})
			}).end('');
		};
	}

	function getVisitorId (req) {
		if (req.cookies && req.cookies[cookie_name]) {
			return req.cookies[cookie_name];
		}
		var ret = req.headers['user-agent'] + Math.floor(Math.random() * 2147483647);
		var md5 = crypto.createHash('md5').update(ret).digest("hex");
		return '0x' + md5.substr(0, 16);
	}


	function NodeGoogleAnalytics (account, opts) {
		if ('undefined' === typeof opts) opts = {};
		opts.account = account;
		if (!opts.account) {
			throw new Error('node-ga: Account ID not provided');
		}
		opts.account = 'MO' + opts.account.substr(2);
		if (opts.cookie_name) {
			cookie_name = opts.cookie_name;
		}
		if ('undefined' === typeof opts.safe) {
			opts.safe = true;
		}
		return function (req, res, next) {
			opts.ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split('.');
			opts.ip[3] = '0';
			opts.ip.join('.');
			opts.host = req.host;
			opts.path = url.parse(req.url).pathname;
			opts.headers = filter(req.headers, [ 'user-agent', 'accept-language' ]);
			opts.referer = opts.headers.referer || '-';
			opts.visitorId = getVisitorId(req);
			res.setHeader('Set-Cookie', cookie_name + '=' + opts.visitorId);
			if (!opts.safe) {
				process.nextTick(getAnalytics(opts, function (err, data) {
					if (err) {
						console.log('node-ga: An error happened:');
						console.dir(err);
					}
				}));
				return next();
			}
			return getAnalytics(opts, function (err, data) {
				if (err) {
					console.log('node-ga: An error happened:');
					console.dir(err);
				}
				return next();
			})();
		};
	};


	module.exports = NodeGoogleAnalytics;

})();
