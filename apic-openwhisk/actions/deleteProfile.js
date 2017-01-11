
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

function getRecord(cloudantdb, id) {
    return new Promise(function(resolve, reject) {
        console.log('check if document with id: ', id, ' exists');

        cloudantdb.get(id, function(err, result) {
            if (err) {
                reject(err);
            }

            if (!result || !result['_rev']) {
                reject({result: 'document doesnt exxists'});
            }

            resolve({
                cloudantdb: cloudantdb,
                id: id,
                rev: result['_rev']
            });
        });
    })
}

function deleteRecord(function_input) {
    var cloudantdb = function_input.cloudantdb;
    var id = function_input.id;
    var rev = function_input.rev;

    return new Promise(function(resolve, reject) {
        console.log('deleting document with id: ', id, ' rev ', rev);

        cloudantdb.destroy(id, rev, function(err, result) {
            if (err) {
                reject(err);
            }

            resolve({
            });
        });
    })
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
    var id = params.id;

    var cloudantOrError = getCloudantCredential(params);
    if (typeof cloudantOrError !== 'object') {
        return whisk.error('getCloudantAccount returned an unexpected object type.');
    }

    var cloudantdb = cloudantOrError;

    // read profile from cloudant DB
    return getRecord(cloudantdb, id).then(deleteRecord).then(Promise.resolve({
            'result': 'OK'
    }));
}

