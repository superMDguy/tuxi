export default {
  asyncTimeout(length = 250, resolveWith = 'done') {
    return () => {
      return new Promise(resolve =>
        setTimeout(() => resolve(resolveWith), length)
      )
    }
  }
}
