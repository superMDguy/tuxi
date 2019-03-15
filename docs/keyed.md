# `tuxi.keyed(fnApiCall, key, taskConfig)`

_For details on `fnApiCall` and `taskConfig`, see [general](general.md)._

Keyed tasks are designed for situations where you want to have multiple separate instances of a request. For example, when fetching a list of messages for a user, you'd only want to have one request active at a time. When sending a message, however, you'll want to support multiple parallel requests, each with their own state. You wouldn't want one message that failed to show an error next to every message that was sent, so you'd use a keyed task for the `sendMessage` api call. With the list of messages, though, you'd use a normal task so that you're only keeping track of the most recent request for the list of messages.

What is the "key" in a keyed task? It's a unique identifier for a request, determined based on the payload to the request. For example, in the messages scenario, the key might be a UUID for the message being sent. When creating a keyed task, the `key` parameter can be either a function that takes in a payload and returns a key, or a string that will be used to get a property of the object. If your message object is `{ id: 123, content: 'hello world' }`, the key could be either `'id'` or `payload => payload['id']`. Both would give the same result, but in this case it would make more sense to pass in `'id'`, since it's simpler. For more complicated keys that rely on multiple parts of the payload, you'll probably need to use the function form of the key.

## Accessing Keyed States

When you create a keyed task, you'll get an object that has all the properties mentioned in [general](general.md). However, instead of being properties, they're all accessor methods. To access keyed states, you'll need to pass in the original payload to the method that corresponds to the property interested in. This payload will be converted to a key using the provided keying function or string. Then, the keyed payload will be used to access the specific request state and property. This may sound super confusing, so an example will probably help:

```js
import tuxi from 'tuxi'
import api from './api'

const sendMessageTask = tuxi.task(api.sendMessage, 'id') // the id field of the payload will be used as a key

const message1 = { id: 1, content: 'hello, world' }
const message2 = { id: 2, content: 'how you doin?' }
const message1Promise = sendMessageTask(message1)
const message2Promise = sendMessageTask(message2)

console.log(sendMessageTask.pending(message1)) // true
// Calling .pending(message1) extracts a key from message1 using the provided key ('id'), and then lookup the request state and return whether or not it's pending

console.log(sendMessageTask.pending(message2)) // true

// assume message1Promise is guaranteed to resolve before message2Promise
message1Promise.then(() => {
  console.log(sendMessageTask.pending(message1)) // false
  console.log(sendMessageTask.value(message1)) // "success" (response from the server)

  console.log(sendMessageTask.pending(message2)) // true
  //The state of the message 2 request is stored separately from the state of the message 1 request
})
```

Other than the different way of accessing them, all the properties behave the same way as they do for [normal tasks](task.md).

[Back to index](readme.md)