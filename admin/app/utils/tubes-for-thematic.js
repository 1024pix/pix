/**
 * Returns a thematic's tubes as a synchronous array.
 *
 * A thematic can reach these components either as an Ember Data record — where
 * `tubes` is an async relationship and only `hasMany('tubes').value()` gives a
 * synchronous array — or as a plain object built from a target profile snapshot,
 * where `tubes` is already an array.
 */
export default function tubesForThematic(thematic) {
  if (typeof thematic.hasMany === 'function') {
    return thematic.hasMany('tubes').value() ?? [];
  }

  return thematic.tubes ?? [];
}
