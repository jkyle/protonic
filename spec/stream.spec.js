import { Stream } from '../src';
import Immutable from 'immutable';

describe("Source Stream", function() {
  describe("Empty Initial State", () => {
    let emptyStateStream;

    beforeEach(() => {
      emptyStateStream = new Stream();
    })

    it("should have an undefined initial state.",
       () => expect(emptyStateStream.state).toBeUndefined());

    it("should not send state when subscribed.",
       (done) => {
         let verify = 'init';
         emptyStateStream.subscribe(state => verify = 'updated');
         expect(verify).toBe('init');
         done();
       });
  });

  describe('Initial state', () => {
    let stream;

    it("should have an inital state.",
       () => {
         let stream = new Stream(Immutable.Map({foo: 'bar'}));
         expect(stream.state.get('foo')).toBe('bar')
       });

    it('should error if initial state is not Immutable', () => {
        expect( () => new Stream({foo: 'bar'}) ).toThrow();
    });
  });

  describe('Subscribing', () => {
    let stream;

    beforeEach(() => {
      stream = new Stream(Immutable.Map({foo: 'bar'}));
    })

    it("should send state when subscribed.", () => {
      let verify = 'init';
      stream.subscribe(state => verify = 'updated');
      expect(verify).toBe('updated');
    });

    it("should send state to multiple subscribers.", () => {
      let verify1 = 'init';
      let verify2 = 'init';
      stream.subscribe(state => verify1 = 'updated');
      stream.subscribe(state => verify2 = 'updated');
      expect(verify1).toBe('updated');
      expect(verify2).toBe('updated');
    });

    it("should have one observer per subscriber.", () => {
      stream.subscribe(() => {});
      stream.subscribe(() => {});
      expect(stream.observers.size).toBe(2);
    });
  });

  describe("Unsubscribing", () => {
    let stream;
    let verify1;
    let verify2;
    let subscription1;
    let subscription2;

    beforeEach(() => {
      stream = new Stream(Immutable.Map({foo: 'bar'}));
      verify1 = 'init';
      verify2 = 'init';
      subscription1 = stream.subscribe(state => verify1 = state.get('foo'));
      subscription2 = stream.subscribe(state => verify2 = state.get('foo'));
    });

    it('should remove observers when unsubscribed.', () => {
      subscription1.unsubscribe();
      expect(stream.observers.size).toBe(1);
      subscription2.unsubscribe();
      expect(stream.observers.size).toBe(0);
    });

    it('should not send state after unsubscribed.', () => {
      subscription1.unsubscribe();
      stream.state = stream.state.update('foo', () => 'butt1');
      expect(verify1).toBe('bar');
      expect(verify2).toBe('butt1');
      subscription2.unsubscribe();
      stream.state = stream.state.update('foo', () => 'butt2');
      expect(verify2).toBe('butt1');
    });

    it('should throw an error if multiple subscriptions from same observer occur.', () => {
      subscription1.unsubscribe();
      expect(() => subscription1.unsubscribe()).toThrow();
    });

  });

  describe("Changing State", () => {
    let stream;

    beforeEach(() => {
      stream = new Stream(Immutable.Map({foo: 'bar'}));
    })

    it("should change state when state is set.", () => {
         stream.state = stream.state.set('foo', 'baz');
         expect(stream.state.get('foo')).toBe('baz');
       });

    it('should send state to subscribers when state is set.', () => {
      let verify = 'init';
      stream.subscribe(state => verify = state.get('foo'));
      stream.state = stream.state.update('foo', () => 'baz');
      expect(verify).toBe('baz');
    });

    it('should not send state if new state is the same as old state', () => {
      let verifyCount = 0;
      stream.subscribe(state => verifyCount += 1);
      stream.state = stream.state.update('foo', () => 'bar');
      expect(verifyCount).toBe(1);
    });
  });
});
