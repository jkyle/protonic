## Funnels
A **Funnel** is just a special kind of stream that takes *other* streams as its input. The funnel will combine the state from the other streams into a new state object. The Protonic Pattern is a big believer that there should only be one source of state for UI components to subscribe to. Typically an AppState will be created by **Funnel**-ing the individual source streams into one state object.

Funnels initialize with an empty `Immutable.Map` as its value, but won't emit state to observers until *all* of the source streams have sent state to the Funnel.

### Funnel API
A funnel is created with `new Funnel()` and takes a required argument which is a map of streams to combine into one state object. The key for each stream in the map will end up corresponding to the key for that stream's part of the state in the combined state object.

```javascript
import { Funnel } from 'protonic';
import pilotStream from 'path/to/pilot-stream';
import shipStream from 'path/to/ship-stream';

let AppStream = new Funnel(Immutable.Map({
  Pilots: pilotStream,
  Ships: shipStream
}))
```

Just like with Streams, you can get the current state of the Funnel with the `.state` property.

```javascript
let currentState = AppStream.state;
// currentState is Immutable.Map of
// { Pilot: { name: 'Testor' },
//   Ship: { type: 'X-Wing' } }
```

Also like Streams, you can subscribe to state changes with the `.subscribe` method. Note that state will not be sent to observers until all of the source streams have emitted state to the funnel.

```javascript
let subscriber = AppStream.subscribe(state => console.log(state));
// logs out state anytime state changes.

// later on
subscriber.unsubscribe();
```

Finally, when you are done with a Funnel, you can call `.destroy` method to clean up the Funnel and unsubscribe from the source streams.

```javascript
AppStream.destroy()
```

## Views
A **View** is another special kind of stream that takes a single stream as input along with a function that computes new state from the state of the source stream.

Since streams only emit new state to observers when the new state is distinct from the current state, views will only emit when the computed state changes. This is a good way to prevent a lot of unnecessary calls to observers when the application state changes.

### View API
A View is created with `new View(soureStream, viewFunction)`, and requires a source stream which it will subscribe to and a view function to change the shape of the state before emitting to its own subscribers.

```javascript
import { View } from 'protonic';
import AppStream from 'path/to/app-stream';

let myView = new View(AppStream, state => {
  let pilotName = state.getIn(['Pilot', 'name']);
  let shipType = state.getIn(['Ship', 'type']);
  return Immutable.Map({
    description: pilotName + ' flies an ' + shipType
  });
})
```
