# `tuxi.task(fnApiCall, taskConfig)`

_See [general](general.md) for details about the arguments. `tuxi.task()` returns a task object, which is also decribed in [general](general.md)._

The main special thing about `tuxi.task()` is how it deals with requests that occur while another one is in progress. When the older promise resolves, tuxi will pass a rejection down the promise chain, and ignore the returned value.

Here's what this looks like:

```js
import tuxi from 'tuxi'
import api from './api'

const numbersTask = tuxi.task(api.echo) // echo resolves with what it's given after 5 seconds.

const aPromise = articlesTask('a')
const bPromise = articlesTask('b')

setTimeout(() => {
  console.log(numbersTask.value) // "b", since that was the most recent request
}, 6000)
aPromise.catch(err => console.log(err)) // "not newest task". Since the "a" task was overrridden by the "b" task, the "a" promise is rejected.
```

## Examples

### Basic

```js
import tuxi from 'tuxi'
import api from './api'

const articlesTask = tuxi.task(api.fetchArticles)

articlesTask().then(result => {
  console.log(articlesTask.hasValue) // true
  console.log(articlesTask.value) // ['New Planet Discovered!', '17 Surprising Superfoods!', ...]
  // could also console.log(result) to see the same thing
})
```

### Pending and spinning

```js
import tuxi from 'tuxi'
import api from './api'

const articlesTask = tuxi.task(api.fetchArticles, { spinnerDelay: 500 })

const articlesPromise = articlesTask()
console.log(articlesTask.pending) // true
console.log(articlesTask.spinning) // false, hasn't been 500ms yet

setTimeout(() => console.log(articlesTask.spinning), 510) // true, it's been more than 500ms. Pending will also still be true.

articlesPromise.then(() => {
  console.log(articlesTask.pending) // false
  console.log(articlesTask.spinning) // false
})
```

### Errors

```js
import tuxi from 'tuxi'

const failPromiseFn = () => new Promise((resolve, reject) => reject('Error :('))
const failTask = tuxi.task(failPromiseFn)
failTask().catch(() => {
  console.log(failTask.error) // "Error :("
  console.log(failTask.hasValue) // false
})
```

### Initial Value, Clear, and `isEmpty`

```js
import tuxi from 'tuxi'
import api from './api'

const articlesTask = tuxi.task(api.fetchArticles, {
  initialValue: ['Placeholder article'],
  fnIsEmpty: val => val.length === 0
})

console.log(articlesTask.value) // ['Placeholder article']
console.log(articlesTask.hasValue) // false
// This may seem unexpected, but hasValue is only true once a value is actually fetched. If you think this shouldn't be the case, feel free to create an issue.

articlesTask().then(() => {
  console.log(articlesTask.hasValue) // true
  console.log(articlesTask.value) // ['New Planet Discovered!', '17 Surprising Superfoods!', ...]

  articlesTask.clear()

  console.log(articlesTask.value) // ['Placeholder article']
  console.log(articlesTask.hasValue) // false
})
```

[Back to index](readme.md)