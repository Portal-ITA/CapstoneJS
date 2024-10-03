# Part 1: Initial Setup

## Introduction

If you want to jump right in to a working Capstone codebase, check out the [Quick Start](/getting-started/yo-generator) guide which walks you through using our generator to get a Capstone codebase up and running quickly.

This Setting Up tutorial will walk you through setting up a project from scratch, including introducing and configuring the core parts of Capstone.

This guide assumes you are familiar with [using `npm`](https://docs.npmjs.com/getting-started/what-is-npm) to install packages and JavaScript as a programming language.

We're going to be tackling setting up from scratch in four parts:

 - **Part 1: Initial Setup** (the page you are reading) starts with installation and setting up a `capstone.js` file to launch your application.

 - [Part 2: Data Model Setup](/getting-started/setting-up/part-2) walks you through building your first data model.

 - [Part 3: Routing](/getting-started/setting-up/part-3) introduces setting up routes with Capstone to serve website pages.

 - [Part 4: Adding data from a form](/getting-started/setting-up/part-4) demonstrates how to create a `POST` endpoint for submitting data.

Before getting started, make sure you have [Node.js](nodejs.org) and [MongoDB](https://www.mongodb.com/download-center?jmp=nav#community) installed.

## Installation

Start by creating a new directory and then from within it run `npm init`. Follow the prompts to create a default `package.json`.

Next, install Capstone with `npm install --save capstone`.

At this point, you should have a `node_modules` directory and Capstone should have been added to the `package.json`.

##  Initial Setup

Create a new file, `capstone.js`, and you'll be ready to start configuring Capstone.

`capstone.js` file is the launch file for Capstone: it defines general configuration options, initialises Capstone, and starts your application server.

The minimum file we need to start Capstone running is:

```javascript
var capstone = require('capstonejs');

capstone.init({
  'cookie secret': 'secure string goes here',
});

capstone.start();
```

Your `capstone.js` needs to require `capstone` and then run the `capstone.init()` function to set up Capstone's initial values.

In this example we are only providing a `cookie secret`. Technically this is the only non-default option that is required to launch Capstone, however as you complete this tutorial you will be adding more options. 

Finally, we call `capstone.start()`, which kicks off the Capstone app.

You can now check this runs. Run `node capstone.js` and you should be greeted with:

```sh
------------------------------------------------
CapstoneJS v4.0.0 started:
Capstone is ready on http://0.0.0.0:3000
------------------------------------------------
```

You should get a 404 page. That's expected since there are no pages set up yet.

## Next Steps

This tutorial continues in [Part 2: Data Model Setup](/getting-started/setting-up/part-2), which walks you through setting up your first data model.


## Learn more about:

- [capstone.init](/api/methods/init)
- [capstone.start](/api/methods/start)
- [Capstone Setup Options](/documentation/configuration)
