import { DomainError } from '../errors.js';

export function assertNotNullOrUndefined(value, errorMessage = 'Ne doit pas être null ou undefined') {
  if (value === null || value === undefined) {
    throw new DomainError(errorMessage);
  }
}

export function assertEnumValue(enumObject, value, errorMessage = 'Illegal enum value provided') {
  const isValidEnumValue = Object.keys(enumObject).some((key) => enumObject[key] === value);
  if (!isValidEnumValue) {
    throw new TypeError(errorMessage);
  }
}

export function assertInstanceOf(value, clazz) {
  if (!value || !(value instanceof clazz)) {
    throw new TypeError('Illegal value provided');
  }
}

export function assertHasUuidLength(value, errorMessage = 'Uuid value must be exactly 36 characters long') {
  if (value.length !== 36) {
    throw new DomainError(errorMessage);
  }
}

export function assertPositiveInteger(value, errorMessage = 'value must be a positive integer') {
  if (!Number.isInteger(value) || value < 1) {
    throw new DomainError(errorMessage);
  }
}

export function assertGreaterOrEqualToZero(value, errorMessage = 'value must be greater or equal to 0') {
  if (!Number.isInteger(value) || value < 0) {
    throw new DomainError(errorMessage);
  }
}
