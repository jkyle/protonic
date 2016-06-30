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
