import Stream from './stream';

/**
 * A View is a kind of Stream that is useful for transforming the shape of state for
 * use in components or interfaces. A View caches the result of the function, and will
 * only emit state to subscribers if the new return value is distinct from the
 * previous value.
 *
 * @extends {Stream}
 */
class View extends Stream {

  /**
   * constructor - Takes a source stream, and transforms it through a function.
   * The view function takes state from the source stream and transforms it into
   * returns a new shape of the state for use in a component or interface.
   *
   * @access public
   * @param  {Stream} source A stream to receive state from (can be a source stream or a funnel)
   * @param  {function} viewFn A function that takes state and returns a new shape for the state.
   * @returns {View}
   */
  constructor (source, viewFn) {
    if (!source || !(source instanceof Stream)) {
      throw new Error('Views require a source stream.');
    }

    if (!viewFn || (typeof viewFn !== 'function')) {
      throw new Error('Views require a view function.');
    }

    super();

    /**
     * @access private
     */
    this.source = source;

    /**
     * @access private
     */
    this.sourceSubscriber = source.subscribe( state => {
      this.next(viewFn(state))
    });

    /**
     * @access private;
     */
    this.type = 'VIEW';
  }

  /**
   * subscribe - Overrides the base Stream class's subscribe.
   * A View can only have one observer.
   * @access private
   * @override
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
      },
      destroy: () => {
        this.destroy()
      }
    };
  }

  /**
   * forceState - Overrides the base Stream class's forceState.
   * A View cannot receive new state through forceState.
   * @access private
   * @override
   */
  forceState () {
    throw new Error('Cannot force state on a View.')
  }

  /**
   * destroy - Clean up subscriptions.
   *
   * @access public
   */
  destroy () {
    delete this.observers;
    if(this.source.type === 'VIEW') {
      this.source.destroy();
    } else {
      this.sourceSubscriber.unsubscribe();
    }
  }
}

/** @ignore Export the View class. */
export default View;
