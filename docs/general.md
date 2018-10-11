# Initializing a Task

Initializing a task is done by using either the `tuxi.task()` or `tuxi.keyed()` methods. Though they have slightly different behavior, they initially take essentially the same arguments. To learn about how to specifically initialize normal and keyed tasks, checkout the more detailed docs [here](task.md) and [here](keyed.md).

- `fnApiCall`: Anything that returns a promise. This is what gets called when you start the task. It can accept a single payload parameter, and this will get passed in when you start the task.
- `taskConfig`: Optional configuration object for the task.
  - `fnIsEmpty`: a function that takes in a result and decides if it's empty. For example, if your task is fetching a list, you'd probably set it to `result => result.length === 0`.
  - `initialValue`: the default value of the task. Normally, the value of the task will start out as `undefined`; setting this will make it start as something different.
  - `spinnerDelay`: number of milliseconds before a task becomes "spinning" after it's started. Normally used for delayed spinners.

# The Task Object

Both `tuxi.task()` and `tuxi.keyed()` provide a way to access a task object. Each task has several properties associated with it.

## Task Properties

| Property Name | Default Value | Description |
|:-------------:|:-------------------------------------:|:-----------------------------------------------------------------------------------------------------------------------:|
| `empty` | `false` | Whether the most recent value was "empty" (as defined by `fnIsEmpty`) |
| `error` | `false` | Whether there was an error thrown by the most recent async call (so the value is meaningless) |
| `hasValue` | `false` | Whether the most recent call was non-empty and didn't result in an error |
| `pending` | `false` | Whether an async call is currently in progress |
| `spinning` | `false` | Whether a spinner should be shown in the UI. This property is set to true `spinnerDelay`ms after the async call starts. |
| `value` | `undefined`, or provided `initialValue` | The most recent value returned from the async call |

## Task Methods

- `start`: Starts the async call set by `fnApiCall`. This can take a single payload parameter, which will be passed on to `fnApiCall`. It returns a promise, which resolves to the same value that `fnApiCall` resolves with, and will also pass on errors thrown by `fnApiCall`.
- `clear`: Clears the task state, so it's as if it just got initialized (so all properties are set to their default values).

[Back to index](readme.md)
