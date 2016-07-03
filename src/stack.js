/** Requires Immutable */
import Immutable from 'immutable';

/**
 * A Stack isn't a stream, but can be used in conjunction with streams, actions, and
 * transformers to make debugging much easier. Using `pushAction`, 'pushState`,
 * `pushTransformer`, and `pushLog`, you can create a log of state changes and
 * their causes. Calling `dump`, `dumpToLog`, and `dumpWhen` will give you control
 * over when to view to stack.
 */
class Stack {

  /**
   * constructor - A stack takes a size for the stack and a boolean to determine
   * whether the stack should be enabled on creation.
   *
   * @access public
   * @param  {number} size = 20     The size of the stack.
   * @param  {boolean} debug = false
   * @return {Stack}               
   */
  constructor (size = 20, debug = false) {


    /**
     * @access private
     */
    this.stack = Immutable.List().setSize(size);

    /**
     * @access public
     */
    this.debug = debug;
  }

  /**
   * addToStack - Removes the oldest item from the stack,
   * and adds a new item to the stack.
   *
   * @access private
   * @param  {Immutable.Map} item The new item to add to the stack.
   */
  addToStack (item) {
    if (this.debug) {
      this.stack = this.stack.shift().push(item);
    }
  }

  /**
   * pushAction - Adds an action to the stack.
   *
   * @access public
   * @param  {string} fnName Name of the action called.
   * @param  {object} args Arguments to the action called.
   */
  pushAction (fnName, args) {
    this.addToStack(Immutable.Map({type: 'ACTION', name: fnName, args: args}));
  }

  /**
   * pushState - Adds a state Map to the stack.
   *
   * @access public
   * @param  {string} name     Name of the stream that's adding state
   * @param  {Immutable.Map} state      The state object to add to the stack.
   * @param  {string} streamType The type of stream (View, Funnel, Stream) adding the state.
   */
  pushState (name, state, streamType) {
    this.addToStack(Immutable.Map({ type: 'STATE', name , state, streamType }));
    if (this.testFn && this.testFn(state)) {
      this.dumpWhenCb(this.dump());
    }
  }

  /**
   * pushTransformer - Adds a transformer to the stack.
   *
   * @access public
   * @param  {string} fnName Name of the transformer called.
   * @param  {object} args Arguments to the transformer called.
   */
  pushTransformer (fnName, args) {
    this.addToStack(Immutable.Map({ type: 'TRANSFORMER', name: fnName, args: args}));
  }

  /**
   * pushLog - Adds a text log to the stack.
   *
   * @param  {string} text The text to be added to the stack.
   */
  pushLog (text) {
    this.addToStack(Immutable.Map({ type: 'LOG', text }));
  }

  /**
   * dump - Returns the stack, removing any undefined items.
   *
   * @return {Immutable.List}  the stack.
   */
  dump () {
    return this.stack.filter(item => item);
  }

  /**
   * dumpWhen - adds a test function to the stack that will run whenever
   * new state is added to the stack. The test function takes the state
   * as an argument and returns a boolean. If the test function returns
   * true, it will then run the callback function, passing the current
   * stack as an argument.
   *
   * @param  {function} testFn takes state as an argument and returns a boolean.
   * @param  {function} callbackFn takes the current stack as an argument
   */
  dumpWhen (testFn, callbackFn) {
    this.testFn = testFn;
    this.dumpWhenCb = callbackFn;
  }

  /**
   * dumpToLog - When dumpToLog is called, it logs out the current stack to
   * the console, formatting the different types of items in the stack for
   * clarity. It takes an optional array for only logging a particular
   * part of the state objects.
   *
   * @param  {array} stateAccessor takes an array of strings for logging only a certain part of the state
   */
  dumpToLog (stateAccessor) {
    const toLog = {
      ACTION: item => console.log('%cACTION ' + '%c'+item.get('name') + '\n',
                                  'font-weight: bold; color: #629456', 'font-style: italic; color: #004',
                                  item.get('args')),
      LOG: item => console.log('%cLOG\n' + item.get('text'), 'background: #eee; color: #555'),
      TRANSFORMER: item => console.log('%cTRANSFORMER ' + '%c' + item.get('name') + '\n',
                                       'font-weight: bold; color: #D08A10', 'font-style: italic; color: #004',
                                       item.get('args')),
      STATE: (item, stateAccessor = []) => console.log('%cSTATE ' + (item.streamType ? '(' + item.streamType + ')' : '') + '%c' + item.get('name') + '\n',
                                            'font-weight: bold; color: #3B74C4', 'font-style: italic; color: #004',
                                            item.getIn(['state'].concat(stateAccessor)).toJS())
    };

    if (this.debug) {
      this.stack.map(item => {
        if(item){
          toLog[item.get('type')](item, stateAccessor);
        }
      });
    }
  }

  /**
   * set size - sets the size of the stack.
   *
   * @access public
   * @param  {number} newSize new size for the stack.
   */
  set size(newSize) {
    this.stack.setSize(newSize);
  }

  /**
   * get size - getter for returning the current size of the stack.
   *
   * @return {number}  returns size of the stack
   */
  get size() {
    return this.stack.size;
  }
}

/** @ignore Export the Stack class. */
export default Stack;
