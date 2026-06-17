import { CampaignParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import { OrganizationLearnerParticipationStatuses } from '../../../../../src/quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import { COMBINED_COURSE_ITEM_TYPES } from '../../../../../src/quest/domain/models/combined-course-participations/value-objects/CombinedCourseItem.js';
import { serialize } from '../../../../../src/quest/infrastructure/serializers/combined-course-participation-detail-serializer.js';
import { expect } from '../../../../test-helper.js';

describe('CombinedCourseParticipationSerializer', function () {
  it('should serialize a CombinedCourseParticipationDetail', function () {
    const combinedCourseDetails = {
      id: 1,
      participation: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      items: [
        {
          id: 2,
          title: 'Campagne',
          type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN,
          masteryRate: 0.5,
          participationStatus: CampaignParticipationStatuses.SHARED,
          isCompleted: true,
          isLocked: false,
          totalStagesCount: 5,
          validatedStagesCount: 2,
        },
        {
          id: 3,
          title: 'Module 1',
          type: COMBINED_COURSE_ITEM_TYPES.MODULE,
          participationStatus: OrganizationLearnerParticipationStatuses.STARTED,
          isCompleted: false,
          isLocked: false,
        },
        {
          id: 4,
          title: 'Module 2',
          type: COMBINED_COURSE_ITEM_TYPES.MODULE,
          participationStatus: OrganizationLearnerParticipationStatuses.NOT_STARTED,
          isCompleted: false,
          isLocked: true,
        },
      ],
    };

    const serialized = serialize(combinedCourseDetails);

    expect(serialized).deep.equal({
      data: {
        attributes: {},
        id: '1',
        relationships: {
          items: {
            data: [
              {
                id: '2',
                type: 'combined-course-items',
              },
              {
                id: '3',
                type: 'combined-course-items',
              },
              {
                id: '4',
                type: 'combined-course-items',
              },
            ],
          },
          participation: {
            data: {
              id: '1',
              type: 'combined-course-participations',
            },
          },
        },
        type: 'combined-course-participation-details',
      },
      included: [
        {
          attributes: {
            'first-name': 'John',
            'last-name': 'Doe',
          },
          id: '1',
          type: 'combined-course-participations',
        },
        {
          attributes: {
            'is-completed': true,
            'is-locked': false,
            'mastery-rate': 0.5,
            'participation-status': CampaignParticipationStatuses.SHARED,
            title: 'Campagne',
            'total-stages-count': 5,
            type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN,
            'validated-stages-count': 2,
          },
          id: '2',
          type: 'combined-course-items',
        },
        {
          attributes: {
            'is-completed': false,
            'is-locked': false,
            'participation-status': OrganizationLearnerParticipationStatuses.STARTED,
            title: 'Module 1',
            type: COMBINED_COURSE_ITEM_TYPES.MODULE,
          },
          id: '3',
          type: 'combined-course-items',
        },
        {
          attributes: {
            'is-completed': false,
            'is-locked': true,
            'participation-status': OrganizationLearnerParticipationStatuses.NOT_STARTED,
            title: 'Module 2',
            type: COMBINED_COURSE_ITEM_TYPES.MODULE,
          },
          id: '4',
          type: 'combined-course-items',
        },
      ],
    });
  });
});
