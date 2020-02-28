module.exports = {

  sanitize(data) {
    const specialCharacters = ['@', '-', '+', '='];
    let result = data;

    if (typeof result === 'string' && specialCharacters.includes(result[0])) {
      result = '\'' + result;
    }

    return result;
  },

  sanitizeProperties({ objectToSanitize, propertiesToSanitize }) {
    const sanitizedObject = Object.assign({}, objectToSanitize);
    propertiesToSanitize.forEach((property) => {
      if (property in sanitizedObject) {
        sanitizedObject[property] = this.sanitize(sanitizedObject[property]);
      }
    });
    return sanitizedObject;
  }

};
