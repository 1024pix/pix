import _ from 'lodash'

export function register<R>(registry: R) {
  return {
    pick<T extends keyof R>(...names: T[]): Pick<R, T> {
      return _.pick(registry, names) as Pick<R, T>
    }
  }
}
