/**
 * @module funnel
 */
import Immutable from 'immutable';
import Stream from './stream';

/**
 * A Funnel is a special type of Stream that combines the states from feeder
 * streams.
 * @extends Stream
 */
class Funnel extends Stream {

  /**
   * A Funnel is a special type of Stream that combines the states from feeder
   * streams. Once all of the feeder streams have sent state, the Funnel will send the combined
   * state to any observers. When creating the Funnel, the sourceMap describes the shape of
   * the combined state. The key for each stream will be the key used to access the state of
   * that stream on the combined state object.
   *
   * @param  {Immutable.Map} sourceMap - a Map of the feeder streams.
   * @return {Funnel}           returns an instance of the Funnel stream.
   */
  constructor (sourceMap) {
    super(Immutable.Map());

    this.primed = false;
    this.sourceKeys = sourceMap.keySeq();
    this.subscribers = sourceMap.map((sourceStream, key) => {
      return sourceStream.subscribe(newState => {
        this.state = this.state.set(key, newState);
      });
    });
  }

  /**
   * sendState - overwrites Stream's `sendState` by enforcing that all feeder streams have
   * sent state before sending state on to observers. Once a Funnel is `primed` it will pass
   * state on, regardless if one stream sends `undefined`.
   *
   * @access private
   * @param  {Immutable} newState - new state (received internally from Stream's `next` method)
   */
  sendState (newState) {
    if(this.primed){
      super.sendState(newState);
    } else {
      if (this.sourceKeys.every(source => newState.get(source))) {
        this.primed = true;
        super.sendState(newState);
      } else {
        this._state = newState;
      }
    }
  }

  /**
   * destroy - cleans up a Funnel's feeder subscribers.
   *
   * @access public
   */
  destroy () {
    this.subscribers.forEach(subscriber => subscriber.unsubscribe());
  }

}

export default Funnel;
