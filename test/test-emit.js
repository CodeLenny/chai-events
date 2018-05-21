"use strict";
const chai = require("chai");
const should = chai.should();
const jsc = require("jsverify");
const delay = require("delay");

chai.use(require("../chai-events"));

const { arbitraryEventName } = require("./helpers/event-names");

const EventEmitter = require("events");

const nodeEmitter = () => new EventEmitter();

const anyEmitter = jsc.oneof([
  jsc.constant(nodeEmitter),
]);

const nonEventEmitter = jsc.oneof([
  jsc.constant(() => 1),
  jsc.constant(() => "hello"),
  jsc.constant(() => { x: 1 }),
]);

const shouldEmit = emitter => emitter.should.emit;
const shouldNotEmit = emitter => emitter.should.not.emit;

const anyCheck = jsc.oneof([
  jsc.constant(shouldEmit),
  jsc.constant(shouldNotEmit),
]);

const arbitraryEventData = jsc.oneof([
  jsc.constant(true),
]);

describe("x.should", function() {

  describe("(all functions)", function() {

    jsc.property(
      "fails if given a non-event-emitter",
      nonEventEmitter, anyCheck, arbitraryEventName,
      (emitter, check, eventName) => {
        (function() {
          check(emitter())(eventName);
        }).should.fail;
        return true;
      },
    );

  });

  describe(".not.emit", function() {

    describe("confirms events don't fire", function() {
      let run = 0;
      jsc.assertForall(
        anyEmitter, arbitraryEventName,
        (emitter, eventName) => {
          it(`run ${++run}`, function() {
            return emitter().should.not.emit(eventName);
          });
          return true;
        },
      );
    });

    describe("fails if the event fires", function() {
      let run = 0;
      jsc.assertForall(
        anyEmitter, arbitraryEventName, arbitraryEventData,
        (emitter, eventName, eventData) => {
          it(`run ${++run}`, function() {
            emitter = emitter();
            // Make sure to catch "error" events - they cause "uncaught error":
            emitter.on("error", () => true);
            (function() {
              emitter.should.not.emit(eventName);
            }).should.fail;
            return delay(5)
              .then(() => emitter.emit(eventName, eventData))
              .then(() => delay(25));
          });
          return true;
        },
      );
    });

  });

  describe(".emit", function() {

    jsc.property(
      "listens for immediately emitted events",
      anyEmitter, arbitraryEventName, arbitraryEventData,
      (emitter, eventName, eventData) => {
        emitter = emitter();
        const p = emitter.should.emit(eventName);
        emitter.emit(eventName, eventData);
        return p.then(() => true);
      },
    );

    jsc.property(
      "fails if event isn't sent",
      anyEmitter, arbitraryEventName,
      (emitter, eventName) => {
        (function() {
          emitter().should.emit(eventName);
        }).should.fail;
        return true;
      },
    );

  });

});
