import { service } from '@ember/service';
import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class CertificationDetails extends JSONAPISerializer {
  @service featureToggles;

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
          listChallengesAndAnswers: payload.listChallengesAndAnswers,
        },
        type: 'certificationDetails',
      };
      payload.data.id = id;
    }
    return this.normalizeSingleResponse(...arguments);
  }

  modelNameFromPayloadKey() {
    return 'certification-details';
  }
}
