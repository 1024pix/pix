import { expect } from '../../../../test-helper';
import User from '../../../../../lib/domain/models/User';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/user-for-admin-serializer';

describe('Unit | Serializer | JSONAPI | user-for-adminserializer', function () {
  describe('#serialize', function () {
    let userModelObject;

    beforeEach(function () {
      userModelObject = new User({
        id: '234567',
        firstName: 'Luke',
        lastName: 'Skywalker',
        email: 'lskywalker@deathstar.empire',
        username: 'luke.skywalker1234',
        cgu: true,
        lang: 'fr',
        isAnonymous: false,
        lastTermsOfServiceValidatedAt: '2020-05-04T13:18:26.323Z',
        mustValidateTermsOfService: true,
        pixOrgaTermsOfServiceAccepted: false,
        pixCertifTermsOfServiceAccepted: false,
        hasSeenAssessmentInstructions: false,
        hasSeenFocusedChallengeTooltip: false,
        hasSeenOtherChallengesTooltip: false,
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
            },
            relationships: {
              memberships: {},
              'certification-center-memberships': {},
              'pix-score': {},
              profile: {
                links: {
                  related: `/api/admin/users/${userModelObject.id}/profile`,
                },
              },
              scorecards: {},
              'campaign-participations': {},
              'is-certifiable': {},
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
