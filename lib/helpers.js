import ow from 'ow'
import isPromise from 'is-promise'
import config from './config'

export default {
  processTaskConfig(
    fnApiCall,
    {
      fnIsEmpty = result => false, // eslint-disable-line no-unused-vars
      initialValue = null,
      spinnerDelay = 1000
    }
  ) {
    ow(fnApiCall, ow.function.label('fnApiCall'))
    ow(fnIsEmpty, ow.function.label('fnIsEmpty'))
    ow(spinnerDelay, ow.number.label('spinnerDelay').integer)

    return { fnApiCall, fnIsEmpty, initialValue, spinnerDelay }
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
