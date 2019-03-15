# Vue

When using Vue with tuxi, some issues can crop up related to [reactivity system](https://vuejs.org/v2/guide/reactivity.html). Additionally, if you're storing tuxi task states in Vuex, there can be [strict mode violations](https://vuex.vuejs.org/guide/strict.html). Using tuxi's Vue plugin solves both of these issues.

## Examples

### Vue

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

  <button @click="articlesTask()">Load Articles</button>
</div>
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
      const items = await state.articlesTask()
      commit('SET_ITEMS', items)
    }
  }
})

tuxi.use(tuxiVue(store))
// Now you can access $store.state.articlesTask in your components
```

## From CDN

```html
<script src="https://unpkg.com/vue"/>
<script src="https://unpkg.com/tuxi"/>
<script src="https://unpkg.com/tuxi/plugins/vue"/>

<script>
    tuxi.use(tuxiVue)
    // Now you can use tuxi states in your Vue data
</script>
```

[Back to index](readme.md)
