<p align="center"><img src="https://raw.githubusercontent.com/superMDguy/tuxi/HEAD/tuxedo.svg?sanitize=true" height="200" /></p>

<p align="center">
  <a href="https://circleci.com/gh/superMDguy/tuxi/tree/master" target="_blank"><img src="https://circleci.com/gh/superMDguy/tuxi.svg?style=svg" alt="CircleCI"></a>
  <a href="https://codecov.io/github/superMDguy/tuxi?branch=master" target="_blank"><img src="https://img.shields.io/codecov/c/github/superMDguy/tuxi/master.svg?style=flat-square" alt="CodeCov"></a>
  <a href="https://www.npmjs.com/package/tuxi" target="_blank"><img src="https://img.shields.io/npm/v/tuxi.svg?style=flat-square" alt="NPM Version"></a>
  <a href="https://github.com/superMDguy/tuxi/blob/HEAD/LICENSE" target="_blank"><img src="https://img.shields.io/npm/l/all-contributors.svg?style=flat-square" alt="License"></a>
  <a href="http://makeapullrequest.com" target="_blank"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome"></a>
</p>

# Tuxi

_:sparkles: White glove service for your async needs_

Tuxi automatically manages the state of asynchronous tasks, so you don't have to. No more setting `isLoading` after every api request! :relieved:. For more details about the motivation for tuxi, check out this [article](https://hackernoon.com/a-solution-to-async-boilerplate-in-javascript-2fa717801c3b) I wrote.

## Installing

### NPM

```bash
npm install --save tuxi
```

### CDN

Tuxi can also be used directly in the browser through a babel-transpiled and minified build hosted on unpkg:

```html
<script src="https://unpkg.com/tuxi">
```

## Examples

For complete documentation, see the [docs](docs/readme.md) folder.

### Pure JavaScript

```js
import tuxi from 'tuxi'
import api from './api'

const articlesTask = tuxi.task(api.fetchArticles)

// ⚡ Fire the api call
articlesTask.start()

// The task is immediately set to pending
console.log(articlesTask.pending) // true

// 🌀 The spinning property has a configurable delay
setTimeout(() => console.log(articlesTask.spinning), 1500) // true

// After a while...
console.log(articlesTask.hasValue) // true
console.log(articlesTask.value) // ['New Planet Discovered!', '17 Surprising Superfoods!', ...]
```

## Vue

```html
<div class="wrapper">
  <div class="empty-message" v-if="articlesTask.empty">
    No articles
  </div>

  <div class="spinner" v-if="articlesTask.spinning">
    Loading articles...
  </div>

  <div class="error-message" v-if="articlesTask.error">
    {{ articlesTask.error.message }}
  </div>

  <ul v-if="articlesTask.hasValue">
    <li v-for="article in articles">
      {{ article.title }}
    </li>
  </ul>
</div>
```

```js
import tuxi from 'tuxi'
import tuxiVue from 'tuxi/plugins/vue'
import api from './api'

tuxi.use(tuxiVue())

export default {
  data() {
    return {
      articlesTask: tuxi.task(api.fetchArticles)
    }
  },

  computed: {
    articles() {
      return this.articlesTask.value
    }
  }
}
```

### Vuex

```js
import tuxi from 'tuxi'
import tuxiVue from 'tuxi/plugins/vue'
import Vuex from 'vuex'
import Vue from 'vue'
import api from './api'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    items: [],
    articlesTask: tuxi.task(api.fetchArticles)
  },

  mutations: {
    SET_ITEMS(state, items) {
      state.items = items
    }
  },

  actions: {
    async articles({ commit, state }) {
      const items = await state.articlesTask.start()
      commit('SET_ITEMS', items)
    }
  }
})

tuxi.use(tuxiVue(store))
// Now, you can access $store.state.articlesTask in your components!
```

### React/Redux

[todo](https://github.com/superMDguy/tuxi/issues/1)

## Contributing

Tuxi is currently in alpha, so any suggestions or contributions are appreciated. I'm still not 100% sure about the API, so comments on how to make it cleaner/simpler are welcome.

_Logo made by [freepik](https://www.flaticon.com/authors/freepik) from www.flaticon.com_
