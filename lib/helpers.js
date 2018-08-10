import isPromise from 'is-promise'
import config from './config'

export default {
  defaultState(initialValue = null) {
    let defaultState = {
      empty: false, // whether we got a value, but it was essentially empty
      error: false, // whether there was an error getting the value (and so the value is meaningless)
      hasValue: false, // whether we've gotten a value (non-empty, non-error) from the async call
      pending: false, // whether we're currently in an async call getting this
      spinning: false // whether the loading indicator should be visible in the UI
    }
    if (initialValue != null) {
      defaultState.value = initialValue
    }

    return defaultState
  },

  replaceState(state, newState) {
    Object.keys(newState).forEach(newStateKey => {
      state[newStateKey] = newState[newStateKey]
    })
  },

  endPending(state) {
    state.pending = false
    state.spinning = false
  },

  setEmpty(state) {
    this.endPending(state)
    state.empty = true
    state.error = false
    state.hasValue = false
  },

  setError(state, err) {
    this.endPending(state)
    state.empty = false
    state.error = err
    state.hasValue = false
  },

  setValue(state, payload) {
    this.endPending(state)
    state.empty = false
    state.error = false
    state.hasValue = true
    state.value = payload
  },

  /**
   * Generates a "proxy state". Used to work around vuex strict mode violations by applying changes to the proxy
   * state to the real state using a simulated vuex commit.
   */
  generateProxyState(realState) {
    const proxyState = {}
    Object.keys(realState).forEach(key =>
      Object.defineProperty(proxyState, key, {
        get() {
          return realState[key]
        },
        set(newVal) {
          config.store._withCommit(() => {
            realState[key] = newVal
          })
        }
      })
    )

    return proxyState
  },

  isPromise
}
