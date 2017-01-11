var es = require('elasticsearch');

function main(params) {

    console.log(JSON.stringify(params));

    var esClient = es.Client({
        hosts: params.hosts
    })

    esClient.cluster.health({}, function(err, resp, status) {
        if (!err) {
            console.log(resp);
        } else {
            console.log(err);
        }
    });
}

exports.main = main
/*
var fs = require('fs');

main(JSON.parse(fs.readFileSync("elasticSearchParams.json")));
*/
