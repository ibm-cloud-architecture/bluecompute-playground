## Create Java OpenWhisk Action

See the docs

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

- Compile Java Code and embed gson library
    ```
    javac -cp gson-2.6.2.jar Hello.java
    ```

- Create JAR file
    ```
    jar cvf hello.jar Hello.class
    ```

- Create Java OpenWhisk Action
    ```
    wsk action create helloJava hello.jar --main Hello
    ```
    Basically it creates Action "helloJava" from "Hello" class in "hello.jar" file

- Invoke Java OpenWhiskAction
    ```
    wsk action invoke --blocking --result helloJava --param name World
    ```
    Invokes helloJava Action and passes it a "name" parameter with value "World"