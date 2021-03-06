import asyncTask from './async-task'
import keyedAsyncTask from './keyed-async-task'
import config from './config'

export default {
  task: asyncTask,
  keyed: keyedAsyncTask,
  use(newConfig) {
    Object.assign(config, newConfig)
  },
  config
}
