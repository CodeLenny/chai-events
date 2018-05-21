function plugin(chai, utils) {

  var Assertion = chai.Assertion;

  /**
   * Checks if a given entry is an event emitter.
   * Uses EventEmitter or EventTarget if available to quickly check `instanceof`.  Otherwise, checks that common methods
   * to event emitters are available.
   *
   * Gracefully handles custom implementations of event emitters even if EventEmitter or EventTarget are available,
   * checking methods if the emitter doesn't inherit from the global emitter.
  */
  function isEmitter() {
    // Easy check: if Node's EventEmitter or window.EventEmitter exist, check if this is an instance of it.
    if(typeof EventEmitter !== "undefined" && EventEmitter !== null && this._obj instanceof EventEmitter) {
      return this.assert(true, "", "expected #{this} to not be an EventEmitter");
    }

    // Easy check: if the browser's EventTarget exists, check if this is an instance of it.
    if(typeof EventTarget !== "undefined" && EventTarget !== null && this._obj instanceof EventTarget) {
      return this.assert(true, "", "expected #{this} to not be an EventTarget");
    }

    var obj = this._obj;

    // Check for Node.js style event emitters with "on", "emit", etc.
    var node = ["on", "emit"].every(function(method) {
      return typeof obj[method] === "function";
    });

    if(node) {
      return this.assert(true, "", "expected #{this} to not be an EventEmitter");
    }

    // Check for Browser-based event emitters with "addEventListener", etc.
    var browser = ["addEventListener", "dispatchEvent", "removeEventListener"].every(function(method) {
      return typeof obj[method] === "function";
    });

    if(browser) {
      return this.assert(true, "", "expected #{this} to not be an EventEmitter");
    }

    this.assert(false, "expected #{this} to be an EventEmitter", "");
  };

  Assertion.addProperty("emitter", isEmitter);
  Assertion.addProperty("target", isEmitter);

  function assertEmitter(obj) {
    new Assertion(obj).to.be.an.emitter;
  }

  function assertEventEmit(_this) {
    var name = utils.flag(_this, "emit.event");
    new Assertion(name).to.satisfy(function(_name) {
        return typeof _name === 'string' || typeof _name === 'symbol';
    });

    var obj = _this._obj;
    var assert = function() {
      _this.assert.apply(_this, arguments);
    }
    var timeout = utils.flag(_this, 'timeout') || 1500;

    return new Promise(function(resolve, reject) {
      var complete = false;
      obj.on(name, function() {
        if(complete) { return; }
        complete = true;
        if(utils.flag(_this, "negate")) {
          assert(false, "expected #{this} to not emit " + name.toString() + ".");
          reject(new Error("Emitter wasn't supposed to emit '" + name.toString() + "'."));
        }
        else {
          resolve();
        }
      });
      setTimeout(function() {
        if(complete) { return; }
        complete = true;
        if(!utils.flag(_this, "negate")) {
          assert(false, "expected #{this} to emit " + name.toString() + ".");
          reject(new Error("Emitter was supposed to emit '" + name.toString() + "'."));
        }
        else {
          resolve();
        }
      }, timeout);
    });
  }

  Assertion.addChainableMethod("emit", function(name) {
    new Assertion(this._obj).to.be.an.emitter;
    utils.flag(this, "emit", true);
    utils.flag(this, "emit.event", name);
  });

  Assertion.addProperty("promise", function() {
    if(!utils.flag(this, "emit")) {
      this.assert(false, "expected '.emit' before '.promise'");
    }
    return assertEventEmit(this);
  });

  function passThroughPromise(method) {
    Assertion.addMethod(method, function() {
      if(!utils.flag(this, "emit")) {
        if(typeof this._obj[method] === "function") {
          return this._obj[method].apply(this._obj, arguments);
        }
        this.assert(false, "expected '.emit' before '." + method + "'");
      }
      var promise = assertEventEmit(this);
      return promise[method].apply(promise, arguments);
    });
  }

  passThroughPromise("then");
  passThroughPromise("catch");

}

if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
  module.exports = plugin;
}
else if (typeof define === "function" && define.amd) {
  define(function () {
    return plugin;
  });
}
else {
  // Other environment (usually <script> tag): plug in to global chai instance directly.
  chai.use(plugin);
}
