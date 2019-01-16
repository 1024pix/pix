module.exports = {

  save(request, h) {
    return true;
  },

  getById(request, h) {
    const certificationCenterId = request.params.id;
    return certificationCenterId;
  },


  find(request, h) {
    return [];
  },
}
