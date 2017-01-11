
# OpenWhisk MessageHub Integration

see the docs

https://console.ng.bluemix.net/docs/openwhisk/openwhisk_catalog.html

- Install openwhisk CLI
https://console.ng.bluemix.net/openwhisk/cli

-  Set up openwhisk CLI e.g.
   ```
   wsk property set --apihost openwhisk.ng.bluemix.net --auth xxx
   ```

  get this out of the openwhisk cli page:
  https://console.ng.bluemix.net/openwhisk/learn/cli
  
  PROBLEM: there's no way of getting this key outside of this page!!!  have to cut and paste into devops process.  it's scoped to bluemix space


- Add MessageHub instance to space https://console.ng.bluemix.net/catalog/services/message-hub/

- Add a topic to MessageHub -- maybe call it "profile" for login profile

- wsk package refresh to pull in messagehub instance as a messagehub package

  ```
  # wsk package refresh
  ```

- Get the package list:
  ```
  $ wsk package list
  packages
  /cent@us.ibm.com_jkwong-dev/Bluemix_refarch-cloudantdb_refarch-cloudantdb-credential private
  /cent@us.ibm.com_jkwong-dev/Bluemix_Message Hub-88_Credentials-1       private
  ```

- create trigger for my topic
  ```
  $ wsk trigger create myTrigger -f '/cent@us.ibm.com_jkwong-dev/Bluemix_Message Hub-88_Credentials-1/messageHubFeed' -p topic profile
  ```

- add the action
  ```
  # wsk action create  /cent@us.ibm.com_jkwong-dev/readMessage readMessage.js 
  ```
  
- add the rule to fire action based on my trigger
  ```
  $ wsk rule create '/cent@us.ibm.com_jkwong-dev/handleUserLogin'  myTrigger readMessage
  ```

# OpenWhisk + Cloudant

cloudant is one of the dependencies installed in openwhisk javascript environment
https://console.ng.bluemix.net/docs/openwhisk/openwhisk_reference.html#openwhisk_ref_javascript_environments


this means we can have require('cloudant') and use cloudant nodejs library


- Create CloudantDB (called profile)

- Copy credentials into cloudantParams.json

- Create the openwhisk action to save the message from messagehub into my cloudant db
  ```
  # wsk action create  saveToCloudant saveToCloudant.js --param-file cloudantParams.json
  ```

- create the rule to file action based on my trigger
  ```
  $ wsk rule create '/cent@us.ibm.com_jkwong-dev/handleUserLogin2'  myTrigger saveToCloudant
  ```
