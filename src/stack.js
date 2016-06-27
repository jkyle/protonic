import Immutable from 'immutable';

export default class Stack {
  constructor (size = 20, debug = false) {
    this.stack = Immutable.List().setSize(size);
    this.debug = debug;
  }

  addToStack (item) {
    if (this.debug) {
      this.stack = this.stack.shift().push(item);
    }
  }

  pushAction (fn, args) {
    this.addToStack(Immutable.Map({type: 'ACTION', name: fn, args: args}));
  }

  pushState (name, state) {
    this.addToStack(Immutable.Map({ type: 'STATE', name , state }));
    if (this.debug && this.testFn && this.testFn(state)) {
      this.dumpWhenCb(this.dump());
    }
  }

  pushTransformer (fn, args) {
    this.addToStack(Immutable.Map({ type: 'TRANSFORMER', name: fn, args: args}));
  }

  pushLog (text) {
    this.addToStack(Immutable.Map({ type: 'LOG', text }));
  }

  dump () {
    return this.stack.filter(item => item);
  }

  dumpWhen (testFn, dumpFn) {
    this.testFn = testFn;
    this.dumpWhenCb = dumpFn;
  }

  dumpToLog (stateAccessor) {
    const toLog = {
      ACTION: item => console.log('%cACTION ' + '%c'+item.get('name') + '\n',
                                  'font-weight: bold; color: #629456', 'font-style: italic; color: #004',
                                  item.get('args')),
      LOG: item => console.log('%cLOG\n' + item.get('text'), 'background: #eee; color: #555'),
      TRANSFORMER: item => console.log('%cTRANSFORMER ' + '%c' + item.get('name') + '\n',
                                       'font-weight: bold; color: #D08A10', 'font-style: italic; color: #004',
                                       item.get('args')),
      STATE: (item, stateAccessor = []) => console.log('%cSTATE ' + '%c' + item.get('name') + '\n',
                                            'font-weight: bold; color: #3B74C4', 'font-style: italic; color: #004',
                                            item.getIn(['state'].concat(stateAccessor)).toJS())
    }

    if (this.debug) {
      this.stack.map((item, index) => {
        if(item){
          toLog[item.get('type')](item, stateAccessor);
        }
      });
    }
  }

  set size(newSize) {
    this.stack.setSize(newSize);
  }

  get size() {
    return this.stack.size;
  }
}
