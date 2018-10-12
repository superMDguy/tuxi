import Vue from 'vue'

export default function(store) {
  return {
    mutate(state, key, value) {
      const runMutation = () => {
        if (key in state) {
          state[key] = value
        } else {
          Vue.set(state, key, value)
        }
      }

      if (store) {
        store._withCommit(runMutation)
      } else {
        runMutation()
      }
    }
  }
}
