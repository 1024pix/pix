# GET /api/saml/login
🔴 StatusCode: 500

Il faut probablement une configuration en local pour permettre la redirection saml. 

# GET /api/challenges/xxx
🔴 StatusCode: 500

Il faut probablement une configuration en local pour permettre de simuler le réferentiel

# POST /api/answers
🔴 StatusCode: 500

Le body suivant est valide pour l'API answers : 

```javascript
post {
  data: {
    attributes: {
      value: null,
      result: null,
      'result-details': null,
      timeout: null,
      'focused-out': null
    },
    relationships: {},
    assessment: {},
    challenge: {},
    type: 'r9tr2gzg8'
  }
}
```
 
> Néamoins, une erreur est déclenchée lors du _cleanValue :
> TypeError: Cannot read properties of null (reading 'replaceAll')

# POST /api/assessments
🔴 StatusCode: 500

Dans `api/lib/application/assessments/index.js`, il n'y a pas de validateur Joi sur le payload.
Sans payload on a :

```javascript
TypeError: Cannot read properties of null (reading 'data')
    at Object.deserialize (api/lib/infrastructure/serializers/jsonapi/assessment-serializer.js:84:23)
    at save (api/lib/application/assessments/assessment-controller.js:23:45)
    at exports.Manager.execute (api/node_modules/@hapi/hapi/lib/toolkit.js:57:29)
    at Object.internals.handler (api/node_modules/@hapi/hapi/lib/handler.js:46:48)
    at exports.execute (api/node_modules/@hapi/hapi/lib/handler.js:31:36)
    at Request._lifecycle (api/node_modules/@hapi/hapi/lib/request.js:371:68)
    at processTicksAndRejections (node:internal/process/task_queues:96:5)
    at runNextTicks (node:internal/process/task_queues:65:3)
    at processImmediate (node:internal/timers:437:9)
    at process.callbackTrampoline (node:internal/async_hooks:130:17)
    at async Request._execute (api/node_modules/@hapi/hapi/lib/request.js:281:9)
```

# POST /api/feedbacks 500
🔴 StatusCode: 500

Dans `api/lib/application/feedbacks/index.js`, il n'y a pas de validateur Joi sur le payload.
Sans payload on a :

```javascript
TypeError: Cannot read properties of null (reading 'data')
    at module.exports.deserialize (api/node_modules/jsonapi-serializer/lib/deserializer.js:35:31)
    at Object.deserialize (api/lib/infrastructure/serializers/jsonapi/feedback-serializer.js:21:8)
    at save (api/lib/application/feedbacks/feedback-controller.js:8:44)
    at exports.Manager.execute (api/node_modules/@hapi/hapi/lib/toolkit.js:57:29)
    at Object.internals.handler (api/node_modules/@hapi/hapi/lib/handler.js:46:48)
    at exports.execute (api/node_modules/@hapi/hapi/lib/handler.js:31:36)
    at Request._lifecycle (api/node_modules/@hapi/hapi/lib/request.js:371:68)
    at processTicksAndRejections (node:internal/process/task_queues:96:5)
    at runNextTicks (node:internal/process/task_queues:65:3)
    at processImmediate (node:internal/timers:437:9)
    at process.callbackTrampoline (node:internal/async_hooks:130:17)
    at async Request._execute (api/node_modules/@hapi/hapi/lib/request.js:281:9)
```