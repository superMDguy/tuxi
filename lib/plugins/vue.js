import Vue from 'vue'

export default function(store) {
  return {
    mutate(state, key, value) {
      const runMutation = () => {
        Vue.set(state, key, value)
      }

      if (store) {
        store._withCommit(runMutation)
      } else {
        runMutation()
      }
    }
  }
}
