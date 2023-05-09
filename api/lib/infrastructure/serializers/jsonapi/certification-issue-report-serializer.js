import { Serializer } from 'jsonapi-serializer';

const serialize = function (certificationIssueReports) {
  return new Serializer('certification-issue-report', {
    attributes: ['category', 'description', 'subcategory', 'questionNumber'],
    transform: function (certificationIssueReport) {
      return Object.assign({}, certificationIssueReport);
    },
  }).serialize(certificationIssueReports);
};

const deserialize = function (request) {
  const certificationCourseId = parseInt(request.params.id);
  const attributes = request.payload.data.attributes;

  return {
    certificationCourseId,
    category: attributes.category,
    description: attributes.description,
    subcategory: attributes.subcategory,
    questionNumber: attributes['question-number'],
  };
};

export { serialize, deserialize };
