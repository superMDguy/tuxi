export default {
  asyncTimeout(timeout = 250, resolveWith) {
    return ({ overrrideTimeout, overrideResolveWith } = {}) => {
      return new Promise(resolve =>
        setTimeout(
          () => resolve(overrideResolveWith || resolveWith),
          overrrideTimeout || timeout
        )
      )
    }
  }
}
