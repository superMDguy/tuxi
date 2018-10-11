export default {
  mutate(state, key, value) {
    state[key] = value
  },

  defaults: {
    fnIsEmpty: result => false, // eslint-disable-line no-unused-vars
    initialValue: null,
    spinnerDelay: 1000
  }
}
