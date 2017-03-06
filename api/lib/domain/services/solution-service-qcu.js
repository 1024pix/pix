
module.exports = {

  match (answer, solution) {

    if (answer === solution) {
      return 'ok';
    }
    return 'ko';
  }

};
