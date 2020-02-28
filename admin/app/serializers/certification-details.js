import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class CertificationDetails extends JSONAPISerializer {

  normalizeFindRecordResponse(store, primaryModelClass, payload, id) {
    if (!payload.data) {
      payload.data = {
        attributes: {
          competencesWithMark: payload.competencesWithMark,
          totalScore: payload.totalScore,
          percentageCorrectAnswers: payload.percentageCorrectAnswers,
          createdAt: payload.createdAt,
          userId: payload.userId,
          status: payload.status,
          completedAt: payload.completedAt,
          listChallengesAndAnswers: payload.listChallengesAndAnswers
        },
        type: 'certificationDetails'
      };
    }
    payload.data.id = id;
    return this.normalizeSingleResponse(...arguments);
  }

  keyForAttribute(key) {
    return key;
  }

  modelNameFromPayloadKey() {
    return 'certification-details';
  }
}
