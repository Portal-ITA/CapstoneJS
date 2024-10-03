# list

## `capstone.list(listName:String)`

A function used to retrieve a particular Capstone list, so that items can be retrieved from the database, and saved to the database.

Example:

```javascript
var User = require('capstonejs').list('User');

User.model.find({}, callback)
```

> NOTE: Capstone models use mongoose methods such as find undecorated.
