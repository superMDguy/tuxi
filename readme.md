<img src="https://raw.githubusercontent.com/superMDguy/tuxi/HEAD/tuxedo.svg?sanitize=true" height="200" />

# Tuxi

:sparkles: Automatically manage state of asynchronous tasks.

## Install

```bash
npm install --save @supermdguy/tuxi
```

## Example

```js
import { asyncTask } from 'tuxi'
import { fetchItems } from './api'

const fetchItemsTask = asyncTask({
  fnApiCall: fetchItems
})

// ⚡ Fire the api call
fetchItemsTask.start()

// The task is immediately set to pending
console.log(fetchItemsTask.pending) // true

// 🌀 The spinning property has a configurable delay
setTimeout(() => console.log(fetchItemsTask.spinning), 1500) // true

// After a while...
console.log(fetchItemsTask.hasValue) // true
```

## Contributing

Tuxi is currently in alpha, so any suggestions or contributions are appreciated. I'm still not 100% sure about the API, so comments on how to make it cleaner/simpler are welcome.

## License: MIT

This project is licensed under the MIT License - see the [LICENSE file](https://github.com/superMDguy/tuxi/blob/HEAD/LICENSE) for details

_Icon made by [freepik](https://www.flaticon.com/authors/freepik) from www.flaticon.com_
