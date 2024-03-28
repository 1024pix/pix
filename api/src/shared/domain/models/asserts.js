export function assertNotNullOrUndefined(value, errorMessage = 'Ne doit pas être null ou undefined') {
  if (value === null || value === undefined) {
    throw new Error(errorMessage);
  }
}

export function assertEnumValue(enumObject, value) {
  const isValidEnumValue = Object.keys(enumObject).some((key) => enumObject[key] === value);
  if (!isValidEnumValue) {
    throw new TypeError('Illegal enum value provided');
  }
}

export function assertInstanceOf(value, clazz) {
  if (!value || !(value instanceof clazz)) {
    throw new TypeError('Illegal value provided');
  }
}
