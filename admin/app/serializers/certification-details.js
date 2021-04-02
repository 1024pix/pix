import JSONAPISerializer from '@ember-data/serializer/json-api';
import { inject as service } from '@ember/service';

export default class CertificationDetails extends JSONAPISerializer {

  @service featureToggles;

  normalizeFindRecordResponse(store, primaryModelClass, payload, id) {
    if (!this.featureToggles.featureToggles.isNeutralizationAutoEnabled && !payload.data) {
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

  keyForAttribute(key) {
    if (!this.featureToggles.featureToggles.isNeutralizationAutoEnabled) {
      return key;
    }
    return super.keyForAttribute(...arguments);
  }

  modelNameFromPayloadKey() {
    return 'certification-details';
  }
}
