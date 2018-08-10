<p align="center"><img src="https://raw.githubusercontent.com/superMDguy/tuxi/HEAD/tuxedo.svg?sanitize=true" height="200" /></p>

<p align="center">
  <a href="https://circleci.com/gh/superMDguy/tuxi/tree/master"><img src="https://img.shields.io/circleci/project/superMDguy/tuxi/master.svg?style=flat-square" alt="CircleCI"></a>
  <a href="https://codecov.io/github/superMDguy/tuxi?branch=master"><img src="https://img.shields.io/codecov/c/github/superMDguy/tuxi/master.svg?style=flat-square" alt="CodeCov"></a>
  <a href="https://www.npmjs.com/package/@supermdguy/tuxi"><img src="https://img.shields.io/npm/v/@supermdguy/tuxi.svg?style=flat-square" alt="NPM Version"></a>
  <a href="https://github.com/superMDguy/tuxi/blob/HEAD/LICENSE"><img src="https://img.shields.io/npm/l/all-contributors.svg?style=flat-square" alt="License"></a>
  <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome"></a>
</p>

# Tuxi

_:money_with_wings: High class service for your async needs_

Tuxi automatically manages the state of asynchronous tasks, so you don't have to. No more setting `isLoading` after every api request!

## Install

```bash
npm install --save @supermdguy/tuxi
```

## Examples

### Pure JavaScript

```js
import tuxi from '@supermdguy/tuxi'
import { fetchItems } from './api'

const fetchItemsTask = tuxi.task({
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

### Vuex Integration

```js
import tuxi from '@supermdguy/tuxi'
import Vuex from 'vuex'
import { fetchItems } from './api'


const store = new Vuex.Store({
  state: {
    items: [],
    fetchItemsTask: tuxi.task({
      fnApiCall: fetchItems
    })
  },
  
  mutations: {
    SET_ITEMS(state, items) {
      state.items = items
    }
  },
  
  actions: {
    async fetchItems({ commit, state }) {
      const items = await state.fetchItemsTask.start()
      commit('SET_ITEMS', items)
    }
  }
})

tuxi.config.store = store

// Now, you can access $store.state.fetchItemsTask in your components!
```


## Contributing

Tuxi is currently in alpha, so any suggestions or contributions are appreciated. I'm still not 100% sure about the API, so comments on how to make it cleaner/simpler are welcome.

_Logo made by [freepik](https://www.flaticon.com/authors/freepik) from www.flaticon.com
