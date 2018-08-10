import tuxi from '../lib'
import helpers from './helpers'

const payload = { name: 'bob' }

test('Supports string for key', async () => {
  const RESULT = 'async result'
  const task = tuxi.keyed(helpers.asyncTimeout(50, RESULT), 'name')
  await task.start(payload)
  expect(task.hasValue(payload)).toEqual(true)
  expect(task.value(payload)).toEqual(RESULT)
})

test('Supports function for key', async () => {
  const RESULT = 'async result'
  const task = tuxi.keyed(helpers.asyncTimeout(50, RESULT), helpers.stringify)
  await task.start(payload)
  expect(task.hasValue(payload)).toEqual(true)
  expect(task.value(payload)).toEqual(RESULT)
})

test('Initial value and clear', async () => {
  const task = tuxi.keyed(helpers.asyncTimeout(), 'name', {
    initialValue: 'tuxi'
  })

  const taskPromise = task.start(payload)
  expect(task.value(payload)).toBe('tuxi')
  await taskPromise
  task.clear(payload)
  expect(task.value(payload)).toBe('tuxi')
})

test('Pending', async () => {
  const task = tuxi.keyed(helpers.asyncTimeout(), 'name')
  const taskPromise = task.start(payload)
  expect(task.pending(payload)).toBe(true)
  await taskPromise
  expect(task.pending(payload)).toBe(false)
})

test('Spinner delay', async () => {
  const task = tuxi.keyed(helpers.asyncTimeout(500), 'name', {
    spinnerDelay: 250
  })

  const taskPromise = task.start(payload)

  setTimeout(() => {
    expect(task.spinning(payload)).toBe(true)
  }, 300)

  await taskPromise
  expect(task.spinning(payload)).toBe(false)
})

test('Error if key is not defined', () => {
  const task = tuxi.keyed(helpers.asyncTimeout(500), 'name')

  expect.assertions(1)
  try {
    task.start({})
  } catch (err) {
    expect(err).toBeDefined()
  }
})

test('Error state', async () => {
  const ERROR_MESSAGE = 'async failure'
  const task = tuxi.keyed(
    () => Promise.reject(new Error(ERROR_MESSAGE)),
    'name'
  )

  try {
    await task.start(payload)
  } catch (err) {
    expect(err.message).toBe(ERROR_MESSAGE)
    expect(task.error(payload)).toEqual(err)
    expect(task.error(payload).message).toBe(ERROR_MESSAGE)
    expect(task.hasValue(payload)).toBe(false)
  }
})

test('Custom empty state', async () => {
  const EMPTY_VAL = 'empty'

  const task = tuxi.keyed(helpers.asyncTimeout(100, EMPTY_VAL), 'name', {
    fnIsEmpty: val => val === EMPTY_VAL
  })

  await task.start(payload)

  expect(task.empty(payload)).toBe(true)
  expect(task.hasValue(payload)).toBe(false)
})
