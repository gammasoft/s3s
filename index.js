'use strict';

var utils = require('gammautils'),
    moment = require('moment-timezone'),
    mime = require('mime'),

    forEachOwnProperty = utils.object.forEachOwnProperty,
    hmac = utils.crypto.hmac;

function formatGmtTime(date) {
    if(typeof date === 'string') {
        date = new Date(date);
    }

    return new moment(date).tz('GMT').format('ddd[,] DD MMM YYYY HH:mm:ss ZZ');
}

function canonicalizeAmazonHeaders(amazonHeaders) {
    var headers = [];

    forEachOwnProperty(amazonHeaders, function(key, values) {
        if(!Array.isArray(values)) {
            values = [values];
        }

        key = key.toLowerCase().trim();

        if(key.indexOf('x-amz-') !== 0) {
            key = 'x-amz-' + key;
        }

        headers.push(key + ':' + values.map(function(value) {
            return value.trim();
        }).join(','));
    });

    return headers.sort().join('\n');
}

function canonicalizeResource(bucket, key) {
    var resource = '/' + bucket + '/' + key;

    if(resource === '//') {
        resource = '/';
    }

    return resource;
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + (minutes * 60 * 1000));
}

function formatUNIX(date) {
    if(typeof date === 'number') {
        return date;
    }

    return Math.round(date.getTime() / 1000);
}

module.exports = (function() {
    function S3S(options) {
        this.options = options;
    }

    S3S.prototype.getCredentials = function(args) {
        args.debug = (args.debug && args.debug.toString() === 'true') || this.options.debug;
        args.accessKeyId = args.accessKeyId || this.options.accessKeyId;
        args.secretAccessKey = args.secretAccessKey || this.options.secretAccessKey;
        args.key = (args.key && encodeURI(args.key)) || '';
        args.method = args.method || 'GET';
        args.bucket = args.bucket || this.options.bucket || '';
        args.contentType = args.contentType || (args.key && mime.lookup(args.key));
        args.amazonHeaders = args.amazonHeaders || {};
        args.date = (args.date && new Date(args.date)) || new Date();
        args.contentMd5 = args.contentMd5 || '';

        if(args.expires) {
            args.expires = formatUNIX(args.expires);
            args.date = args.expires;
        } else {
            args.date = formatGmtTime(args.date);
        }

        if(args.amazonHeaders['x-amz-date']) {
            args.amazonHeaders['x-amz-date'] = formatGmtTime(args.amazonHeaders['x-amz-date']);
        }

        function getDate() {
            if(args.expires) {
                return args.date;
            }

            if(args.amazonHeaders['x-amz-date']) {
                return '';
                //return args.amazonHeaders['x-amz-date']; //To make example #5 pass
            }

            return args.date;
        }

        var canonicalizedAmazonHeaders = canonicalizeAmazonHeaders(args.amazonHeaders),
            canonicalizedResource = canonicalizeResource(args.bucket, args.key),
            notGetNorDelete = ['GET', 'DELETE'].indexOf(args.method) === -1,
            stringToSign = [
                args.method,
                notGetNorDelete ? args.contentMd5 : '',
                notGetNorDelete ? args.contentType : '',
                getDate()
            ];

        if(notGetNorDelete && canonicalizedAmazonHeaders) {
            stringToSign.push(canonicalizedAmazonHeaders);
        }

        stringToSign.push(canonicalizedResource);
        stringToSign = stringToSign.join('\n');

        if(args.debug === true) {
            process.stdout.write(stringToSign);
        }

        return {
            awsAccessKey: args.accessKeyId,
            date: args.expires || args.amazonHeaders['x-amz-date'] || args.date,
            key: args.key,
            contentType: args.contentType,
            signature: hmac('sha1', args.secretAccessKey, stringToSign)
        };
    };

    S3S.prototype.getSignedUrl = function(args) {
        args.expires = args.expires || addMinutes(new Date(), 5);

        var credentials = this.getCredentials(args);

        return [
            args.secure === false ? 'http://' : 'https://',
            args.bucket,
            '.s3.amazonaws.com/',
            args.key + '?',
            'AWSAccessKeyId=' + credentials.awsAccessKey + '&',
            'Signature=' + encodeURIComponent(credentials.signature) + '&',
            'Expires=' + credentials.date
        ].join('');
    };

    return S3S;
})();