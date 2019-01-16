# Chai Events

[![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=dHZBczZFaDMraUtrcnNNSTZzVHpRN056ZzU1VHZoclI2S3R6OFRkRGpBYz0tLWcwWndCVUFlTW1jQTlLWjBqc0ZwdVE9PQ==--9ca2d6648ca4fcb5a1bb63e255daf0c6dc46d18c)](https://www.browserstack.com/automate/public-build/dHZBczZFaDMraUtrcnNNSTZzVHpRN056ZzU1VHZoclI2S3R6OFRkRGpBYz0tLWcwWndCVUFlTW1jQTlLWjBqc0ZwdVE9PQ==--9ca2d6648ca4fcb5a1bb63e255daf0c6dc46d18c)

Make assertions about event emitters.

```js
const chai = require("chai");
chai.use(require("chai-events"));
const should = chai.should();
const EventEmitter = require("events");

describe("Event Emitting", function() {

  let emitter = null;
  beforeEach(function() {
    emitter = new EventEmitter();
  });

  it("should get emitted events", function() {
    let p = emitter.should.emit("get");
    setTimeout(function() {
      emitter.emit("get");
    }, 200);
    return p;
  });

  it("should handle non-emitted events", function() {
    emitter.should.not.emit("missing");
  });

  it("can be configured", function() {
    emitter.should.not.emit("another missing", {
      timeout: 50, // in milliseconds
    });
  });

});
```

## Browser Usage

*Browser testing powered by BrowserStack*  
[![BrowserStack](/docs/img/browserstack-logo-600x315.png)](https://www.browserstack.com)
