import helpers from './helpers'
import config from './config'
import { exec } from 'child_process'

// Can't just do m = config.mutate, because config.mutate could change
function m() {
  config.mutate(...arguments)
}

/**
 * Creates and returns a keyed async task, with start() and clear() methods,
 * along with other metadata about the task (See defaultState() for details).
 *
 * @param {function} fnApiCall Optionally accepts a payload parameter and returns a promise
 * @param {String} key Either key to use to check if payloads are equal, or a function that checks if payloads are equal
 *
 * @param {Object} taskConfig Settings for the keyed async task
 * @param {function} taskConfig.fnIsEmpty Optionally provide value to decide if result is "empty"
 * @param {*} taskConfig.initialValue Default value
 * @param {number} taskConfig.spinnerDelay Number of milliseconds to wait after the async task starts before setting `spinning` to true
 */
export default function keyedAsyncTask(fnApiCall, key, taskConfig = {}) {
  helpers.validate(key, ['string', 'function'], 'key')
  const { fnIsEmpty, initialValue, spinnerDelay } = helpers.processTaskConfig(
    fnApiCall,
    taskConfig
  )

  function fnKey(payload) {
    let keyedPayload =
      typeof key === 'string' ? payload && payload[key] : key(payload)

    if (keyedPayload != null) {
      return keyedPayload
    } else {
      throw new Error('Payload key is undefined or null')
    }
  }

  function genKeyedGetter(state, propName) {
    return payload => {
      const jobState = state.jobs[fnKey(payload)]
      return jobState && jobState[propName]
    }
  }

  function getters(state) {
    const getters = {}
    Object.keys(helpers.defaultState(initialValue)).forEach(
      stateKey => (getters[stateKey] = genKeyedGetter(state, stateKey))
    )
    return getters
  }

  function executionState(payload) {
    const taskPromise = fnApiCall(payload)
    if (helpers.isPromise(taskPromise)) {
      const payloadKey = fnKey(payload)

      const jobState = helpers.defaultState(initialValue)

      m(executionState.jobs, payloadKey, jobState)

      m(jobState, 'pending', true)

      setTimeout(() => {
        if (jobState.pending) {
          m(jobState, 'spinning', true)
        }
      }, spinnerDelay)

      return taskPromise
        .then(result => {
          fnIsEmpty(result)
            ? helpers.setEmpty(jobState)
            : helpers.setValue(jobState, result)
          return result
        })
        .catch(err => {
          helpers.setError(jobState, err)
          return Promise.reject(err)
        })
    }
  }
  executionState.clear = function(payload) {
    const jobState = executionState.jobs[fnKey(payload)]
    if (jobState) {
      helpers.batchedMutate(jobState, helpers.defaultState(initialValue))
    }
  }
  executionState.jobs = {}
  helpers.batchedMutate(executionState, getters(executionState))

  return executionState
}
