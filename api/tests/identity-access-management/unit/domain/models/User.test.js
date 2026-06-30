import sinon from 'sinon';

import { User } from '../../../../../src/identity-access-management/domain/models/User.js';
import { config } from '../../../../../src/shared/config.js';
import { getDefaultLocale } from '../../../../../src/shared/domain/services/locale-service.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Identity Access Management | Domain | Model | User', function () {
  beforeEach(function () {
    sinon.stub(config.dataProtectionPolicy, 'updateDate').value('2020-01-01');
  });

  describe('constructor', function () {
    it('handles createdAt and updatedAt', function () {
      // given
      const creationDate = new Date('2019-03-12T19:37:03Z');

      // when
      const user = new User({ createdAt: creationDate, updatedAt: creationDate });

      // then
      expect(user.createdAt.toISOString()).to.equal('2019-03-12T19:37:03.000Z');
      expect(user.updatedAt.toISOString()).to.equal('2019-03-12T19:37:03.000Z');
    });

    context('locale', function () {
      context('when there is no locale', function () {
        ['', null, undefined].forEach((locale) => {
          it(`returns null for ${locale}`, function () {
            // when
            const user = new User({ locale });

            //then
            expect(user.locale).to.be.undefined;
          });
        });
      });

      context('when the locale is not supported', function () {
        it('throws a RangeError', function () {
          // given
          const locale = 'fr-fr';

          // when
          const user = new User({ locale });

          //then
          expect(user.locale).to.equal('fr-FR');
        });
      });

      context('when the locale is supported', function () {
        ['fr', 'fr-FR', 'fr-BE'].forEach((locale) => {
          it(`returns the locale ${locale}`, function () {
            // when
            const user = new User({ locale });

            //then
            expect(user.locale).to.equal(locale);
          });
        });
      });
    });

    context('language', function () {
      it('coerces the given language to the default locale', function () {
        // when
        const user = new User({ lang: 'thl' });

        // then
        expect(user.lang).to.equal('fr');
      });

      context('when there is no language given', function () {
        it('returns default language', function () {
          // when
          const user = new User({});

          // then
          expect(user.lang).to.equal('fr');
        });
      });
    });

    context('email confirmation', function () {
      context('when emailConfirmedAt is defined', function () {
        it('returns "true" for attribute "emailConfirmed"', function () {
          // when
          const user = new User({ emailConfirmedAt: new Date() });

          // then
          expect(user.emailConfirmed).to.be.true;
        });
      });

      context('when emailConfirmedAt is not defined', function () {
        it('returns "false" for attribute "emailConfirmed"', function () {
          // when
          const user = new User();

          // then
          expect(user.emailConfirmed).to.false;
        });
      });
    });
  });

  describe('changeLocale', function () {
    it('deals with empty locale', function () {
      // given
      const user = new User(undefined);

      // when
      user.changeLocale(null);

      // then
      expect(user.locale).to.equal(getDefaultLocale());
    });

    context('when user has no locale', function () {
      it('validates and sets the locale', function () {
        // given
        const user1 = new User(undefined);
        const user2 = new User(undefined);
        const user3 = new User(undefined);
        const locale1 = 'fr';
        const locale2 = 'fr-FR';
        const locale3 = 'fr-BE';

        // when
        user1.changeLocale(locale1);
        user2.changeLocale(locale2);
        user3.changeLocale(locale3);

        // then
        expect(user1.locale).to.equal('fr');
        expect(user2.locale).to.equal('fr-FR');
        expect(user3.locale).to.equal('fr-BE');
      });
    });

    context('when user has already the same locale', function () {
      it('does not set a new locale', function () {
        // given
        const user = new User({ locale: 'fr-FR' });

        // when
        user.changeLocale('fr-FR');

        // then
        expect(user.locale).to.equal('fr-FR');
      });
    });

    context('when user has a different locale', function () {
      it('validates and sets the new locale', function () {
        // given
        const user = new User({ locale: 'nl-BE' });

        // when
        user.changeLocale('fr-FR');

        // then
        expect(user.locale).to.equal('fr-FR');
      });
    });
  });

  describe('isLinkedToOrganizations', function () {
    it('should be true if user has a role in an organization', function () {
      // given
      const user = domainBuilder.buildUser({
        memberships: [domainBuilder.buildMembership()],
      });

      // when
      const isLinked = user.isLinkedToOrganizations();

      //then
      expect(isLinked).to.be.true;
    });

    it('should be false is user has no role in no organization', function () {
      // given
      const user = new User(undefined);

      // when
      const isLinked = user.isLinkedToOrganizations();

      //then
      expect(isLinked).to.be.false;
    });
  });

  describe('hasAccessToOrganization', function () {
    it('should be false is user has no access to no organizations', function () {
      // given
      const user = new User(undefined);
      const organizationId = 12345;

      // when
      const hasAccess = user.hasAccessToOrganization(organizationId);

      //then
      expect(hasAccess).to.be.false;
    });

    it('should be false is the user has access to many organizations, but not the one asked', function () {
      // given
      const organizationId = 12345;
      const user = domainBuilder.buildUser();
      user.memberships.push(domainBuilder.buildMembership());
      user.memberships[0].organization.id = 93472;
      user.memberships[1].organization.id = 74569;

      // when
      const hasAccess = user.hasAccessToOrganization(organizationId);

      //then
      expect(hasAccess).to.be.false;
    });

    it('should be true if the user has an access to the given organizationId', function () {
      // given
      const organizationId = 12345;
      const user = domainBuilder.buildUser();
      user.memberships[0].organization.id = 12345;

      // when
      const hasAccess = user.hasAccessToOrganization(organizationId);

      //then
      expect(hasAccess).to.be.true;
    });
  });

  describe('#email', function () {
    it('should normalize email', function () {
      // given
      const userData = {
        email: 'TESTMAIL@gmail.com',
      };

      // when
      const userObject = new User(userData);

      // then
      expect(userObject.email).to.equal('testmail@gmail.com');
    });

    it('should default email to undefined', function () {
      // given
      const userData = {
        firstName: 'Bob',
      };

      // when
      const userObject = new User(userData);

      // then
      expect(userObject.email).to.be.undefined;
    });

    it('it accepts null as a valid value for email', function () {
      // given
      const userData = {
        firstName: 'Alice',
        email: null,
      };

      // when
      const userObject = new User(userData);

      // then
      expect(userObject.email).to.be.null;
    });
  });

  describe('#shouldChangePassword', function () {
    context('when there is a Pix authentication method', function () {
      it('should return true', function () {
        // given
        const oneTimePassword = 'Azerty123*';

        const pixAuthenticationMethod =
          domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
            hashedPassword: oneTimePassword,
            shouldChangePassword: true,
          });

        const user = new User({
          id: 1,
          email: 'email@example.net',
          authenticationMethods: [pixAuthenticationMethod],
        });

        // when
        const shouldChangePassword = user.shouldChangePassword;

        // then
        expect(shouldChangePassword).to.be.true;
      });

      it('should return false when should not change password', function () {
        // given
        const pixAuthenticationMethod =
          domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
            shouldChangePassword: false,
          });

        const user = new User({
          id: 1,
          email: 'email@example.net',
          authenticationMethods: [pixAuthenticationMethod],
        });

        // when
        const shouldChangePassword = user.shouldChangePassword;

        // then
        expect(shouldChangePassword).to.be.false;
      });
    });

    context('when there is no Pix authentication method', function () {
      it('should return null', function () {
        // given
        const poleEmploiAuthenticationMethod =
          domainBuilder.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider();

        const user = new User({
          id: 1,
          authenticationMethods: [poleEmploiAuthenticationMethod],
        });

        // when
        const shouldChangePassword = user.shouldChangePassword;

        // then
        expect(shouldChangePassword).to.be.null;
      });
    });
  });

  describe('#passwordHash', function () {
    context('when there is a Pix authentication method', function () {
      it('returns the password hash', function () {
        // given
        const hashedPassword = 'xxx';
        const pixAuthenticationMethod =
          domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({ hashedPassword });

        // when
        const user = new User({
          id: 1,
          authenticationMethods: [pixAuthenticationMethod],
        });

        // then
        expect(user.passwordHash).to.equal(hashedPassword);
      });
    });

    context('when there is no Pix authentication method', function () {
      it('returns null', function () {
        // given
        const poleEmploiAuthenticationMethod =
          domainBuilder.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider();

        // when
        const user = new User({
          id: 1,
          authenticationMethods: [poleEmploiAuthenticationMethod],
        });

        // then
        expect(user.passwordHash).to.be.null;
      });
    });
  });

  describe('#markEmailAsValid', function () {
    let clock, now;

    beforeEach(function () {
      now = new Date('2024-06-11');
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('marks user email as valid by setting a date on "emailConfirmedAt" attribute', function () {
      // given
      const user = domainBuilder.buildUser();

      // when
      user.markEmailAsValid();

      // then
      expect(user.emailConfirmedAt).to.be.a('Date');
      expect(user.emailConfirmedAt).to.deep.equal(now);
    });
  });

  describe('#isActive', function () {
    it('return true when user isAnonymous (without real account)', function () {
      // given
      const user = domainBuilder.buildUser({ isAnonymous: true });

      // when
      // then
      expect(user.isActive).to.be.true;
    });

    it('return true when user hasBeenAnonymized (user demand to delete his account)', function () {
      // given
      const user = domainBuilder.buildUser({ isAnonymous: false, hasBeenAnonymised: true });

      // when
      // then
      expect(user.isActive).to.be.true;
    });

    it('return false when user not Anonymous and still active ', function () {
      // given
      const user = domainBuilder.buildUser({ isAnonymous: false, hasBeenAnonymised: false });

      // when
      // then
      expect(user.isActive).to.be.false;
    });
  });

  describe('#mapToDatabaseDto', function () {
    it('maps user model into user database DTO', function () {
      // given
      const expectedAttributes = [
        'id',
        'createdAt',
        'updatedAt',
        'firstName',
        'lastName',
        'username',
        'email',
        'emailConfirmedAt',
        'cgu',
        'lastTermsOfServiceValidatedAt',
        'lastPixCertifTermsOfServiceValidatedAt',
        'lastDataProtectionPolicySeenAt',
        'mustValidateTermsOfService',
        'pixCertifTermsOfServiceAccepted',
        'hasSeenAssessmentInstructions',
        'hasSeenOtherChallengesTooltip',
        'hasSeenNewDashboardInfo',
        'hasSeenFocusedChallengeTooltip',
        'lang',
        'locale',
        'isAnonymous',
        'hasBeenAnonymised',
        'hasBeenAnonymisedBy',
      ];
      const user = domainBuilder.buildUser();

      // when
      const dto = user.mapToDatabaseDto();
      const attributes = Object.keys(dto);

      // then
      expect(attributes).to.deep.equal(expectedAttributes);
    });
  });

  describe('#anonymize', function () {
    let clock;
    const now = new Date('2023-09-19T01:02:03Z');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(async function () {
      clock.restore();
    });

    it('anonymizes user info', function () {
      // given
      const adminId = 1;
      const user = new User({
        id: 1000,
        createdAt: new Date('2012-12-12T12:12:12Z'),
        updatedAt: new Date('2023-03-23T23:23:23Z'),
      });

      // when
      const anonymizedUser = user.anonymize(adminId);

      // then
      expect(anonymizedUser.id).to.be.equal(1000);
      expect(anonymizedUser.firstName).to.equal('(anonymised)');
      expect(anonymizedUser.lastName).to.equal('(anonymised)');
      expect(anonymizedUser.email).to.be.null;
      expect(anonymizedUser.emailConfirmedAt).to.be.null;
      expect(anonymizedUser.username).to.be.null;
      expect(anonymizedUser.hasBeenAnonymised).to.be.true;
      expect(anonymizedUser.hasBeenAnonymisedBy).to.equal(adminId);
      expect(anonymizedUser.lastTermsOfServiceValidatedAt).to.be.null;
      expect(anonymizedUser.lastPixCertifTermsOfServiceValidatedAt).to.be.null;
      expect(anonymizedUser.lastDataProtectionPolicySeenAt).to.be.null;
      expect(anonymizedUser.createdAt.toISOString()).to.equal('2012-12-01T00:00:00.000Z');
      expect(anonymizedUser.updatedAt.toISOString()).to.equal('2023-09-01T00:00:00.000Z');
    });
  });

  describe('#convertAnonymousToRealUser', function () {
    let clock;
    const now = new Date('2023-09-19T01:02:03Z');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(async function () {
      clock.restore();
    });

    it('upgrades anonymous user to real user', function () {
      // given
      const anonymousUser = domainBuilder.buildUser({
        firstName: null,
        lastName: null,
        email: null,
        cgu: false,
        lang: 'fr',
        locale: null,
        mustValidateTermsOfService: true,
        hasSeenAssessmentInstructions: true,
        isAnonymous: true,
        memberships: null,
        certificationMemberships: null,
        authenticationMethods: null,
      });

      const userAttributes = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        cgu: true,
        locale: 'fr-FR',
      };

      // when
      const realUser = anonymousUser.convertAnonymousToRealUser(userAttributes);

      // then
      expect(realUser.id).to.be.equal(anonymousUser.id);
      expect(realUser).to.include(userAttributes);
      expect(realUser.isAnonymous).to.be.false;
      expect(realUser.mustValidateTermsOfService).to.be.false;
      expect(realUser.lastTermsOfServiceValidatedAt).to.deep.equal(now);
    });
  });
});
