import { expect, catchErrSync } from '../../../../test-helper.js';
import { User } from '../../../../../lib/domain/models/User.js';
import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/user-serializer.js';
import { LocaleFormatError, LocaleNotSupportedError } from '../../../../../src/shared/domain/errors.js';

describe('Unit | Serializer | JSONAPI | user-serializer', function () {
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
        locale: 'fr-FR',
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
        lastDataProtectionPolicySeenAt: '2022-12-24T10:00:00.000Z',
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
              locale: userModelObject.locale,
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
              'should-see-data-protection-policy-information-banner':
                userModelObject.shouldSeeDataProtectionPolicyInformationBanner,
            },
            relationships: {
              profile: {
                links: {
                  related: `/api/users/${userModelObject.id}/profile`,
                },
              },
              'campaign-participations': {
                links: {
                  related: `/api/users/${userModelObject.id}/campaign-participations`,
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

  describe('#deserialize()', function () {
    let jsonUser;

    beforeEach(function () {
      jsonUser = {
        data: {
          type: 'user',
          attributes: {
            'first-name': 'Luke',
            'last-name': 'Skywalker',
            email: 'lskywalker@deathstar.empire',
            lang: 'jp',
            password: '',
          },
          relationships: {},
        },
      };
    });

    it('should convert JSON API data into an User model object', function () {
      // when
      const user = serializer.deserialize(jsonUser);

      // then
      expect(user).to.be.an.instanceOf(User);
      expect(user.firstName).to.equal('Luke');
      expect(user.lastName).to.equal('Skywalker');
      expect(user.email).to.equal('lskywalker@deathstar.empire');
      expect(user.lang).to.equal('jp');
    });

    it('should contain an ID attribute', function () {
      jsonUser.data.id = '42';

      // when
      const user = serializer.deserialize(jsonUser);

      // then
      expect(user.id).to.equal('42');
    });

    it('should not contain an ID attribute when not given', function () {
      // when
      const user = serializer.deserialize(jsonUser);

      // then
      expect(user.id).to.be.undefined;
    });

    context('user with a invalid locale format', function () {
      it('throws locale format error', function () {
        // given
        jsonUser.data.attributes.locale = 'zzzz';

        // when
        const error = catchErrSync(serializer.deserialize)(jsonUser);

        // then
        expect(error).to.be.instanceOf(LocaleFormatError);
        expect(error.message).to.equal('Given locale is in invalid format: "zzzz"');
      });
    });

    context('user with a not supported locale', function () {
      it('throws locale not supported error', function () {
        // given
        jsonUser.data.attributes.locale = 'jp';

        // when
        const error = catchErrSync(serializer.deserialize)(jsonUser);

        // then
        expect(error).to.be.instanceOf(LocaleNotSupportedError);
        expect(error.message).to.equal('Given locale is not supported : "jp"');
      });
    });
  });
});
