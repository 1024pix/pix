import { expect } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/organization-learner-activity-serializer';
import OrganizationLearnerParticipation from '../../../../../lib/domain/read-models/OrganizationLearnerParticipation';
import OrganizationLearnerActivity from '../../../../../lib/domain/read-models/OrganizationLearnerActivity';

describe('Unit | Serializer | JSONAPI | organization-learner-participation-serialize', function () {
  describe('#serialize', function () {
    it('should convert an organization learner activity read-model object into JSON API data', function () {
      // given
      const organizationLearnerActivity = new OrganizationLearnerActivity({
        organizationLearnerId: 25,
        participations: [
          new OrganizationLearnerParticipation({
            id: '99999',
            campaignType: 'PROFILES_COLLECTION',
            campaignName: 'La 1ère campagne',
            createdAt: '2000-01-01T10:00:00Z',
            sharedAt: '2000-02-01T10:00:00Z',
            status: 'SHARED',
          }),
          new OrganizationLearnerParticipation({
            id: '100000',
            campaignType: 'ASSESSMENT',
            campaignName: 'La 2ème campagne',
            createdAt: '2000-03-01T10:00:00Z',
            sharedAt: '2000-04-01T10:00:00Z',
            status: 'STARTED',
          }),
        ],
        statistics: [
          {
            campaignType: 'ASSESSMENT',
            shared: 0,
            started: 1,
            to_share: 0,
            total: 1,
          },
          {
            campaignType: 'PROFILES_COLLECTION',
            shared: 1,
            to_share: 0,
            total: 1,
          },
        ],
      });
      // when
      const json = serializer.serialize(organizationLearnerActivity);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'organization-learner-activities',
          id: '25',
          attributes: {},
          relationships: {
            'organization-learner-participations': {
              data: [
                {
                  id: '99999',
                  type: 'organizationLearnerParticipations',
                },
                {
                  id: '100000',
                  type: 'organizationLearnerParticipations',
                },
              ],
            },
            'organization-learner-statistics': {
              data: [
                {
                  id: 'ASSESSMENT',
                  type: 'organizationLearnerStatistics',
                },
                {
                  id: 'PROFILES_COLLECTION',
                  type: 'organizationLearnerStatistics',
                },
              ],
            },
          },
        },
        included: [
          {
            id: '99999',
            type: 'organizationLearnerParticipations',
            attributes: {
              'campaign-type': 'PROFILES_COLLECTION',
              'campaign-name': 'La 1ère campagne',
              'created-at': '2000-01-01T10:00:00Z',
              'shared-at': '2000-02-01T10:00:00Z',
              status: 'SHARED',
            },
          },
          {
            id: '100000',
            type: 'organizationLearnerParticipations',
            attributes: {
              'campaign-type': 'ASSESSMENT',
              'campaign-name': 'La 2ème campagne',
              'created-at': '2000-03-01T10:00:00Z',
              'shared-at': '2000-04-01T10:00:00Z',
              status: 'STARTED',
            },
          },
          {
            id: 'ASSESSMENT',
            type: 'organizationLearnerStatistics',
            attributes: {
              shared: 0,
              'to-share': 0,
              total: 1,
              started: 1,
            },
          },
          {
            id: 'PROFILES_COLLECTION',
            type: 'organizationLearnerStatistics',
            attributes: {
              shared: 1,
              'to-share': 0,
              total: 1,
            },
          },
        ],
      });
    });
  });
});
