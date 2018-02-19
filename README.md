# ts-storage
> Type-safe storage library with fallback values

[![NPM Version][npm-image]][npm-url]
[![Downloads Stats][npm-downloads]][npm-url]

A simple library for interacting with the browser's local storage in a type-safe manner (with TypeScript).


## Installation

```sh
npm install ts-storage --save
```


## Usage

```javascript
import * as Storage from "ts-storage";

Storage.set("foo", 5);

const foo = Storage.get("foo", 0).value;
// foo is guaranteed to be a number.
```


[npm-image]: https://img.shields.io/npm/v/ts-storage.svg
[npm-url]: https://npmjs.org/package/ts-storage
[npm-downloads]: https://img.shields.io/npm/dm/ts-storage.svg
