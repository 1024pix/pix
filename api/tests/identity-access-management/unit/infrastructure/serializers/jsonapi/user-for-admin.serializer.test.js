import { expect } from 'chai';

import { User } from '../../../../../../src/identity-access-management/domain/models/User.js';
import { userForAdminSerializer } from '../../../../../../src/identity-access-management/infrastructure/serializers/jsonapi/user-for-admin.serializer.js';

describe('Unit | Identity Access Management | Serializer | JSONAPI | user-for-admin', function () {
  describe('#serialize', function () {
    let userModelObject;

    beforeEach(function () {
      userModelObject = new User({
        id: '234567',
        firstName: 'Luke',
        lastName: 'Skywalker',
        email: 'lskywalker@deathstar.empire',
        username: 'luke.skywalker1234',
        lang: 'fr',
        isAnonymous: false,
        pixCertifTermsOfServiceAccepted: false,
        hasSeenAssessmentInstructions: false,
        hasSeenFocusedChallengeTooltip: false,
        hasSeenOtherChallengesTooltip: false,
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
              username: userModelObject.username,
              lang: userModelObject.lang,
              locale: userModelObject.locale,
              'is-anonymous': userModelObject.isAnonymous,
              'pix-certif-terms-of-service-accepted': userModelObject.pixCertifTermsOfServiceAccepted,
              'last-data-protection-policy-seen-at': userModelObject.lastDataProtectionPolicySeenAt,
              'has-seen-assessment-instructions': userModelObject.hasSeenAssessmentInstructions,
              'has-seen-new-dashboard-info': userModelObject.hasSeenNewDashboardInfo,
              'has-seen-focused-challenge-tooltip': userModelObject.hasSeenFocusedChallengeTooltip,
              'has-seen-other-challenges-tooltip': userModelObject.hasSeenOtherChallengesTooltip,
            },
          },
        };

        // when
        const json = userForAdminSerializer.serialize(userModelObject);

        // then
        expect(json).to.be.deep.equal(expectedSerializedUser);
      });
    });
  });
});
