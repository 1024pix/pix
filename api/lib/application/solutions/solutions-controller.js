function _validateQueryParams(query) {
  return new Promise((resolve, reject) => {
    if (typeof query.assessmentId === 'undefined')
      reject();
    if (typeof query.answerId === 'undefined')
      reject();
    resolve();
  });
}

module.exports = {
  find(request, reply) {
    return _validateQueryParams(request.query)
      .then(() => {
        reply().code(200);
      })
      .catch(() => {
        reply().code(400);
      });
  }
};
