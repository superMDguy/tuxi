# Configuring Tuxi

Tuxi can be configured with default values for `fnIsEmpty`, `initialValue`, and `spinnerDelay` (see [general](general.md) for details on each of these properties). To change a property, just change its value in `tuxi.config.defaults`. For example, `tuxi.config.defaults.spinnerDelay = 5000` would set the default spinner delay to 5000ms.

There's also a configurable `mutate` method, but you probably don't need to wory about that unless you're writing a [plugin](plugins.md).

[Back to index](readme.md)
