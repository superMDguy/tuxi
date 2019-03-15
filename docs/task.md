# `tuxi.task(fnApiCall, taskConfig)`

_See [general](general.md) for details about the arguments. `tuxi.task()` returns a task object, which is also decribed in [general](general.md)._

The main special thing about `tuxi.task()` is how it deals with requests that occur while another one is in progress. When the older promise resolves, tuxi will pass a rejection down the promise chain, and ignore the returned value.

Here's what this looks like:

```js
import tuxi from 'tuxi'
import api from './api'

const numbers = tuxi.task(api.echo) // echo resolves with what it's given after 5 seconds.

const aPromise = articles('a')
const bPromise = articles('b')

setTimeout(() => {
  console.log(numbers.value) // "b", since that was the most recent request
}, 6000)
aPromise.catch(err => console.log(err)) // "not newest task". Since the "a" task was overrridden by the "b" task, the "a" promise is rejected.
```

## Examples

### Basic

```js
import tuxi from 'tuxi'
import api from './api'

const articles = tuxi.task(api.fetchArticles)

articles().then(result => {
  console.log(articles.hasValue) // true
  console.log(articles.value) // ['New Planet Discovered!', '17 Surprising Superfoods!', ...]
  // could also console.log(result) to see the same thing
})
```

### Pending and spinning

```js
import tuxi from 'tuxi'
import api from './api'

const articles = tuxi.task(api.fetchArticles, { spinnerDelay: 500 })

const articlesPromise = articles()
console.log(articles.pending) // true
console.log(articles.spinning) // false, hasn't been 500ms yet

setTimeout(() => console.log(articles.spinning), 510) // true, it's been more than 500ms. Pending will also still be true.

articlesPromise.then(() => {
  console.log(articles.pending) // false
  console.log(articles.spinning) // false
})
```

### Errors

```js
import tuxi from 'tuxi'

const failPromiseFn = () => new Promise((resolve, reject) => reject('Error :('))
const fail = tuxi.task(failPromiseFn)
fail().catch(() => {
  console.log(fail.error) // "Error :("
  console.log(fail.hasValue) // false
})
```

### Initial Value, Clear, and `isEmpty`

```js
import tuxi from 'tuxi'
import api from './api'

const articles = tuxi.task(api.fetchArticles, {
  initialValue: ['Placeholder article'],
  fnIsEmpty: val => val.length === 0
})

console.log(articles.value) // ['Placeholder article']
console.log(articles.hasValue) // false
// This may seem unexpected, but hasValue is only true once a value is actually fetched. If you think this shouldn't be the case, feel free to create an issue.

articles().then(() => {
  console.log(articles.hasValue) // true
  console.log(articles.value) // ['New Planet Discovered!', '17 Surprising Superfoods!', ...]

  articles.clear()

  console.log(articles.value) // ['Placeholder article']
  console.log(articles.hasValue) // false
})
```

[Back to index](readme.md)