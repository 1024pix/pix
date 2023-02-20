import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(certificationIssueReports) {
    return new Serializer('certification-issue-report', {
      attributes: ['category', 'description', 'subcategory', 'questionNumber'],
      transform: function (certificationIssueReport) {
        return Object.assign({}, certificationIssueReport);
      },
    }).serialize(certificationIssueReports);
  },

  deserialize(request) {
    const certificationCourseId = parseInt(request.params.id);
    const attributes = request.payload.data.attributes;

    return {
      certificationCourseId,
      category: attributes.category,
      description: attributes.description,
      subcategory: attributes.subcategory,
      questionNumber: attributes['question-number'],
    };
  },
};
