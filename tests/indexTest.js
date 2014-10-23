'use strict';

var S3S = require('../index'),
    s3sAmazonExamples = new S3S({
        //http://docs.aws.amazon.com/AmazonS3/latest/dev/RESTAuthentication.html
        accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
    });

module.exports = {
    'First step is to instantiate a new instance': function(test) {
        var s3s = new S3S({
            accessKeyId: 'yourAccessKeyId',         //Instantiating with defaults is just a
            secretAccessKey: 'yourSecretAccessKey', //convenience so you don't have to pass
            bucket: 'yourBucket'                    //the same parameters all the time.
        });

        test.notEqual(s3s, null);
        test.done();
    },

    'S3S exposes two single functions: **getSignature** and **getSignedUrl**': function(test) {
        var s3s = new S3S();

        test.equal(typeof s3s.getCredentials, 'function'); //returns a hash
        test.equal(typeof s3s.getSignedUrl, 'function'); //returns an url
        test.done();
    },

    'Obtaining a signed url to get a private object from S3 is very simple': function(test) {
        var s3s = new S3S({
                accessKeyId: 'yourAccessKeyId',
                secretAccessKey: 'yourSecretAccessKey',
                bucket: 'yourBucket',
            }),

            signedUrl = s3s.getSignedUrl({
                key: 'yourFile.png',
                expires: new Date(2015, 0, 1) //optional - after this date the url expires,
            });                               //you can omit since defaults to five minutes from
                                              //current time

        test.equal(typeof signedUrl, 'string');

        test.done();
    },

    'Amazon Example #1': function(test) {
        var credentials = s3sAmazonExamples.getCredentials({
            method: 'GET',
            key: 'photos/puppy.jpg',
            date: new Date('Tue, 27 Mar 2007 19:36:42 +0000'),
            bucket: 'johnsmith'
        });

        test.equal(credentials.signature, 'bWq2s1WEIj+Ydj0vQ697zp+IXMU=');
        test.done();
    },

    'Amazon Example #2': function(test) {
        var credentials = s3sAmazonExamples.getCredentials({
            method: 'PUT',
            key: 'photos/puppy.jpg',
            date: new Date('Tue, 27 Mar 2007 21:15:45 +0000'),
            bucket: 'johnsmith'
        });

        test.equal(credentials.signature, 'MyyxeRY7whkBe+bq8fHCL/2kKUg=');
        test.done();
    },

    'Amazon Example #3': function(test) {
        var credentials = s3sAmazonExamples.getCredentials({
            method: 'GET',
            key: '',
            date: new Date('Tue, 27 Mar 2007 19:42:41 +0000'),
            bucket: 'johnsmith'
        });

        test.equal(credentials.signature, 'htDYFYduRNen8P9ZfE/s9SuKy0U=');
        test.done();
    },

    'Amazon Example #4': function(test) {
        var credentials = s3sAmazonExamples.getCredentials({
            method: 'GET',
            key: '?acl',
            date: new Date('Tue, 27 Mar 2007 19:44:46 +0000'),
            bucket: 'johnsmith'
        });

        test.equal(credentials.signature, 'c2WLPFtWHVgbEmeEG93a4cG37dM=');
        test.done();
    },

    'Amazon Example #5 (broken example from AWS)': function(test) {
        // var credentials = s3sAmazonExamples.getCredentials({
        //     method: 'DELETE',
        //     date: new Date('Tue, 27 Mar 2007 21:20:26 +0000'),
        //     bucket: 'johnsmith',
        //     key: 'photos/puppy.jpg',
        //     amazonHeaders: {
        //         'x-amz-date': new Date('Tue, 27 Mar 2007 21:20:26 +0000')
        //     }
        // });

        // test.equal(credentials.signature, 'lx3byBScXR6KzyMaifNkardMwNk=');
        test.done();
    },

    'Amazon Example #6': function(test) {
        var credentials = s3sAmazonExamples.getCredentials({
            method: 'PUT',
            date: new Date('Tue, 27 Mar 2007 21:06:08 +0000'),
            bucket: 'static.johnsmith.net',
            key: 'db-backup.dat.gz',
            contentType: 'application/x-download',
            contentMd5: '4gJE4saaMU4BqNR0kLY+lw==',
            amazonHeaders: {
                'x-amz-acl': 'public-read',
                'X-Amz-Meta-ReviewedBy': ['joe@johnsmith.net', 'jane@johnsmith.net'],
                'X-Amz-Meta-FileChecksum': '0x02661779',
                'X-Amz-Meta-ChecksumAlgorithm': 'crc32'
            }
        });

        test.equal(credentials.signature, 'ilyl83RwaSoYIEdixDQcA4OnAnc=');
        test.done();
    },

    'Amazon Example #7': function(test) {
        var credentials = s3sAmazonExamples.getCredentials({
            method: 'GET',
            date: new Date('Wed, 28 Mar 2007 01:29:59 +0000')
        });

        test.equal(credentials.signature, 'qGdzdERIC03wnaRNKh6OqZehG9s=');
        test.done();
    },

    'Amazon Example #9': function(test) {
        var url = s3sAmazonExamples.getSignedUrl({
            bucket: 'johnsmith',
            key: 'photos/puppy.jpg',
            expires: new Date(1175139620 * 1000)
        });

        test.equal(url, 'https://johnsmith.s3.amazonaws.com/photos/puppy.jpg?AWSAccessKeyId=AKIAIOSFODNN7EXAMPLE&Signature=NpgCjnDzrM%2BWFzoENXmpNDUsSn8%3D&Expires=1175139620');
        test.done();
    }
};