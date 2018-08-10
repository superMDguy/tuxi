import tuxi from '../lib'
import helpers from './helpers'

test('Tuxi imported correctly', () => {
  expect(tuxi).toEqual(expect.anything())
  expect(tuxi.task).toEqual(expect.anything())
  expect(tuxi.config).toEqual(expect.anything())
})

test('Initial value and clear', async () => {
  const task = tuxi.task({
    fnApiCall: helpers.asyncTimeout(),
    initialValue: 'tuxi'
  })

  expect(task.value).toBe('tuxi')
  await task.start()
  task.clear()
  expect(task.value).toBe('tuxi')
})

test('Pending', async () => {
  const task = tuxi.task({
    fnApiCall: helpers.asyncTimeout()
  })

  expect(task.pending).toBe(false)
  const taskDone = task.start()
  expect(task.pending).toBe(true)

  await taskDone
  expect(task.pending).toBe(false)
})

test('Spinner delay', async () => {
  const task = tuxi.task({
    fnApiCall: helpers.asyncTimeout(500),
    spinnerDelay: 250
  })

  const taskDone = task.start()

  setTimeout(() => {
    expect(task.spinning).toBe(true)
  }, 300)

  await taskDone
  expect(task.spinning).toBe(false)

  const longerTask = tuxi.task({
    fnApiCall: helpers.asyncTimeout(750),
    spinnerDelay: 500
  })

  const longerTaskDone = longerTask.start()

  setTimeout(() => {
    expect(longerTask.spinning).toBe(false)
  }, 350)
  setTimeout(() => {
    expect(longerTask.spinning).toBe(true)
  }, 550)

  await longerTaskDone
  expect(longerTask.spinning).toBe(false)
})

test('Error state', async () => {
  const ERROR_MESSAGE = 'async failure'
  const task = tuxi.task({
    fnApiCall: () => Promise.reject(new Error(ERROR_MESSAGE))
  })

  expect(task.error).toBe(false)
  try {
    await task.start()
  } catch (err) {
    expect(err.message).toBe(ERROR_MESSAGE)
    expect(task.error).toEqual(err)
    expect(task.error.message).toBe(ERROR_MESSAGE)
    expect(task.hasValue).toBe(false)
  }
})

test('Gets correct value', async () => {
  const RESULT = 'async result'

  const task = tuxi.task({
    fnApiCall: helpers.asyncTimeout(100, RESULT)
  })

  expect(task.hasValue).toBe(false)
  await task.start()
  expect(task.hasValue).toBe(true)
  expect(task.value).toBe(RESULT)
})

test('Prioritizes newest call', async () => {
  const task = tuxi.task({
    fnApiCall: helpers.asyncTimeout()
  })

  const taskPromise1 = task.start({
    overrideTimeout: 500,
    overrideResolveWith: '1'
  })
  task.start({
    overrideTimeout: 100,
    overrideResolveWith: '2'
  })

  expect.assertions(3)
  try {
    await taskPromise1
  } catch (err) {
    expect(task.error).toBe(false)
    expect(task.hasValue).toBe(true)
    expect(task.value).toBe('2')
  }
})

test('Custom empty state', async () => {
  const EMPTY_VAL = 'empty'

  const task = tuxi.task({
    fnApiCall: helpers.asyncTimeout(100, EMPTY_VAL),
    fnIsEmpty: val => val === EMPTY_VAL
  })

  expect(task.empty).toBe(false)

  await task.start()

  expect(task.empty).toBe(true)
  expect(task.hasValue).toBe(false)
})
