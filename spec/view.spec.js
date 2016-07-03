import { Stream, View } from '../src'
import Immutable from 'immutable';

describe('View Stream', () => {
  describe('Initialization', () => {
    let testStream;

    beforeEach(() => {
      testStream = new Stream();
    })

    it('should require a source stream', () => {
      expect(() => new View()).toThrow();
      expect(() => new View(state => state)).toThrow();
    });

    it('should require a view function', () => {
      expect(() => new View(new Stream())).toThrow();
    });

    it('should subscribe to the source stream', () => {
      new View(testStream, state => state);
      expect(testStream.observers.size).toBe(1);
    });
  });

  describe('Transforming state', () => {
    let testStream;
    let testView;

    beforeEach(() => {
      testStream = new Stream(Immutable.Map({ foo: 'bar',
                                              name: 'Finn'}));
      testView = new View(testStream, state => {
        return state.set('fooName', state.get('foo') + ' ' + state.get('name'));
      });
    });

    it('should send transformed state to subscribers', () => {
      let testValue;
      testView.subscribe( state => testValue = state);
      expect(testValue.get('fooName')).toBe('bar Finn');
    });

    it('should send new state to subscribers.', () => {
      let testValue;
      testView.subscribe( state => testValue = state);
      testStream.state = testStream.state.set('foo', 'baz');
      expect(testValue.get('fooName')).toBe('baz Finn');
    });
  });

  describe('Destroy', () => {
    let testStream;
    let testView;

    beforeEach(() => {
      testStream = new Stream(Immutable.Map({ foo: 'bar',
                                              name: 'Finn'}));
      testView = new View(testStream, state => {
        return state.set('fooName', state.get('foo') + ' ' + state.get('name'));
      });
    });

    it('should unsubscribe from source stream when destroyed', () => {
      testView.destroy();
      expect(testStream.observers.size).toBe(0);
    });
  })
});
