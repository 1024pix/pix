import { CombinedCourseParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import { CombinedCourseParticipationDetails } from '../../../../../src/quest/domain/models/combined-course-participations/aggregates/CombinedCourseParticipationDetails.js';
import { combinedCourseParticipationSerializer } from '../../../../../src/quest/infrastructure/serializers/combined-course-participation-serializer.js';
import { expect } from '../../../../test-helper.js';

describe('CombinedCourseParticipationSerializer', function () {
  it('should serialize a CombinedCourseParticipationDetails', function () {
    const combinedCourseParticipation = new CombinedCourseParticipationDetails({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      division: '6 eme',
      group: 'Groupe A',
      status: CombinedCourseParticipationStatuses.COMPLETED,
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
      hasFormationItem: true,
      nbModules: 1,
      nbCampaigns: 1,
      nbModulesCompleted: 0,
      nbCampaignsCompleted: 1,
    });

    const serialized = combinedCourseParticipationSerializer.serialize(combinedCourseParticipation);

    expect(serialized).to.deep.equal({
      data: {
        type: 'combined-course-participations',
        id: '1',
        attributes: {
          'first-name': 'John',
          'last-name': 'Doe',
          division: '6 eme',
          group: 'Groupe A',
          status: CombinedCourseParticipationStatuses.COMPLETED,
          'created-at': new Date('2023-01-01T00:00:00Z'),
          'updated-at': new Date('2023-01-02T00:00:00Z'),
          'has-formation-item': true,
          'nb-modules': 1,
          'nb-campaigns': 1,
          'nb-modules-completed': 0,
          'nb-campaigns-completed': 1,
        },
      },
    });
  });
});
