import { CombinedCourseParticipationStatuses } from '../../../../../../src/prescription/shared/domain/constants.js';
import { CombinedCourseParticipationDetails } from '../../../../../../src/quest/domain/models/combined-course-participation/CombinedCourseParticipationDetails.js';
import { expect } from '../../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | CombinedCourseParticipationDetails ', function () {
  describe('constructor', function () {
    it('should return an object with given properties', function () {
      // given
      const props = {
        id: 123,
        firstName: 'Ludivine',
        lastName: 'Colson',
        group: 'Groupe 1',
        division: '6eme A',
        status: CombinedCourseParticipationStatuses.STARTED,
        updatedAt: new Date('2024-01-12'),
        createdAt: new Date('2024-01-10'),
        hasFormationItem: true,
        nbModules: 4,
        nbCampaigns: 2,
        nbModulesCompleted: 3,
        nbCampaignsCompleted: 1,
      };

      // when
      const details = new CombinedCourseParticipationDetails(props);

      // then
      expect(details).deep.equal(props);
    });
  });
});
