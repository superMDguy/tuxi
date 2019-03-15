import Vuex from 'vuex'
import Vue from 'vue'
import tuxi from '../lib'
import tuxiVue from '../lib/plugins/vue'
import helpers from './helpers'

Vue.use(Vuex)
const store = new Vuex.Store({
  strict: true,

  state: {
    result: null,
    getAsyncResultTask: tuxi.task(helpers.asyncTimeout(500, 'result'), {
      spinnerDelay: 250
    })
  },

  mutations: {
    SET_RESULT(state, result) {
      state.result = result
    }
  },

  actions: {
    async getAsyncResult({ commit, state }) {
      const result = await state.getAsyncResultTask()
      commit('SET_RESULT', result)
    }
  }
})

tuxi.use(tuxiVue(store))
const task = store.state.getAsyncResultTask

test('Spinner delay', async () => {
  const taskPromise = task()

  setTimeout(() => {
    expect(task.spinning).toBe(true)
  }, 300)

  await taskPromise
  expect(task.spinning).toBe(false)
})
