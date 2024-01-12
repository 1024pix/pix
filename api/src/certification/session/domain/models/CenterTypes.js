/**
 * Types of certification center
 * @readonly
 * @enum {string}
 */
const CENTER_TYPES = {
  SUP: 'SUP',
  SCO: 'SCO',
  PRO: 'PRO',
};

export const CenterTypes = Object.freeze({
  ...CENTER_TYPES,

  contains: (value) => {
    return Object.keys(CENTER_TYPES).some((key) => CENTER_TYPES[key] === value);
  },
});
