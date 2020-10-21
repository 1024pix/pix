const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serializeForPaginatedList(campaignParticipationResultSummaryPaginated) {
    const { campaignAssessmentParticipationSummaries, pagination } = campaignParticipationResultSummaryPaginated;
    return this.serialize(campaignAssessmentParticipationSummaries, pagination);
  },

  serialize(campaignAssessmentParticipationSummaries, meta) {
    return new Serializer('campaign-assessment-participation-summaries', {
      id: 'campaignParticipationId',
      attributes: [
        'firstName',
        'lastName',
        'participantExternalId',
        'status',
        'masteryPercentage',
        'badges',
      ],
      badges: {
        ref: 'id',
        included: true,
        attributes: ['title', 'altMessage', 'imageUrl'],
      },
      meta,
    }).serialize(campaignAssessmentParticipationSummaries);
  },
};
