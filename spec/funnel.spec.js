import { Funnel, Stream, View } from '../src'
import Immutable from 'immutable';

describe('Funnel Stream', () => {

  describe('Initizing', () => {
    let testStream1;
    let testStream2;
    let testView;

    beforeEach(() => {
      testStream1 = new Stream();
      testStream2 = new Stream();
      testView = new View(testStream1);
    })

    it('Should require a Stream Map when initializing.', () => {
      expect(() => new Funnel()).toThrow();
      expect(() => new Funnel({foo:'bar'})).toThrow();
    });

    it('Should not allow Views in the Stream Map', () => {
      let streamMap = Immutable.Map({ view: testView });
      expect(() => new Funnel(streamMap)).toThrow();
    });

    it('Should subscribe to source streams in the stream map', () => {
      let funnel = new Funnel(Immutable.Map({ source: testStream2 }));
      expect(testStream2.observers.size).toBe(1);
    });

    it('Should subscribe to funnels in the stream map', () => {
      let streamMap1 = Immutable.Map({ source: testStream1 })
      let testFunnel = new Funnel(streamMap1);
      let streamMap2 = Immutable.Map({ source: testStream2,
                                       funnel: testFunnel });
      let testFunnel2 = new Funnel(streamMap2);
      expect(testFunnel.observers.size).toBe(1);
    });
  });

  describe('State', () => {
    let testStreamFoo;
    let testStreamName;
    let testStreamUndefined;
    let testFunnel;

    beforeEach(() => {
      testStreamFoo = new Stream(Immutable.Map({ foo: 'bar'}));
      testStreamName = new Stream(Immutable.Map({ name: 'finn'}));
      testStreamUndefined = new Stream();
      testFunnel = new Funnel(Immutable.Map({FooStream: testStreamFoo}));
    });

    it('Should receive state from stream map streams.', () => {
      expect(testFunnel.state.getIn(['FooStream', 'foo'])).toBe('bar');
    });

    it('Should receive state changes from stream map changes.', () => {
      testStreamFoo.state = testStreamFoo.state.set('foo', 'baz');
      expect(testFunnel.state.getIn(['FooStream', 'foo'])).toBe('baz');
    });

    it('Should send state changes from stream map to subscribers.', () => {
      let testValue;
      testFunnel.subscribe(state => testValue = testFunnel.state.getIn(['FooStream', 'foo']));
      testStreamFoo.state = testStreamFoo.state.set('foo', 'baz');
      expect(testValue).toBe('baz');
    });

    it('Should not send state changes until all states are defined.', () => {
      let testInc = 0;
      let undefFunnel = new Funnel(Immutable.Map({foo: testStreamUndefined}));
      undefFunnel.subscribe(state => testInc += 1);
      testStreamUndefined.state = Immutable.Map({foo: 'bar'});
      expect(testInc).toBe(1);
    });
  });

  describe('Destruction', () => {
    let testStreamFoo;
    let testStreamName;
    let testFunnel;

    beforeEach(() => {
      testStreamFoo = new Stream(Immutable.Map({ foo: 'bar'}));
      testStreamName = new Stream(Immutable.Map({ name: 'finn'}));
      testFunnel = new Funnel(Immutable.Map({FooStream: testStreamFoo,
                                             NameStream: testStreamName}));
    });

    it('should unsubscribe to all source streams when destroyed', () => {
      testFunnel.destroy();
      expect(testStreamFoo.observers.size).toBe(0);
      expect(testStreamName.observers.size).toBe(0);
    });
  });

  describe('Hydration', () => {
    let testStreamFoo;
    let testStreamName;
    let testFunnel;
    let testFunnel2;

    beforeEach(() => {
      testStreamFoo = new Stream(Immutable.Map({ foo: 'bar'}));
      testStreamName = new Stream(Immutable.Map({ name: 'finn'}));
      testFunnel = new Funnel(Immutable.Map({FooStream: testStreamFoo,
                                             NameStream: testStreamName}));
      testFunnel2 = new Funnel(Immutable.Map({
        fun: testFunnel
      }))
    });

    it('Should send state to source streams.', () => {
      let newState = Immutable.fromJS({
        fun: {
          FooStream: { foo: 'baz' },
          NameStream: { name: 'finn' }
        }
      });
      testFunnel2.forceState(newState);
      expect(testStreamFoo.state.get('foo')).toBe('baz');
      expect(testStreamName.state.get('name')).toBe('finn');
    })
  });
});
