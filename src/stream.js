import Immutable from 'immutable';

export default class StateStream {
  constructor (initial_state) {
    if(initial_state && !Immutable.Iterable.isIterable(initial_state)) {
      throw new TypeError('initial_state must be immutable');
    }

    this._state = initial_state;
    this.views = Immutable.Map();
    this.observers = Immutable.List();
  }

  subscribe (observer) {
    this.observers = this.observers.push(observer);
    if(this._state) { observer(this._state) }
    return {
      unsubscribe: () => {
        const idx = this.observers.indexOf(observer);
        if (idx >= 0) {
          this.observers = this.observers.delete(this.observers.indexOf(observer));
        } else {
          throw new RangeError('Observer is not subscribed to this stream.');
        }
      }
    }
  }

  sendState (value) {
      this._state = value;
      this.observers.forEach(observer => observer(this._state));
  }

  next (value) {
    if(!Immutable.is(this._state, value)){
      this.sendState(value);
    }
  }

  get state(){
    return this._state;
  }

  set state(newState){
    this.next(newState);
  }
}
