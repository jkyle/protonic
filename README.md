# PROTONIC

_It's like other things, only different._

## Overview

Protonic is a (very) simple (framework agnostic) library for managing state through streams. It's inspired by other popular state-management patterns and libraries (notably Redux, Flux, and RxJS), but makes certain assumptions and trade-offs in support of reducing complexity and developing applications following a specific pattern. By itself, Protonic isn't much of a framework, but _is_ designed to work with a simple one-way data flow pattern that we'll describe here. (This pattern isn't anything new, but for the sake of this document and this particular flavor of the pattern we'll call it the Protonic Pattern.)

## Getting Started (Quickly)

To use Protonic in your app, install it with npm:

`npm install protonic --save`


```javascript
import Immutable from 'immutable';
import { Stream } from 'protonic';

// To create a stream:
let initialState = Immutable.Map({ name: 'Jessika Pava' })
let myStream = new Stream(initialState);


// To subscribe to a stream:
let subscriber = myStream.subscribe(state => console.log(state.get('name')));
// immediately logs "Jessika Pava"

// To send state to a stream:
myStream.state = myStream.state.set('name', '"Snap" Wexley');
// logs '"Snap" Wexley'

// To unsubscribe from a stream:
subscriber.unsubscribe();

myStream.state = myStream.state.set('name', 'Karé Kun');
// nothing logs.
```

## Manual
[Overview](https://jkyle.github.io/protonic/manual/overview.html)

[Getting Started](https://jkyle.github.io/protonic/manual/getting%20started.html)

[One-Way Data Flow](https://jkyle.github.io/protonic/manual/data%20flow.html)

[Example Components in Angular and React](https://jkyle.github.io/protonic/manual/example%20components.html)

[Other Streams: Funnels and Views](https://jkyle.github.io/protonic/manual/utility%20streams.html)

[Source Documentation](https://jkyle.github.io/protonic)

## Actions and Transformers

### Transformers
Transformers are solely responsible for manipulating state for a stream. They are not pure reducers, however. Transformers don't take state as an input. Rather, they fetch the current state from the stream directly. They also do not return new state. Rather, they send the new state back to the stream. Regardless, transformers should still follow the same rules as pure reducers, specifically that they do not depend on state outside of the stream, and that they do not alter state outside of the stream.

```javascript
// A typical transformer
function incrementPilotSortie(amount) {
  let currentState = stream.state; // state is an Immutable data structure.
  let sorties = currentState.get('sorties');
  let newSorties = sorties + amount;
  let newState = currentState.set('sorties', newSorties);
  stream.next(newState);
}
```
This can be simplified to:
```javascript
// A typical transformer
function incrementPilotSortie(amount) {
  stream.state = stream.state.update('sorties', num => num + amount);
}
```

### Actions
Most of the time, when a user triggers an action, we would expect state in multiple streams to be update. An example would be a section of the UI updating to show a progress bar or spinner when data is fetched from the server. Since transformers are prohibited from affecting state from outside their stream, actions are our way of combining transformers and necessary side-effects (ajax calls, for example).

```javascript
function getPilots () {
  uiTransformers.setSpinner(true);
  $get('api/to/pilots')
    .then(result => {
      pilotTransformers.updatePilots(result);
      uiTransformers.setSpinner(false);
    },
    error => {
      uiTransformers.setSpinner(false);
      uiTransformers.setError(error);
    });
}
```

## API

### Streams
A stream is created by calling `new Stream()` an optionally passing in an initial state. If you do
pass in an initial state, it must be an `Immutable` data structure.

```javascript
import { Stream } from 'protonic';

let myStream = new Stream(Immutable.Map({name: 'Testor'}));
```

You can get the current state of a stream at any time by access the `.state` property.

```javascript
let currentState = myStream.state;
// currentState is Immutable.Map of {name: 'Testor'}
```

You can subscribe to any changes to the stream's state with the `.subscribe` method. `.subscribe` takes a callback function (we'll call it an _observer_) that is called any time the stream's state changes. `.subscribe` returns an object with an `.unsubscribe` method. `.unsubscribe` should be called whenever the observer is done listening to state changes.

```javascript
let subscriber = myStream.subscribe(state => console.log(state));
// logs out state anytime state changes.

// later on
subscriber.unsubscribe();
```

You can send new state to the stream with the `.next(newState)` method. This will send the state to any observers, provided that the new state is not falsey and is distinct from the stream's current state.

```javascript
myStream.next(Immutable.Map({name: 'Snap'}))
// myStream.state is now Immutable.Map of {name: 'Snap'}
```

Protonic also allows you to set the state through the `.state` setter property. It is functionally equivalent to calling `.next(newState)`, but might be more declarative:

```javascript
myStream.state = Immutable.Map({name: 'Snap'});
// myStream.state is now Immutable.Map of {name: 'Snap'}
```


### Funnels
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


### Views
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

As with Streams and Funnels, the current state of a View is accessible by its `.state` property:

```javascript
let currentState = myView.state;
// currentState is Immutable.Map of { description: 'Testor flies an X-Wing' }
```

Also like Streams and Funnels, you can subscribe to state changes from the view. Just like Streams, observers will only receive state if the new state calculated by the View is distinct from the last state calculated by the View.

```javascript
let subscriber = myView.subscribe(state => console.log(state));
// logs out state anytime state changes.

// later on
subscriber.unsubscribe();
```

And, like Funnels, when you are done with a View, it can be cleaned up with the `.destroy` method.

```javascript
myView.destroy();
```

## Logging and Debugging
**TODO** Talk about Logging/Debugging with Stacks.


## Why Protonic
**TODO** Talk more about philosophy of Protonic

**TODO** Talk about gotchas (i.e. Actions cannot subscribe to streams)
