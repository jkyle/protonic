import Stream from './stream';

export default class View extends Stream {
  constructor (source, viewFn) {
    super();

    this.source = source;
    this.sourceSubscriber = source.subscribe( state => this.next(viewFn(state)) );
  }

  destroy () {
    this.sourceSubscriber.unsubscribe();
  }
}
