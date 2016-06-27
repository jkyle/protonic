import Immutable from 'immutable';
import StateStream from './stream';

export default class Funnel extends StateStream {
  constructor (sourceMap) {
    super(Immutable.Map());

    this.primed = false;
    this.sourceKeys = sourceMap.keySeq();
    this.subscribers = sourceMap.map((value, key) => {
      return value.subscribe(valState => {
        this.state = this.state.set(key, valState);
      });
    });
  }

  sendState (value) {
    if(this.primed){
      super.sendState(value);
    } else {
      if (this.sourceKeys.every(source => value.get(source))) {
        this.primed = true;
        super.sendState(value);
      } else {
        this._state = value;
      }
    }
  }

  destroy () {
    this.subscribers.forEach(subscriber => subscriber.unsubscribe());
  }

}
