# CapstoneJS

- [About Capstone](#about)
- [Getting Started](#getting-started)
- [Community](#community)
- [Contributing](#contributing)
- [License](#license)

## About Capstone

CapstoneJS is a fork from the discontinued project [KeystoneJS](http://v4.keystonejs.com), a powerful Node.js content management system and web app framework built on the [Express](https://expressjs.com/) web framework and [Mongoose ODM](http://mongoosejs.com). When we started the new Portal project for [ITA](https://wwwt.ita.br), we adopted Keystone because it's a easy to use tool to create sophisticated web sites and apps, and comes with a beautiful auto-generated Admin UI. But unfortunally KeystoneJS version 4 was deprecated and a new and incompatible version developed.


### Documentation

For Keystone v4 documentation and guides used by this Portal, see [keystonejs.com](https://v4.keystonejs.com).

## Getting Started

This section provides a short intro to Keystone. Check out the [Getting Started Guide](https://keystonejs.com/getting-started) in the Keystone documentation for a more comprehensive introduction.

### Installation

The easiest way to get started with Keystone is to use the Yeoman generator:

```bash
$ npm install -g generator-keystone
$ yo keystone
```

Answer the questions, and the generator will create a new project based on the options you select, and install the required packages from **npm**.

Alternatively, to include Keystone in an existing project or start from scratch (without Yeoman), specify `keystone: "4.0.0"` in the `dependencies` array of your `package.json` file, and run `npm install` from your terminal.

Then read through the [Documentation](https://keystonejs.com/documentation) to understand how to use it.

### Configuration

Config variables can be passed in an object to the `keystone.init` method, or can be set any time before `keystone.start` is called using `keystone.set(key, value)`. This allows for a more flexible order of execution. For example, if you refer to Lists in your routes you can set the routes after configuring your Lists.

See the [KeystoneJS configuration documentation](https://keystonejs.com/documentation/configuration) for details and examples of the available options.

### Database field types

Keystone builds on the basic data types provided by MongoDB and allows you to easily add rich, functional fields to your application's models.

You get helper methods on your models for dealing with each field type easily (such as formatting a date or number, resizing an image, getting an array of the available options for a select field, or using Google's Places API to improve addresses) as well as a beautiful, responsive admin UI to edit your data with.

See the [KeystoneJS database documentation](https://keystonejs.com/documentation/database) for details and examples of the various field types, as well as how to set up and use database models in your application.

### Running KeystoneJS in Production

When you deploy your KeystoneJS app to production, be sure to set your `ENV` environment variable to `production`.

You can do this by setting `NODE_ENV=production` in your `.env` file, which gets handled by [dotenv](https://github.com/motdotla/dotenv).

Setting your environment enables certain features (including template caching, simpler error reporting, and HTML minification) that are important in production but annoying in development.

### Contributing

If you can, please contribute by reporting issues, discussing ideas, helping answer questions from other developers, or submitting pull requests with patches and new features. We do our best to respond to all issues and pull requests, and make patch releases to npm regularly.

## License

(The MIT License)

Copyright (c) 2016-2019 Jed Watson

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
