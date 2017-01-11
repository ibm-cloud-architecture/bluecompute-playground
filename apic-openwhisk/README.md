# Using API Connect to proxy OpenWhisk actions (serverless REST API)

See the OpenWhisk documentation:
https://console.ng.bluemix.net/docs/openwhisk/openwhisk_apigateway.html#openwhisk_apigateway

see this guy's API Connect proxy suggestions:
http://jamesthom.as/blog/2016/04/26/serverless-apis-with-openwhisk-and-api-connect/

## Create a serverless REST API with openwhisk
- created some javascript actions.  Mine pull documents out of cloudant db.  Update the cloudant db params in cloudantParams.json

- upload these actions:
   ```
   # wsk action create getProfile getProfile.js --param-file cloudantParams.json 
   # wsk action create deleteProfile deleteProfile.js --param-file cloudantParams.json
   ```
   
- create a whisk API using the wsk api-experimental command:
   ```
   $ wsk api-experimental create /customer /profile get getProfile
   ok: created API /profile GET for action /_/getProfile https://d7af58f0-6cdc-4a52-b436-f98991dc09c9-gws.api-gw.mybluemix.net/customer/profile

   $ wsk api-experimental create -n /customer /profile delete deleteProfile
   ok: created API /profile DELETE for action /_/deleteProfile
   https://d7af58f0-6cdc-4a52-b436-f98991dc09c9-gws.api-gw.mybluemix.net/customer/profile
   ```
   
- Get all the APIs:
  ```
  $ wsk api-experimental list
ok: APIs
Action                            Verb             API Name  URL
/cent@us.ibm.com_jkwong-dev/getProfile     get            /customer  https://d7af58f0-6cdc-4a52-b436-f98991dc09c9-gws.api-gw.mybluemix.net/customer/profile
/cent@us.ibm.com_jkwong-dev/deleteProfile  delete            /customer  https://d7af58f0-6cdc-4a52-b436-f98991dc09c9-gws.api-gw.mybluemix.net/customer/profile
  ```


- Call the API using curl:

  Note that the params passed into the query make it into the params object passed into the open whisk action
  ```
  $ curl https://d7af58f0-6cdc-4a52-b436-f98991dc09c9-gws.api-gw.mybluemix.net/profile?id=115524406556127941772
  {
    "result": {
      "profile": {
        "name": "Jeffrey Kwong",
        "_id": "115524406556127941772",
        "family_name": "Kwong",
        "locale": "en",
        "link": "https://plus.google.com/115524406556127941772",
        "picture": "https://lh4.googleusercontent.com/-NkbXTq7-Zy8/AAAAAAAAAAI/AAAAAAACwyg/fInrWX5ab_k/photo.jpg",
        "_rev": "23-23c3ea78abb2c2b527e4a0a15e95fcbf",
        "given_name": "Jeffrey",
        "gender": "male"
      }
    }
  }
  ```

## Use APIC to proxy openwhisk action
Problem: openwhisk params are passed using query, but REST API passes them on path

Solution: Use APIC "Assemble" , write a small javascript to transfer the id passed in on path to query to be passed into openwhisk.

here is sample script (moves ID passed in the path to query):
```
var old_path = apim.getvariable('request.path');
var id = apim.getvariable('request.parameters.id');

var real_path = old_path;
if (id != null) {
    var index = old_path.lastIndexOf('/');
    real_path = old_path.substring(0,index);
    
    real_path = real_path + "?id=" + id;
}

apim.setvariable('real_path', real_path, 'set');
```

Use the attached APIC yaml to proxy the openwhisk REST API from APIConnect.  Update the target url to the OpenWhisk gateway:

```
    - invoke:
        target-url: "https://d7af58f0-6cdc-4a52-b436-f98991dc09c9-gws.api-gw.mybluemix.net$(real_path)"
```
