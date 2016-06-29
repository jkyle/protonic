# PROTONIC

_It's like other things, only different._

## Overview

Protonic is a (very) simple (framework agnostic) library for managing state through streams. By itself, Protonic isn't much of a framework, but _is_ designed to work with a simple one-way data flow pattern that we'll describe here.

## One-Way Data Flow

### Terminology

#### Streams
A **Stream** is a canonical source of state for a part of an application. Observers can subscribe to a stream to receive new state when the stream updates. Streams in Protonic are similar to streams in other frameworks (like rxjs), but make certain assumptions to simplify things.

1. Streams won't emit falsey values.
2. Streams won't emit a new state if it's content is the same as the current state of the stream.
3. Streams don't "complete".
4. Streams make their internal state available without needing to subscribe to the stream.

#### Transformers
A **transformer** is a function that gets the current state of a stream, transforms the state into new state, and sends the new state back to the stream.

A transformer is *only* allowed to operate on state from one stream. It may not affect state outside of itself. Additionally, *Only* transformers are allowed to change the state of stream.

#### Actions
Since transformers are each allowed to only transform state from one stream, and are not allowed to have side-effects, **actions** are what we use to combine state changes across streams, as well as perform side-effects (such as Ajax request to fetch data from a server).

Actions are allowed to call transformers for different streams, but actions may not manipulate streams directly. Since transformers are not technically reducers (they don't receive state as an argument or return state), they cannot be batched together in on atomic state change. This means that a transform of state from one stream should not depend on a transform of state from another stream happening in a particular order.

#### Funnels
A **Funnel** is just a special kind of stream that takes *other* streams as its input. The funnel will combine the state from the other streams into a new state object. The Protonic Pattern is a big believer that there should only be one source of state for UI components to subscribe to. Typically an AppState will be created by **Funnel**-ing the individual source streams into one state object.

Funnels initialize with an empty `Immutable.Map` as its value, but won't emit state to observers until *all* of the source streams have sent state to the Funnel.

#### Views
A **View** is another special kind of stream that takes a single stream as input along with a function that computes new state from the state of the source stream.

Since streams only emit new state to observers when the new state is distinct from the current state, views will only emit when the computed state changes. This is a good way to prevent a lot of unnecessary calls to observers when the application state changes.

### Wiring Up UI Components
Since the Protonic Pattern is framework agnostic, the specific implementation details will be determined by whichever framework is rendering your interface.

**TODO** Write simple component example.

**TODO** Show API for Streams, Funnels, views

**TODO** Talk about Logging/Debugging with Stacks.

**TODO** Show code examples for actions and transformers

**TODO** Talk more about philosophy of Protonic

**TODO** Data Flow Diagrams

**TODO** Talk about gotchas (i.e. Actions cannot subscribe to streams)
