# Plugins

Tuxi's plugin system works through the `tuxi.use(tuxiConfig)` method. The provided `tuxiConfig` is merged into tuxi's internal config like this: `Object.assign(internalConfig, tuxiConfig)`. Most plugins will be changing the `mutate` method in some way, but you could also change other things in the [config](config.md).

## What is `mutate`?

Tuxi plugins typically solve some sort of problem related to state management. For example, the [Vue plugin](vue.md) makes changes in tuxi states compatible with Vue's reactivity system. The configurable `mutate` method is called internally whenever anything in tuxi's state is changed. For example, when the async task resolves, `mutate` is called to set the `pending` flag to false.

## Arguments

`mutate(state, key, value)`. By default, all it does is run `state[key] = value`. Most plugins will have additional logic to do things like trigger change detection or register changes to an application store.

[Back to index](readme.md)
