"use strict";
const chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(require("../chai-events"));
chai.use(chaiAsPromised);

const should = chai.should();

const EventEmitter = require("events");

function noop() {
  return true;
}

describe("x.should.emit", function() {

  let emitter = null;
  beforeEach(function() {
    emitter = new EventEmitter();
  });

  it("should fail if given non-event-emitters", function() {
    (function() {
      ({x: 1}).should.emit("test");
    }).should.throw();
  });

  it("should listen for immediately emitted events", function(done) {
    emitter.should.emit("test").then(done);
    emitter.emit("test", true);
  });

  it("should handle symbols as events", function(done) {
    const event = Symbol('test');
    emitter.should.emit(event).then(done);
    emitter.emit(event, true);
  });

  it("should fail if the event isn't sent", function() {
    (function() {
      emitter.should.emit(test).promise;
    }).should.throw();
  });

  it("should handle events that should not fire", function(done) {
    emitter.should.not.emit("test").then(done);
  });

  it("should fail if given a fired event", function() {
    setTimeout(function() {
      emitter.emit("test");
    }, 200);
    emitter.should.not.emit("test").should.be.rejected;
  });

});
