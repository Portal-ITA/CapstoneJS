# Model

Once you retrieve a list from Capstone, the [mongoose](http://mongoosejs.com/) methods can be accessed from `.model`.

Example:

```javascript
var User = require('capstonejs').list('User');

User.model.find({});
```

See the mongoose [query](http://mongoosejs.com/docs/queries.html) documentation for more details on querying your database.
