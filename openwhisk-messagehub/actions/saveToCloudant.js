
var Promise = require('promise');

function getCloudantCredential(param) {
    var cloudantUrl;

    if (param.url) {
        // use bluemix binding
        cloudantUrl = param.url;
    } else {
        if (!param.host) {
            whisk.error('cloudant account host is required.');
            return;
        }
        if (!param.username) {
            whisk.error('cloudant account username is required.');
            return;
        }
        if (!param.password) {
            whisk.error('cloudant account password is required.');
            return;
        }

        cloudantUrl = "https://" + param.username + ":" + param.password + "@" + param.host;
    }

    if (!param.db) {
        whisk.error('cloudant db is required.');
        return;
    }

    var cloudant = require('cloudant')({
        url: cloudantUrl,
        plugin:'default'
    });

    return cloudant.db.use(param.db);
}

function getRecord(cloudantdb, profile) {
    return new Promise(function(resolve, reject) {
        console.log('check if document with id: ', profile['_id'], ' exists');

        cloudantdb.get(profile['_id'], function(err, result) {
            if (err) {
                if (err.statusCode != 404) {
                    // if error code is not found, it's not really an error
                    // as the record doesn't exist yet.  otherwise, fail the operation
                    reject(err);
                }
            }

            if (result && result['_rev']) {
                console.log('document exists, adding _rev', result['_rev']);

                // the document already exists, send the _rev with the insert
                // for an update
                profile['_rev'] = result['_rev'];
            }

            resolve({
                cloudantdb: cloudantdb,
                profile: profile
            });
        });
    })
}

function insertRecord(function_input) {
    var cloudantdb = function_input.cloudantdb;
    var profile = function_input.profile;

    return new Promise(function(resolve, reject) {
        console.log("inserting record: ", profile);
        cloudantdb.insert(profile, function(err, body) {
            if (!err) {
                //console.log("updated message, response: ", body);
                resolve(body);
            } else {
                console.error("error: ", err);
                reject(err);
            }
        });

    });
}

/**
  *
  * main() will be invoked when you Run This Action.
  * 
  * @param Whisk actions accept a single parameter,
  *        which must be a JSON object.
  *
  * In this case, the params variable will look like:
  *     { "message": "xxxx" }
  *
  * @return which must be a JSON object.
  *         It will be the output of this action.
  *
  */
function main(params) {
    var messages = params.messages

    console.log("received " +  messages.length + " messages");

    var cloudantOrError = getCloudantCredential(params);
    if (typeof cloudantOrError !== 'object') {
        return whisk.error('getCloudantAccount returned an unexpected object type.');
    }

    var cloudantdb = cloudantOrError;
    var promiseList = [];

    for (i = 0; i < messages.length; i++) {
        // pull out message id
        var fullMessage = JSON.parse(messages[i].value);
        //var fullMessage = messages[i].value;
        var message = fullMessage['imf.user'];

        //console.log("message read: ", message);
        //console.log("message to insert: ", message['imf.user']);
        var profile = {
            '_id': message['id'],
            'name': message['attributes']['name'],
            'given_name': message['attributes']['given_name'],
            'family_name': message['attributes']['family_name'],
            'link': message['attributes']['link'],
            'picture': message['attributes']['picture'],
            'gender': message['attributes']['gender'],
            'locale': message['attributes']['locale']
        };


        // write each message to cloudant DB
        promiseList.push(getRecord(cloudantdb, profile).then(insertRecord));
    }

    return Promise.all(promiseList).then(function (data) {
        return {
            'message': 'processed ' + messages.length + ' messages',
            'result': data
        };
    });
}

