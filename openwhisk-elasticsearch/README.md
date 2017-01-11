# OpenWhisk elasticsearch nodejs action

See documentation here:
https://github.com/openwhisk/openwhisk/blob/master/docs/actions.md#packaging-an-action-as-a-nodejs-module

elasticsearch is not one of the libraries in the standard nodejs environment for openwhisk.  we can upload the action as an
npm module instead:

Grab all dependencies (dependencies in packages.json):
```
# npm install
```

Zip it up:
```
zip -r pingElasticSearch.zip .
```

Upload to OpenWhisk as action (with elasticsearch params):
```
$ wsk action update --kind nodejs:6 pingElasticSearch pingElasticSearch.zip --param-file elasticSearchParams.json 
```

Note, due to elasticsearch problems, not able to check if this actually works.  will come back and validate later.
