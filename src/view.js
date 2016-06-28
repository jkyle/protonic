
/**
 * @module view
 */
import Stream from './stream';

/**
 * A View is a kind of Stream the that caches particular a shape of state.
 *
 * @extends Stream
 */
class View extends Stream {
  constructor (source, viewFn) {
    super();

    this.source = source;
    this.sourceSubscriber = source.subscribe( state => this.next(viewFn(state)) );
  }

  destroy () {
    this.sourceSubscriber.unsubscribe();
  }
}

export default View;
