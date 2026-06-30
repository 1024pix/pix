import { anonymisedCampaignAssessmentSerializer } from '../../../../../../../src/prescription/campaign-participation/infrastructure/serializers/jsonapi/anonymised-campaign-assessment-serializer.js';
import { Assessment } from '../../../../../../../src/shared/domain/models/Assessment.js';
import { expect } from '../../../../../../test-helper.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Serializer | JSONAPI | anonymised-campaign-assessment-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a DetachAssessment model object into JSON API data', function () {
      // given
      const assessment = domainBuilder.buildAssessment({
        id: 123,
        updatedAt: new Date('2020-10-10'),
        state: Assessment.states.STARTED,
        type: Assessment.types.CAMPAIGN,
      });

      // when
      const json = anonymisedCampaignAssessmentSerializer.serialize([assessment]);

      // then
      expect(json).to.deep.equal({
        data: [
          {
            type: 'anonymised-campaign-assessments',
            id: assessment.id.toString(),
            attributes: {
              'updated-at': assessment.updatedAt,
              state: assessment.state,
            },
          },
        ],
      });
    });
  });
});
