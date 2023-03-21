const { expect, domainBuilder } = require('../../../test-helper');
const config = require('../../../../lib/config');
const User = require('../../../../lib/domain/models/User');

describe('Unit | Domain | Models | User', function () {
  describe('constructor', function () {
    it('accepts no locale', function () {
      // given
      const users = [new User({ locale: '' }), new User({ locale: null }), new User({ locale: undefined })];

      //then
      expect(users.length).to.equal(3);
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
      const user = new User();

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
      const user = new User();

      // when
      const isLinked = user.isLinkedToCertificationCenters();

      // then
      expect(isLinked).to.be.false;
    });
  });

  describe('hasAccessToOrganization', function () {
    it('should be false is user has no access to no organizations', function () {
      // given
      const user = new User();
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
      const user = new User();
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

  describe('#shouldSeeDataProtectionPolicyInformationBanner', function () {
    context('when user has not seen data protection policy but data protection date is not setted', function () {
      it('should return false', function () {
        // given
        config.dataProtectionPolicy.updateDate = null;
        const user = new User({ lastDataProtectionPolicySeenAt: null });

        // then
        expect(user.shouldSeeDataProtectionPolicyInformationBanner).to.be.false;
      });
    });

    context('when user has not seen data protection policy and data protection has been updated', function () {
      it('should return true', function () {
        // given
        config.dataProtectionPolicy.updateDate = new Date();
        const user = new User({ lastDataProtectionPolicySeenAt: null, cgu: true });

        // then
        expect(user.shouldSeeDataProtectionPolicyInformationBanner).to.be.true;
      });

      it('should return false for an organization learner', function () {
        // given
        config.dataProtectionPolicy.updateDate = new Date();
        const user = new User({ lastDataProtectionPolicySeenAt: null, cgu: false });

        // then
        expect(user.shouldSeeDataProtectionPolicyInformationBanner).to.be.false;
      });
    });

    context('when user has seen data protection policy but data protection date is not setted', function () {
      it('should return false', function () {
        // given
        config.dataProtectionPolicy.updateDate = null;
        const user = new User({ lastDataProtectionPolicySeenAt: new Date(), cgu: true });

        // then
        expect(user.shouldSeeDataProtectionPolicyInformationBanner).to.be.false;
      });

      it('should return false for an organization learner', function () {
        // given
        config.dataProtectionPolicy.updateDate = null;
        const user = new User({ lastDataProtectionPolicySeenAt: new Date(), cgu: false });

        // then
        expect(user.shouldSeeDataProtectionPolicyInformationBanner).to.be.false;
      });
    });

    context('when user has seen data protection policy but data protection has not been updated since', function () {
      it('should return false', function () {
        // given
        config.dataProtectionPolicy.updateDate = new Date();
        const user = new User({ lastDataProtectionPolicySeenAt: new Date(Date.now() + 3600 * 1000), cgu: true });

        // then
        expect(user.shouldSeeDataProtectionPolicyInformationBanner).to.be.false;
      });

      it('should return false for an organization learner', function () {
        // given
        config.dataProtectionPolicy.updateDate = new Date();
        const user = new User({ lastDataProtectionPolicySeenAt: new Date(Date.now() + 3600 * 1000), cgu: false });

        // then
        expect(user.shouldSeeDataProtectionPolicyInformationBanner).to.be.false;
      });
    });

    context('when user has seen data protection policy but data protection has been updated', function () {
      it('should return true', function () {
        // given
        config.dataProtectionPolicy.updateDate = new Date(Date.now() + 3600 * 1000);
        const user = new User({ lastDataProtectionPolicySeenAt: new Date(), cgu: true });

        // then
        expect(user.shouldSeeDataProtectionPolicyInformationBanner).to.be.true;
      });

      it('should return false for an organization learner', function () {
        // given
        config.dataProtectionPolicy.updateDate = new Date(Date.now() + 3600 * 1000);
        const user = new User({ lastDataProtectionPolicySeenAt: new Date(), cgu: false });

        // then
        expect(user.shouldSeeDataProtectionPolicyInformationBanner).to.be.false;
      });
    });
  });
});
