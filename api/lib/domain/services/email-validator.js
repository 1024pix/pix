module.exports = {

  emailIsValid(email) {
    if (!email) {
      return false;
    }
    //XXX: Cf - http://stackoverflow.com/a/46181/5430854
    // eslint-disable-next-line no-useless-escape
    const pattern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    return pattern.test(email.trim());
  },
};
