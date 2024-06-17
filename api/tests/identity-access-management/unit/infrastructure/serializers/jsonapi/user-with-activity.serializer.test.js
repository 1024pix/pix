import { User } from '../../../../../../src/identity-access-management/domain/models/User.js';
import { UserWithActivity } from '../../../../../../src/identity-access-management/domain/read-models/UserWithActivity.js';
import { userWithActivitySerializer } from '../../../../../../src/identity-access-management/infrastructure/serializers/jsonapi/user-with-activity.serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Identity Access Management | Infrastructure | Serializer | JSONAPI | user-with-activity', function () {
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
          hasSeenNewDashboardInfo: false,
          hasSeenLevelSevenInfo: false,
          lastDataProtectionPolicySeenAt: '2022-05-04T13:00:00.000Z',
        }),
        hasAssessmentParticipations: false,
        codeForLastProfileToShare: 'SOMECODE',
        hasRecommendedTrainings: false,
      });
    });

    describe('when user has no userOrgaSettings', function () {
      it('serializes excluding password', function () {
        // given
        const expectedSerializedUser = {
          data: {
            type: 'users',
            id: userModelObject.id,
            attributes: {
              'first-name': userModelObject.firstName,
              'last-name': userModelObject.lastName,
              email: userModelObject.email,
              'email-confirmed': false,
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
              'has-seen-level-seven-info': userModelObject.hasSeenLevelSevenInfo,
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
              profile: {
                links: {
                  related: `/api/users/${userModelObject.id}/profile`,
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
        const json = userWithActivitySerializer.serialize(userModelObject);

        // then
        expect(json).to.be.deep.equal(expectedSerializedUser);
      });
    });
  });
});
