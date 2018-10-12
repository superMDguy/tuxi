import helpers from './helpers'
import config from './config'

// Can't just do m = config.mutate, because config.mutate could change
function m() {
  config.mutate(...arguments)
}

/**
 * Creates and returns an async task, with start() and clear() methods,
 * along with other metadata about the task (See defaultState() for details).
 *
 * @param {function} fnApiCall Optionally accepts a payload parameter and returns a promise
 *
 * @param {Object} taskConfig Settings for the async task
 * @param {function} taskConfig.fnIsEmpty Optionally provide value to decide if result is "empty"
 * @param {*} taskConfig.initialValue Default value
 * @param {number} taskConfig.spinnerDelay Number of milliseconds to wait after the async task starts before setting `spinning` to true
 */
export default function asyncTask(fnApiCall, taskConfig = {}) {
  const { fnIsEmpty, initialValue, spinnerDelay } = helpers.processTaskConfig(
    fnApiCall,
    taskConfig
  )

  const TASK_ERROR = 'not newest task'
  return {
    ...helpers.defaultState(initialValue),

    clear() {
      helpers.batchedMutate(this, helpers.defaultState(initialValue))
    },

    start(payload) {
      const taskPromise = fnApiCall(payload)
      if (helpers.isPromise(taskPromise)) {
        const taskId = (this.activeTaskId || 0) + 1
        m(this, 'activeTaskId', taskId)

        helpers.batchedMutate(this, helpers.defaultState())
        m(this, 'pending', true)

        setTimeout(() => {
          if (this.activeTaskId === taskId && this.pending) {
            m(this, 'spinning', true)
          }
        }, spinnerDelay)

        return taskPromise
          .then(result => {
            if (this.activeTaskId === taskId) {
              fnIsEmpty(result)
                ? helpers.setEmpty(this)
                : helpers.setValue(this, result)

              return result
            } else {
              return Promise.reject(TASK_ERROR)
            }
          })
          .catch(err => {
            if (err === TASK_ERROR) {
              return Promise.reject(TASK_ERROR) // pass up the chain so no .then gets called
            }

            if (this.activeTaskId === taskId) {
              helpers.setError(this, err)
            }

            return Promise.reject(err)
          })
      }
    }
  }
}
