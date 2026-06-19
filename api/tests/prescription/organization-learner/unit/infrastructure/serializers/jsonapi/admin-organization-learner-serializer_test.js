import { OrganizationLearnerOverviewForAdmin } from '../../../../../../../src/prescription/organization-learner/domain/read-models/OrganizationLearnerOverviewForAdmin.js';
import * as serializer from '../../../../../../../src/prescription/organization-learner/infrastructure/serializers/jsonapi/admin-organization-learner-serializer.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | admin-organization-learner-serializer', function () {
  describe('#serialize', function () {
    it('should convert an OrganizationLearnerOverviewForAdmin model object into JSON API data', function () {
      // given
      const pagination = { page: 1, pageSize: 1, rowCount: 2, pageCount: 2 };
      const organizationLearners = [
        new OrganizationLearnerOverviewForAdmin({
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          birthdate: '2000-10-15',
          division: '3A',
          group: 'L1',
          nationalStudentId: '123456ABCDE',
          organizationId: 1,
          organizationName: 'School',
          userId: 1,
          updatedAt: new Date('2020-09-08'),
          isDisabled: false,
        }),
        new OrganizationLearnerOverviewForAdmin({
          id: 2,
          firstName: 'Jane',
          lastName: 'Do',
          birthdate: '2000-10-15',
          division: '3A',
          group: 'L1',
          nationalStudentId: '223456ABCDE',
          organizationId: 1,
          organizationName: 'School',
          userId: 1,
          updatedAt: new Date('2020-09-08'),
          isDisabled: true,
        }),
      ];

      const expectedSerializedLearner = {
        meta: { page: 1, pageSize: 1, rowCount: 2, pageCount: 2 },
        data: [
          {
            type: 'admin-organization-learners',
            id: '1',
            attributes: {
              'first-name': 'John',
              'last-name': 'Doe',
              birthdate: '2000-10-15',
              division: '3A',
              group: 'L1',
              'national-student-id': '123456ABCDE',
              'organization-id': 1,
              'organization-name': 'School',
              'user-id': 1,
              'updated-at': new Date('2020-09-08'),
              'is-disabled': false,
            },
          },
          {
            type: 'admin-organization-learners',
            id: '2',
            attributes: {
              'first-name': 'Jane',
              'last-name': 'Do',
              birthdate: '2000-10-15',
              division: '3A',
              group: 'L1',
              'national-student-id': '223456ABCDE',
              'organization-id': 1,
              'organization-name': 'School',
              'user-id': 1,
              'updated-at': new Date('2020-09-08'),
              'is-disabled': true,
            },
          },
        ],
      };

      // when
      const json = serializer.serialize({ learners: organizationLearners, pagination });

      // then
      expect(json).to.deep.equal(expectedSerializedLearner);
    });
  });
});
