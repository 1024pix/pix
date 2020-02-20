import Service from '@ember/service';

export default Service.extend({

  sanitize(data) {
    const specialCharacters = ['@', '-', '+', '='];
    let result = data;

    if (typeof result === 'string' && specialCharacters.includes(result[0])) {
      result = '\'' + result;
    }

    return result;
  }
});
