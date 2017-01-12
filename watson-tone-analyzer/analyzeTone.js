var request = require('request-promise');
var fs = require('fs');
var process = require('process');

function main(params) {
    console.log("params:", params);

    if (!params.text) {
        // nothing to do
        return {};
    }

    var watsonURL = params.url + "/v3/tone?version=2016-05-19"
    var watsonAuth = new Buffer(params.username + ":" + params.password).toString('base64');
//    console.log('text to analyze: ', params.text);

    var requestOptions = {
        method: 'POST',
        uri: watsonURL,
        headers: {
            'Authorization': 'Basic ' + watsonAuth,
            'Content-Type': 'text/plain'
        },
        body: params.text,
        json: false
    }

    return request(requestOptions).
        then(function(parsedBody) {
            console.log(parsedBody, null, 4);

            return parsedBody;

        }).
        catch(function(err) {
            console.log("error! ", err);

            return err;
        });


}

/*

var paramFile = fs.readFileSync('watsonParam.json');
var watsonParam = JSON.parse(paramFile);
watsonParam['text'] = process.argv[2];
main(watsonParam);
*/
