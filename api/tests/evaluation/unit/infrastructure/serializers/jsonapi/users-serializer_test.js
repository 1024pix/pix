import { userSerializer } from '../../../../../../src/evaluation/infrastructure/serializers/jsonapi/user-serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Evaluation | Unit | Serializer | JSONAPI | user', function () {
  describe('#serialize()', function () {
    it('converts a user object into JSON API data', function () {
      // given
      const user = {
        id: '234567',
        hasSeenAssessmentInstructions: false,
        hasSeenNewDashboardInfo: false,
      };

      // when
      const json = userSerializer.serialize(user);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'users',
          id: user.id,
          attributes: {
            'has-seen-new-dashboard-info': false,
            'has-seen-assessment-instructions': false,
          },
        },
      });
    });
  });
});
