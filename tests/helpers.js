export default {
  asyncTimeout(timeout = 50, resolveWith) {
    return ({ overrrideTimeout, overrideResolveWith } = {}) => {
      return new Promise(resolve =>
        setTimeout(
          () => resolve(overrideResolveWith || resolveWith),
          overrrideTimeout || timeout
        )
      )
    }
  },

  stringify: x => JSON.stringify(x)
}
