# Get

## `capstone.get(key:String)`

Retrieve a property from Capstone's options. For information about Capstone's options, see [configuration](/documentation/configuration) documentation.

This can be used to retrieve information about Capstone's running once it has started.

Example:

```javascript
capstone.get('env')
```

> NOTE: `capstone.get` is an alias for [capstone.set](/api/methods/set). As such, passing in a second argument will cause it to set the value of the Capstone option to the second argument before returning the value.
