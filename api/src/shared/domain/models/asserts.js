export function assertNotNullOrUndefined(value, errorMessage = 'Ne doit pas être null ou undefined') {
  if (value === null || value === undefined) {
    throw new Error(errorMessage);
  }
}
