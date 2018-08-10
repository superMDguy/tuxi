import tuxi from '../lib'
import helpers from './helpers'

test('Tuxi imported correctly', () => {
  expect(tuxi).toEqual(expect.anything())
  expect(tuxi.task).toEqual(expect.anything())
  expect(tuxi.config).toEqual(expect.anything())
})

test('Initial value', () => {
  const task = tuxi.task({
    fnApiCall: helpers.asyncTimeout,
    initialValue: 'tuxi'
  })

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
