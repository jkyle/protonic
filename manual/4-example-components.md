### Wiring Up UI Components
Since the Protonic Pattern is framework agnostic, the specific implementation details will be determined by whichever framework is rendering your interface. (It's also important to note that the pattern isn't limited to an interface being a *UI* interface.)


#### Example components
We'll demonstrate an oversimplified example of components in both Angular (1.5, but the concept applies as well to 2.0) and React. In both cases, we'll assume that a stream called `AppStream` will send the following state:

```javascript
Immutable.Map({
  id: 3,
  name: 'Jessika Pava',
  callsign: 'Blue Three',
  fighter: 'T-70 X-Wing',
  affiliation: 'Resistance',
  sorties: 18
})
```


#### Angular 1.5

*In an effort to reduce complexity, we aren't using Angular's Dependency Injection here. If you need DI, you can create a service as a wrapper around the stream. Additionally, changes in state won't automatically trigger a digest cycle. An example of how to do with will be provided later on.*

```javascript

import AppStream from 'path/to/app-stream';
import { incrementPilotSortie } from 'path/to/actions';

export default {
  template: '... some template ...',
  bindings: {},
  controller: function(){
    let subscriber;
    // Initial state.
    this.pilot = {
      name: '',
      callsign: ''
      fighter: '',
      affiliation: '',
      sorties: 0
    };

    // Lifecycle methods.
    // $onInit sets up the state subscriber.
    this.$onInit = function () {
      subscriber = AppStream.subscribe(state => this.pilot = state.toJS())
    }

    // $onDestroy cleans up the subscriber
    this.$onDestroy = () => {
      subscriber.unsubscribe()
    }

    // A method to be called from the UI
    // which in turn calls an action.
    this.incrementSortie = () => {
      incrementPilotSortie(this.pilot.id);
    }
  }
}

```


#### React

```javascript
import AppStream from 'path/to/app-stream';
import { incrementPilotSortie } from 'path/to/actions';

export default React.createClass({
  getInitialState: function() {
    return { pilot:{
              name: '',
              callsign: ''
              fighter: '',
              affiliation: '',
              sorties: 0
            }
          }
  },
  componentDidMount: function() {
    this.subscriber = AppStream.subscribe(state => this.setState({ pilot: state.toJS() }));
  },
  componentWillUnmount: function() {
    this.subscriber.unsubscribe();
  },
  incrementSortie: function() {
    incrementPilotSortie(this.state.pilot.id);
  },
  render: function() {
    return ( /*... some jsx  ... */ );
  }
})
```
