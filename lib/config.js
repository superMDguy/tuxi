import Vue from 'vue' // optional

const config = {
  vue: Boolean(Vue),
  vuexStore: null,
  mutate(state, key, value) {
    if (config.vue) {
      const runMutation = () => {
        if (key in state) {
          state[key] = value
        } else {
          Vue.set(state, key, value)
        }
      }

      if (config.vuexStore) {
        config.vuexStore._withCommit(runMutation)
      } else {
        runMutation()
      }
    } else {
      state[key] = value
    }
  },
  defaults: {
    fnIsEmpty: result => false, // eslint-disable-line no-unused-vars
    initialValue: null,
    spinnerDelay: 1000
  }
}

export default config
