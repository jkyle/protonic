/** @module stream */

/** Requires Immutable */
import Immutable from 'immutable';

/**
 * Class Stream - Base class for Funnels and Views.
 *
 */
class Stream {

  /**
   * constructor - When creating a new stream, an initial state is not required, but it is
   * encouraged. If an initial state is passed in, it should be an Immutable data structure.
   *
   * @param  {Immutable} initialState this is the state that the stream will start with.
   * @return {Stream} Instance of a Stream.
   */
  constructor (initialState) {
    if(initialState && !Immutable.Iterable.isIterable(initialState)) {
      throw new TypeError('initialState must be immutable');
    }

    this._state = initialState;
    this.observers = Immutable.List();
  }


  logStack (name, stack) {
    this.name = name;
    this.stack = stack;
  }
  /**
   * subscribe - takes a callback function that is executed any time the stream received _new_
   * state. The callback should accept `state` as an argument. If the stream currently has state,
   * it will be passed to the callback immediately upon subscription.
   *
   * An observer gets added to an `observers` array. State changes will propagate to any observers
   * in this array.
   *
   * It will return an object (we'll call a _subscriber_) that has an `unsubscribe` method. This
   * method will remove the observer from the `observers` List and should be called anytime the
   * observer is done listening to the stream. Failing to do so could cause memory leaks.
   *
   * @access public
   * @param  {function} observer - the callback function to be executed whenever state updates
   * @return {object}            - a _subscriber_ object with an `unsubscribe` method
   */
  subscribe (observer) {
    this.observers = this.observers.push(observer);
    if(this._state) { observer(this._state); }
    return {
      unsubscribe: () => {
        const idx = this.observers.indexOf(observer);
        if (idx >= 0) {
          this.observers = this.observers.delete(this.observers.indexOf(observer));
        } else {
          throw new RangeError('Observer is not subscribed to this stream.');
        }
      }
    };
  }

  /**
   * sendState - Gets called whenever the Stream receives _new_ state. `sendState` first updates
   * the Streams internal `_state` and then each observer in the `observers` List will be called
   * with the new state as its argument.
   *
   * @access private
   * @param  {Immutable} newState the Stream's new state.
   */
  sendState (newState) {
      this._state = newState;
      if (this.stack) { this.stack.pushState(this.name, this._state, this.type); }
      this.observers.forEach(observer => observer(this._state));
  }

  /**
   * next - Receives new state (externally, ideally through a transformer) and verifies that the
   * new state is different from the Stream's current state before passing on to `sendState` (and,
   * all the observers, by extension).
   *
   * @access public
   * @param  {Immutable} newState
   */
  next (newState) {
    if(!Immutable.is(this._state, newState)){
      this.sendState(newState);
    }
  }

  /**
   * get state - a getter for returning the current internal state of the Stream.
   *
   * @return {Immutable} - current state contained by the Stream
   */
  get state(){
    return this._state;
  }

  /**
   * set state - a setter that's probably more clever than it needs to be. Instead of setting
   * the internal state, it calls `next`.
   *
   * ```javascript
   * stream.next(newState)
   * // is functionally the same as
   * stream.state = newState
   * ```
   *
   * Like I said, maybe too clever, but I thinks allow for a more delarative style when
   * writing transformers.
   *
   * @param  {type} newState description
   * @return {type}          description
   */
  set state(newState){
    this.next(newState);
  }
}

export default Stream;
