export default {
  emailIsValid(email) {
    if (!email) {
      return false;
    }
    // Source: http://stackoverflow.com/a/46181/5430854
    const pattern =
      /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;

    return pattern.test(email.trim());
  },
};
