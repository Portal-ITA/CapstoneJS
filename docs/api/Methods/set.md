# Set

## `capstone.set(key:String, value:Mixed)`

`capstone.set` provides an option to Capstone for use during Capstone setup. Assigns the value provided to the key in Capstone's options object. `capstone.set` returns the value object.

You should not set Capstone options after Capstone has been started.

The initialization options can be found in the [configuration](/documentation/configuration) documentation.

For information on setting up Capstone, see the [installation guide](/getting-started/setting-up/part-1)

Example:

```javascript
capstone.set('port', 5050)
```

There are middleware that can be added with `set` which will be automatically run for particular actions. For information on these see the [middleware](/api/methods/middleware) documentation.

`capstone.set(key:string)` - .set can also be called with a string and no value passed in. If there is only one argument, `capstone.set` will instead retrieve the value of the selected key from Capstone. This is aliased as [capstone.get()](/api/methods/get),
