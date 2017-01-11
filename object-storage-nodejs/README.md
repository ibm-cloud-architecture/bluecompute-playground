# Access Bluemix Object Storage

This simple app demonstrate how to access Bluemix Object Storage from a Node.js application.
It uses open source library [pkgcloud npm module](https://www.npmjs.com/package/pkgcloud)to interact with Object Storage.

You can follow simple steps to run the application (locally or on Bluemix)

 - Create Bluemix Object Storage
 - Create Object Storage credentials
 - Create Container and upload test files
 - Run the application


There are 2 APIs available:

 - List all files under a particularly Container
     http://hostname:port/container/:containerName
 - Download/view files
     http://hostname:port/file/:containerName/:fileName
