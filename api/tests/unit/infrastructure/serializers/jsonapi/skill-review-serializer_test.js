const { expect, factory } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/skill-review-serializer');

describe('Unit | Serializer | JSONAPI | skill-review-serializer', function() {

  describe('#serialize()', function() {

    it('should convert a SkillReview model object into JSON API data', function() {
      const skillReview = factory.buildSkillReview();

      // when
      const json = serializer.serialize(skillReview);

      // then
      expect(json).to.deep.equal({
        'data': {
          'type': 'skill-reviews',
          'id': skillReview.assessment.id,
          'attributes': {
            'profile-mastery': skillReview.profileMastery,
          },
          relationships: {
            assessment: {
              data: {
                type: 'assessments',
                id: skillReview.assessment.id.toString()
              }
            }
          }
        }
      });
    });

  });

});
