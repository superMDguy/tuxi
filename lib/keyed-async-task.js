import helpers from './helpers'
import Vue from 'vue'
import config from './config'
import ow from 'ow'

/**
 * Creates and returns a keyed async task, with start() and clear() methods,
 * along with other metadata about the task (See defaultState() for details).
 *
 * @param {String} key Either key to use to check if payloads are equal, or a function that checks if payloads are equal
 *
 * @param {Object} taskConfig Settings for the keyed async task
 * @param {function} taskConfig.fnApiCall Optionally accepts a payload parameter and returns a promise
 * @param {function} taskConfig.fnIsEmpty Optionally provide value to decide if result is "empty"
 * @param {*} taskConfig.initialValue Default value
 * @param {number} taskConfig.spinnerDelay Number of milliseconds to wait after the async task starts before setting `spinning` to true
 */
export default function keyedAsyncTask(key, taskConfig) {
  ow(key, ow.any(ow.string.label('key').nonEmpty, ow.function.label('key')))
  const {
    fnApiCall,
    fnIsEmpty,
    initialValue,
    spinnerDelay
  } = helpers.processTaskConfig(taskConfig)

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

  const state = {
    jobs: {},
    start(payload) {
      const taskPromise = fnApiCall(payload)
      if (helpers.isPromise(taskPromise)) {
        const payloadKey = fnKey(payload)

        const jobState = helpers.defaultState(initialValue)
        const proxyJobState = helpers.generateProxyState(jobState)
        Object.defineProperty(jobState, '_proxy', {
          enumerable: false, // Makes vuex ignore the proxy state, so it's not reactive and is immune to strict warnings
          value: proxyJobState
        })

        config.store._withCommit(() => Vue.set(this.jobs, payloadKey, jobState))

        proxyJobState.pending = true

        setTimeout(() => {
          if (proxyJobState.pending) {
            proxyJobState.spinning = true
          }
        }, spinnerDelay)

        return taskPromise
          .then(result => {
            fnIsEmpty(result)
              ? helpers.setEmpty(proxyJobState)
              : helpers.setValue(proxyJobState, result)
            return result
          })
          .catch(err => {
            helpers.setError(proxyJobState, err)
            return Promise.reject(err)
          })
      }
    },
    clear(payload) {
      const jobState = state.jobs[fnKey(payload)]
      if (jobState) {
        helpers.replaceState(
          jobState._proxy,
          helpers.defaultState(initialValue)
        )
      }
    }
  }

  return Object.assign(state, getters(state))
}
