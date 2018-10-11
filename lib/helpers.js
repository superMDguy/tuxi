import isPromise from 'is-promise'
import config from './config'

export default {
  validate(thing, types, label) {
    if (!Array.isArray(types)) {
      types = [types]
    }

    for (let type of types) {
      if (typeof thing === type) return
    }

    throw `${label} expected to be of type ${types}, found ${typeof thing}`
  },

  processTaskConfig(fnApiCall, taskConfig) {
    taskConfig = Object.assign(config.defaults, taskConfig)

    this.validate(fnApiCall, 'function', 'fnApiCall')
    this.validate(taskConfig.fnIsEmpty, 'function', 'fnIsEmpty')
    this.validate(taskConfig.spinnerDelay, 'number', 'spinnerDelay')

    return taskConfig
  },

  defaultState(initialValue) {
    let defaultState = {
      empty: false, // whether we got a value, but it was essentially empty
      error: false, // whether there was an error getting the value (and so the value is meaningless)
      hasValue: false, // whether we've gotten a value (non-empty, non-error) from the async call
      pending: false, // whether we're currently in an async call getting this
      spinning: false // whether the loading indicator should be visible in the UI
    }
    if (typeof initialValue !== 'undefined') {
      defaultState.value = initialValue
    }

    return defaultState
  },

  endPending(state) {
    this.batchedMutate(state, {
      pending: false,
      spinning: false
    })
  },

  setEmpty(state) {
    this.endPending(state)
    this.batchedMutate(state, {
      empty: true,
      error: false,
      hasValue: false
    })
  },

  setError(state, err) {
    this.endPending(state)
    this.batchedMutate(state, {
      empty: false,
      error: err,
      hasValue: false
    })
  },

  setValue(state, payload) {
    this.endPending(state)
    this.batchedMutate(state, {
      empty: false,
      error: false,
      hasValue: true,
      value: payload
    })
  },

  isPromise,

  batchedMutate(state, mutations) {
    Object.keys(mutations).forEach(key => {
      config.mutate(state, key, mutations[key])
    })
  }
}
