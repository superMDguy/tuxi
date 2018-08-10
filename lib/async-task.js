import Vue from 'vue'
import isPromise from 'is-promise'

export const config = {
  store: {
    _withCommit(cb) {
      cb()
    }
  }
}

function defaultState(initialValue = null) {
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
}

function replaceState(state, newState) {
  Object.keys(newState).forEach(newStateKey => {
    state[newStateKey] = newState[newStateKey]
  })
}

function endPending(state) {
  state.pending = false
  state.spinning = false
}

function setEmpty(state) {
  endPending(state)
  state.empty = true
  state.error = false
  state.hasValue = false
}

function setError(state, err) {
  endPending(state)
  state.empty = false
  state.error = err
  state.hasValue = false
}

function setValue(state, payload) {
  endPending(state)
  state.empty = false
  state.error = false
  state.hasValue = true
  state.value = payload
}

/**
 * Generates a "proxy state". Used to work around vuex strict mode violations by applying changes to the proxy
 * state to the real state using a simulated vuex commit.
 */
function generateProxyState(realState) {
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
}

/**
 * Creates and returns an async task, with start() and clear() methods,
 * along with other metadata about the task (See defaultState() for details).
 *
 * @param {Object} config Settings for the async task
 * @param {function} config.fnApiCall Optionally accepts a payload parameter and returns a promise
 * @param {function} config.fnIsEmpty Optionally provide value to decide if result is "empty"
 * @param {*} config.initialValue Default value
 * @param {number} config.spinnerDelay Number of milliseconds to wait after the async task starts before setting `spinning` to true
 */
export function asyncTask({
  fnApiCall,
  fnIsEmpty = result => false, // eslint-disable-line no-unused-vars
  initialValue = null,
  spinnerDelay = 1000
}) {
  if (typeof fnApiCall !== 'function')
    throw new TypeError('Must pass functon: fnApiCall')
  if (typeof fnIsEmpty !== 'function')
    throw new TypeError('Must be a function: fnIsEmpty')
  if (!Number.isInteger(spinnerDelay))
    throw new TypeError('Must pass number: spinnerDelay')

  const initState = defaultState(initialValue)
  const proxyState = generateProxyState(initState)

  initState.clear = () => {
    replaceState(proxyState, defaultState(initialValue))
  }

  const TASK_ERROR = 'not newest task'
  initState.start = function(payload) {
    const taskPromise = fnApiCall(payload)
    if (isPromise(taskPromise)) {
      const taskId = (proxyState.activeTaskId || 0) + 1
      proxyState.activeTaskId = taskId

      replaceState(proxyState, defaultState())
      proxyState.pending = true

      setTimeout(() => {
        if (proxyState.activeTaskId === taskId && proxyState.pending) {
          proxyState.spinning = true
        }
      }, spinnerDelay)

      return taskPromise
        .then(result => {
          if (proxyState.activeTaskId === taskId) {
            fnIsEmpty(result)
              ? setEmpty(proxyState)
              : setValue(proxyState, result)

            return result
          } else {
            return Promise.reject(TASK_ERROR)
          }
        })
        .catch(err => {
          if (err === TASK_ERROR) {
            return Promise.reject(TASK_ERROR) // pass up the chain so no .then gets called
          }

          if (proxyState.activeTaskId === taskId) {
            setError(proxyState, err)
          }

          return Promise.reject(err)
        })
    }
  }

  return initState
}

/**
 * Creates and returns an async task, with start() and clear() methods,
 * along with other metadata about the task (See defaultState() for details).
 *
 * @param {String} key Either key to use to check if payloads are equal, or a function that checks if payloads are equal
 *
 * @param {Object} config Settings for the keyed async task
 * @param {function} config.fnApiCall Optionally accepts a payload parameter and returns a promise
 * @param {function} config.fnIsEmpty Optionally provide value to decide if result is "empty"
 * @param {*} config.initialValue Default value
 * @param {number} config.spinnerDelay Number of milliseconds to wait after the async task starts before setting `spinning` to true
 */
export function keyedAsyncTask(
  key, //
  {
    fnApiCall,
    fnIsEmpty = result => false, // eslint-disable-line no-unused-vars
    initialValue = null,
    spinnerDelay = 1000
  }
) {
  if (typeof fnApiCall !== 'function')
    throw new TypeError('Must pass functon: fnApiCall')
  if (typeof fnIsEmpty !== 'function')
    throw new TypeError('Must be a function: fnIsEmpty')
  if (!Number.isInteger(spinnerDelay))
    throw new TypeError('Must pass number: spinnerDelay')
  if (typeof key !== 'string' && typeof key !== 'function') {
    throw new TypeError('Must pass either string or function: key')
  }

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
    Object.keys(defaultState(initialValue)).forEach(
      stateKey => (getters[stateKey] = genKeyedGetter(state, stateKey))
    )
    return getters
  }

  const state = {
    jobs: {},
    start(payload) {
      const taskPromise = fnApiCall(payload)
      if (isPromise(taskPromise)) {
        const payloadKey = fnKey(payload)

        const jobState = defaultState(initialValue)
        const proxyJobState = generateProxyState(jobState)
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
              ? setEmpty(proxyJobState)
              : setValue(proxyJobState, result)
            return result
          })
          .catch(err => {
            setError(proxyJobState, err)
            return Promise.reject(err)
          })
      }
    },
    clear(payload) {
      const jobState = state.jobs[fnKey(payload)]
      if (jobState) {
        replaceState(jobState._proxy, defaultState(initialValue))
      }
    }
  }

  return Object.assign(state, getters(state))
}
