import tuxi from '../lib'

test('Has tuxi', () => {
  expect(tuxi).toEqual(expect.anything())
  expect(tuxi.task).toEqual(expect.anything())
})
