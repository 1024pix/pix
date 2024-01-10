import { sinon, expect, domainBuilder } from '../../../test-helper.js';
import { User } from '../../../../lib/domain/models/User.js';

describe('Unit | Domain | Models | User', function () {
  let config;
  let localeService;
  let dependencies;

  beforeEach(function () {
    config = {
      dataProtectionPolicy: {
        updateDate: '2020-01-01',
      },
    };
    localeService = {
      getCanonicalLocale: sinon.stub(),
    };
    dependencies = { config, localeService };
  });

  describe('constructor', function () {
    context('locale', function () {
      it('accepts no locale', function () {
        // given
        const users = [
          new User({ locale: '' }, dependencies),
          new User({ locale: null }, dependencies),
          new User({ locale: undefined }, dependencies),
        ];

        //then
        expect(users.length).to.equal(3);
      });

      it('validates and canonicalizes the locale', function () {
        // given
        localeService.getCanonicalLocale.returns('fr-BE');

        // when
        const user = new User({ locale: 'fr-be' }, dependencies);

        // then
        expect(localeService.getCanonicalLocale).to.have.been.calledWithExactly('fr-be');
        expect(user.locale).to.equal('fr-BE');
      });
    });
  });

  describe('setLocaleIfNotAlreadySet', function () {
    it('deals with empty locale', function () {
      // given
      const user = new User(undefined, dependencies);

      // when
      user.setLocaleIfNotAlreadySet(null);

      // then
      expect(localeService.getCanonicalLocale).to.not.have.been.called;
      expect(user.locale).to.be.undefined;
      expect(user.hasBeenModified).to.be.false;
    });

    context('when user has no locale', function () {
      it('validates, canonicalizes and sets the locale', function () {
        // given
        const user = new User(undefined, dependencies);
        localeService.getCanonicalLocale.returns('fr-FR');

        // when
        user.setLocaleIfNotAlreadySet('fr-fr');

        // then
        expect(localeService.getCanonicalLocale).to.have.been.calledWithExactly('fr-fr');
        expect(user.locale).to.equal('fr-FR');
        expect(user.hasBeenModified).to.be.true;
      });
    });

    context('when user has a locale', function () {
      it('does not set a new locale', function () {
        // given
        localeService.getCanonicalLocale.returns('en');
        const user = new User({ locale: 'en' }, dependencies);

        // Overload our stub to make sure it is not called after the user has been created
        localeService = {
          getCanonicalLocale: sinon.stub(),
        };

        // when
        user.setLocaleIfNotAlreadySet('fr-fr');

        // then
        expect(localeService.getCanonicalLocale).to.not.have.been.called;
        expect(user.locale).to.equal('en');
        expect(user.hasBeenModified).to.be.false;
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
      const user = new User(undefined, dependencies);

      // when
      const isLinked = user.isLinkedToOrganizations();

      //then
      expect(isLinked).to.be.false;
    });
  });

  describe('isLinkedToCertificationCenters', function () {
    it('should be true if user has a role in a certification center', function () {
      // given
      const user = domainBuilder.buildUser({
        certificationCenterMemberships: [domainBuilder.buildCertificationCenterMembership()],
      });

      // when
      const isLinked = user.isLinkedToCertificationCenters();

      // then
      expect(isLinked).to.be.true;
    });

    it('should be false if user has no role in certification center', function () {
      // given
      const user = new User(undefined, dependencies);

      // when
      const isLinked = user.isLinkedToCertificationCenters();

      // then
      expect(isLinked).to.be.false;
    });
  });

  describe('hasAccessToOrganization', function () {
    it('should be false is user has no access to no organizations', function () {
      // given
      const user = new User(undefined, dependencies);
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

  describe('hasAccessToCertificationCenter', function () {
    it('should be false if user has no access to given certification center', function () {
      // given
      const user = new User(undefined, dependencies);
      const certificationCenterId = 12345;

      // when
      const hasAccess = user.hasAccessToCertificationCenter(certificationCenterId);

      // then
      expect(hasAccess).to.be.false;
    });

    it('should be false if user has access to many CertificationCenters, but not the given one', function () {
      // given
      const certificationCenterId = 12345;
      const user = domainBuilder.buildUser();
      user.certificationCenterMemberships.push(domainBuilder.buildCertificationCenterMembership());
      user.certificationCenterMemberships[0].certificationCenter.id = 93472;
      user.certificationCenterMemberships[1].certificationCenter.id = 74569;

      // when
      const hasAccess = user.hasAccessToCertificationCenter(certificationCenterId);

      //then
      expect(hasAccess).to.be.false;
    });

    it('should be true if the user has an access to the given CertificationCenterId', function () {
      // given
      const certificationCenterId = 12345;
      const user = domainBuilder.buildUser();
      user.certificationCenterMemberships[0].certificationCenter.id = 12345;

      // when
      const hasAccess = user.hasAccessToCertificationCenter(certificationCenterId);

      //then
      expect(hasAccess).to.be.true;
    });

    it('should be false if the user has a disabled access to the given CertificationCenterId', function () {
      // given
      const certificationCenterId = 12345;
      const now = new Date();
      const user = domainBuilder.buildUser();
      user.certificationCenterMemberships = [
        domainBuilder.buildCertificationCenterMembership({
          certificationCenter: { id: certificationCenterId },
          disabledAt: now,
        }),
      ];

      // when
      const hasAccess = user.hasAccessToCertificationCenter(certificationCenterId);

      //then
      expect(hasAccess).to.be.false;
    });
  });

  describe('#email', function () {
    it('should normalize email', function () {
      // given
      const userData = {
        email: 'TESTMAIL@gmail.com',
      };

      // when
      const userObject = new User(userData, dependencies);

      // then
      expect(userObject.email).to.equal('testmail@gmail.com');
    });

    it('should default email to undefined', function () {
      // given
      const userData = {
        firstName: 'Bob',
      };

      // when
      const userObject = new User(userData, dependencies);

      // then
      expect(userObject.email).to.be.undefined;
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

        const user = new User(
          {
            id: 1,
            email: 'email@example.net',
            authenticationMethods: [pixAuthenticationMethod],
          },
          dependencies,
        );

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

        const user = new User(
          {
            id: 1,
            email: 'email@example.net',
            authenticationMethods: [pixAuthenticationMethod],
          },
          dependencies,
        );

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

        const user = new User(
          {
            id: 1,
            authenticationMethods: [poleEmploiAuthenticationMethod],
          },
          dependencies,
        );

        // when
        const shouldChangePassword = user.shouldChangePassword;

        // then
        expect(shouldChangePassword).to.be.null;
      });
    });
  });

  describe('#shouldSeeDataProtectionPolicyInformationBanner', function () {
    context('when user has not seen data protection policy but data protection date is not setted', function () {
      it('should return false', function () {
        // given
        config.dataProtectionPolicy.updateDate = null;
        const user = new User({ lastDataProtectionPolicySeenAt: null }, dependencies);

        // then
        expect(user.shouldSeeDataProtectionPolicyInformationBanner).to.be.false;
      });
    });

    context('when user has not seen data protection policy and data protection has been updated', function () {
      it('should return true', function () {
        // given
        config.dataProtectionPolicy.updateDate = new Date();
        const user = new User({ lastDataProtectionPolicySeenAt: null, cgu: true }, dependencies);

        // then
        expect(user.shouldSeeDataProtectionPolicyInformationBanner).to.be.true;
      });

      it('should return false for an organization learner', function () {
        // given
        config.dataProtectionPolicy.updateDate = new Date();
        const user = new User({ lastDataProtectionPolicySeenAt: null, cgu: false }, dependencies);

        // then
        expect(user.shouldSeeDataProtectionPolicyInformationBanner).to.be.false;
      });
    });

    context('when user has seen data protection policy but data protection date is not setted', function () {
      it('should return false', function () {
        // given
        config.dataProtectionPolicy.updateDate = null;
        const user = new User({ lastDataProtectionPolicySeenAt: new Date(), cgu: true }, dependencies);

        // then
        expect(user.shouldSeeDataProtectionPolicyInformationBanner).to.be.false;
      });

      it('should return false for an organization learner', function () {
        // given
        config.dataProtectionPolicy.updateDate = null;
        const user = new User({ lastDataProtectionPolicySeenAt: new Date(), cgu: false }, dependencies);

        // then
        expect(user.shouldSeeDataProtectionPolicyInformationBanner).to.be.false;
      });
    });

    context('when user has seen data protection policy but data protection has not been updated since', function () {
      it('should return false', function () {
        // given
        config.dataProtectionPolicy.updateDate = new Date();
        const user = new User(
          { lastDataProtectionPolicySeenAt: new Date(Date.now() + 3600 * 1000), cgu: true },
          dependencies,
        );

        // then
        expect(user.shouldSeeDataProtectionPolicyInformationBanner).to.be.false;
      });

      it('should return false for an organization learner', function () {
        // given
        config.dataProtectionPolicy.updateDate = new Date();
        const user = new User(
          { lastDataProtectionPolicySeenAt: new Date(Date.now() + 3600 * 1000), cgu: false },
          dependencies,
        );

        // then
        expect(user.shouldSeeDataProtectionPolicyInformationBanner).to.be.false;
      });
    });

    context('when user has seen data protection policy but data protection has been updated', function () {
      it('should return true', function () {
        // given
        config.dataProtectionPolicy.updateDate = new Date(Date.now() + 3600 * 1000);
        const user = new User({ lastDataProtectionPolicySeenAt: new Date(), cgu: true }, dependencies);

        // then
        expect(user.shouldSeeDataProtectionPolicyInformationBanner).to.be.true;
      });

      it('should return false for an organization learner', function () {
        // given
        config.dataProtectionPolicy.updateDate = new Date(Date.now() + 3600 * 1000);
        const user = new User({ lastDataProtectionPolicySeenAt: new Date(), cgu: false }, dependencies);

        // then
        expect(user.shouldSeeDataProtectionPolicyInformationBanner).to.be.false;
      });
    });
  });
});
