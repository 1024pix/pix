const { expect } = require('../../../../test-helper');

const UserWithActivity = require('../../../../../lib/domain/read-models/UserWithActivity');
const User = require('../../../../../lib/domain/models/User');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/user-with-activity-serializer');

describe('Unit | Serializer | JSONAPI | user-with-activity-serializer', function () {
  describe('#serialize', function () {
    let userModelObject;

    beforeEach(function () {
      userModelObject = new UserWithActivity({
        user: new User({
          id: '234567',
          firstName: 'Luke',
          lastName: 'Skywalker',
          email: 'lskywalker@deathstar.empire',
          username: 'luke.skywalker1234',
          cgu: true,
          isAnonymous: false,
          lastTermsOfServiceValidatedAt: '2020-05-04T13:18:26.323Z',
          mustValidateTermsOfService: true,
          pixOrgaTermsOfServiceAccepted: false,
          pixCertifTermsOfServiceAccepted: false,
          hasSeenAssessmentInstructions: false,
          hasSeenFocusedChallengeTooltip: false,
          hasSeenOtherChallengesTooltip: false,
          lastDataProtectionPolicySeenAt: '2022-05-04T13:00:00.000Z',
        }),
        hasAssessmentParticipations: false,
        codeForLastProfileToShare: 'SOMECODE',
        hasRecommendedTrainings: false,
      });
    });

    describe('when user has no userOrgaSettings', function () {
      it('should serialize excluding password', function () {
        // given
        const expectedSerializedUser = {
          data: {
            type: 'users',
            id: userModelObject.id,
            attributes: {
              'first-name': userModelObject.firstName,
              'last-name': userModelObject.lastName,
              email: userModelObject.email,
              username: userModelObject.username,
              cgu: userModelObject.cgu,
              lang: userModelObject.lang,
              'is-anonymous': userModelObject.isAnonymous,
              'last-terms-of-service-validated-at': userModelObject.lastTermsOfServiceValidatedAt,
              'must-validate-terms-of-service': userModelObject.mustValidateTermsOfService,
              'pix-orga-terms-of-service-accepted': userModelObject.pixOrgaTermsOfServiceAccepted,
              'pix-certif-terms-of-service-accepted': userModelObject.pixCertifTermsOfServiceAccepted,
              'has-seen-assessment-instructions': userModelObject.hasSeenAssessmentInstructions,
              'has-seen-new-dashboard-info': userModelObject.hasSeenNewDashboardInfo,
              'has-seen-focused-challenge-tooltip': userModelObject.hasSeenFocusedChallengeTooltip,
              'has-seen-other-challenges-tooltip': userModelObject.hasSeenOtherChallengesTooltip,
              'last-data-protection-policy-seen-at': userModelObject.lastDataProtectionPolicySeenAt,
              'has-assessment-participations': userModelObject.hasAssessmentParticipations,
              'code-for-last-profile-to-share': userModelObject.codeForLastProfileToShare,
              'has-recommended-trainings': userModelObject.hasRecommendedTrainings,
              'should-see-data-protection-policy-information-banner':
                userModelObject.shouldSeeDataProtectionPolicyInformationBanner,
            },
            relationships: {
              'certification-center-memberships': {
                links: {
                  related: `/api/users/${userModelObject.id}/certification-center-memberships`,
                },
              },
              'pix-score': {
                links: {
                  related: `/api/users/${userModelObject.id}/pixscore`,
                },
              },
              profile: {
                links: {
                  related: `/api/users/${userModelObject.id}/profile`,
                },
              },
              scorecards: {
                links: {
                  related: `/api/users/${userModelObject.id}/scorecards`,
                },
              },
              'is-certifiable': {
                links: {
                  related: `/api/users/${userModelObject.id}/is-certifiable`,
                },
              },
              trainings: {
                links: {
                  related: `/api/users/${userModelObject.id}/trainings`,
                },
              },
            },
          },
        };

        // when
        const json = serializer.serialize(userModelObject);

        // then
        expect(json).to.be.deep.equal(expectedSerializedUser);
      });
    });
  });
});
