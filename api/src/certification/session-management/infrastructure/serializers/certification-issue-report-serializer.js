import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

export function serialize(certificationIssueReports) {
  return new Serializer('certification-issue-report', {
    attributes: ['category', 'description', 'subcategory', 'questionNumber'],
    transform: function (certificationIssueReport) {
      return Object.assign({}, certificationIssueReport);
    },
  }).serialize(certificationIssueReports);
}

export function deserialize(request) {
  const certificationCourseId = parseInt(request.params.certificationCourseId);
  const attributes = request.payload.data.attributes;

  return {
    certificationCourseId,
    category: attributes.category,
    description: attributes.description,
    subcategory: attributes.subcategory,
    questionNumber: attributes['question-number'],
  };
}
