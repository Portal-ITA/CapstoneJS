# Open Database Connection

## `capstone.openDatabaseConnection(callback:Function)`

Opens a database connection using the options set in Capstone. If the Capstone database settings are not configured, or the models are not registered, this will fail.

`openDatabaseConnection` is called by [start](/api/methods/start), and will be called before the express server is started.
