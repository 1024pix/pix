const CertificationIssueReport = require('../../../domain/models/CertificationIssueReport');

module.exports = {

  deserialize(request) {
    const certificationCourseId = parseInt(request.params.id);
    const attributes = request.payload.data.attributes;

    const result = new CertificationIssueReport({
      certificationCourseId,
      category: attributes.category,
      description: attributes.description,
    });

    return result;
  },
};
