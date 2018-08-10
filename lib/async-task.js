import helpers from './helpers'

/**
 * Creates and returns an async task, with start() and clear() methods,
 * along with other metadata about the task (See defaultState() for details).
 *
 * @param {Object} taskConfig Settings for the async task
 * @param {function} taskConfig.fnApiCall Optionally accepts a payload parameter and returns a promise
 * @param {function} taskConfig.fnIsEmpty Optionally provide value to decide if result is "empty"
 * @param {*} taskConfig.initialValue Default value
 * @param {number} taskConfig.spinnerDelay Number of milliseconds to wait after the async task starts before setting `spinning` to true
 */
export default function asyncTask(fnApiCall, taskConfig = {}) {
  const { fnIsEmpty, initialValue, spinnerDelay } = helpers.processTaskConfig(
    fnApiCall,
    taskConfig
  )

  const initState = helpers.defaultState(initialValue)
  const proxyState = helpers.generateProxyState(initState)

  initState.clear = () => {
    helpers.replaceState(proxyState, helpers.defaultState(initialValue))
  }

  const TASK_ERROR = 'not newest task'
  initState.start = function(payload) {
    const taskPromise = fnApiCall(payload)
    if (helpers.isPromise(taskPromise)) {
      const taskId = (proxyState.activeTaskId || 0) + 1
      proxyState.activeTaskId = taskId

      helpers.replaceState(proxyState, helpers.defaultState())
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
              ? helpers.setEmpty(proxyState)
              : helpers.setValue(proxyState, result)

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
            helpers.setError(proxyState, err)
          }

          return Promise.reject(err)
        })
    }
  }

  return initState
}
