/*jshint node:true*/

// app.js
// This file contains the server side JavaScript code for your application.
// This sample application uses express as web application framework (http://expressjs.com/),
// and jade as template engine (http://jade-lang.com/).

var express = require('express');
var request = require('request');
var http = require('http');
var bodyParser = require('body-parser');
var path = require('path');
var pkgcloud = require('pkgcloud');
//var routes = require('./routes');

// setup middleware
var app = express();
//app.use(app.router);
//app.use(express.errorHandler());
app.use(express.static(__dirname + '/public')); //setup static public directory
app.set('view engine', 'jade');
app.set('views', __dirname + '/views'); //optional since express defaults to CWD/views

app.set('port', process.env.PORT || 3000);


// all environments
//app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// render index page
app.get('/', function(req, res){
	res.render('index');
});


// There are many useful environment variables available in process.env.
// VCAP_APPLICATION contains useful information about a deployed application.
//var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
// TODO: Get application information and use it in your app.

// VCAP_SERVICES contains all the credentials of services bound to
// this application. For details of its content, please refer to
// the document or sample of each service.
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
// TODO: Get service credentials and communicate with bluemix services.

var dev=false,
    auth=false,
  storageClient;

init_object_storage();

function init_object_storage() {
  var config = {};
  if(dev)
  {
    var username = "admin_xxx",
        password = "xxx",
        projectId = "688d49f5f5784aa8a36450c7b36c3ddf",
        domainId = "f5cd32c788594b15bff1a093467e4864";

    config = {
      provider: 'openstack',
      useServiceCatalog: true,
      useInternal: false,
      keystoneAuthVersion: 'v3',
      authUrl: 'https://identity.open.softlayer.com',
      tenantId: projectId,    //projectId from credentials
      domainId: domainId,
      username: username,
      password: password,
      region: 'dallas'   //dallas or london region
    };
  }
  else {

    var credentials = services['Object-Storage'][0]['credentials'];
    console.log("VCAP credential: " + JSON.stringify(credentials));

    config = {
          provider: 'openstack',
          useServiceCatalog: true,
          useInternal: false,
          keystoneAuthVersion: 'v3',
          authUrl: 'https://identity.open.softlayer.com',
          tenantId: credentials.projectId,    //projectId from credentials
          domainId: credentials.domainId,
          username: credentials.username,
          password: credentials.password,
          region: credentials.region   //dallas or london region
        };
  }
  storageClient = pkgcloud.storage.createClient(config);
}


//Get list of files under OB container
app.get('/container/:containerName', function(req, res){


  if(!auth)
  {
    storageClient.auth(function(err) {
        if (err) {
            console.error(err);
        }
        else {
            //console.log(storageClient._identity);
        }
    });
    auth = true;
  }


  //get container
  var obContainers,
      files;

  //storageClient.getContainers(function (err, containers) {
  //    console.log(JSON.stringify(containers));
  //    obContainers = containers;
  //})

  storageClient.getFiles(req.params.containerName, function (err, files) {
    console.log(JSON.stringify(files));
    var result='<h2>Here is the list of files:</h2></br><ul>';
    for (var i in files)
    {
      result += '<li><a href=\"/files/'+req.params.containerName+'/'+files[i].name+'\">'
                    + files[i].name
                    +'</a></li>';
    }
    result+='</ul>';
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(result);
    res.end();
    return;
  })

});


//Download the file
app.get('/files/:containerName/:fileName', function(req, res){

  if(!auth)
  {
    storageClient.auth(function(err) {
        if (err) {
            console.error(err);
        }
        else {
            //console.log(storageClient._identity);
        }
    });
    auth = true;
  }

  storageClient.download({
    container: req.params.containerName,
    remote: req.params.fileName
  }).pipe(res);


    //res.writeHead(200, {'Content-Type': 'text/html'});
    //res.write();
    //res.end();
    return;

});

// Start server
http.createServer(app).listen(app.get('port'), '0.0.0.0', function() {
    console.log('Express server listening on port ' + app.get('port'));
});
