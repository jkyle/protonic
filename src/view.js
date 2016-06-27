import StateStream from './state-stream';

export default class View extends StateStream {
  constructor (source, viewFn) {
    super();

    this.source = source;
    this.sourceSubscriber = source.subscribe( state => this.next(viewFn(state)) );
  }

  destroy () {
    this.sourceSubscriber.unsubscribe();
  }
}
