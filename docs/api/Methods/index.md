# Methods

Capstone has a number of methods available to it to help you out. Each of these are documented here, and can be accessed off the Capstone object. Note that Capstone stores a single global state, so methods such as the [set](/api/methods/set) method apply globally off capstone.

In addition to these methods, there are several constructors and more complex features accessible through capstone.

- [new capstone.List](/api/list) - used to register new lists to your database schema.
- [Field Types](/api/field) - used in constructing lists, this details the field types Capstone makes available to make shaping and displaying your data easy.
- [new capstone.View](/api/view) - used to create new views which have specific logic that is easy to parse and share between views.

You can access capstone's inherent mongoose instance on `capstone.mongoose`. You can access capstone's inherent express on `capstone.express`. If you need to access properties on either directly, you can fin them here.
