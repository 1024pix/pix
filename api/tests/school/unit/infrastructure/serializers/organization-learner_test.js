import { OrganizationLearner } from '../../../../../src/school/domain/models/OrganizationLearner.js';
import * as serializer from '../../../../../src/school/infrastructure/serializers/organization-learner.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | organization-learner', function () {
  describe('#serialize', function () {
    it('should convert an OrganizationLearner model object into JSON API data', function () {
      const organizationLearner = new OrganizationLearner({
        id: 123,
        organizationId: 'orga-1',
        firstName: 'Jean',
        lastName: 'Miche',
        division: 'CM3',
        completedMissionIds: [1],
        startedMissionIds: [2],
      });

      const expectedJSON = {
        data: {
          type: 'organizationLearners',
          id: '123',
          attributes: {
            'first-name': 'Jean',
            division: 'CM3',
            'organization-id': 'orga-1',
            'completed-mission-ids': ['1'],
            'started-mission-ids': ['2'],
          },
        },
      };

      // when
      const json = serializer.serialize(organizationLearner);

      // then
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});
