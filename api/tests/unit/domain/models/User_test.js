const { expect, domainBuilder } = require('../../../test-helper');

const User = require('../../../../lib/domain/models/User');

describe('Unit | Domain | Models | User', function () {
  describe('constructor', function () {
    it('should build a user from raw JSON', function () {
      // given
      const rawData = {
        id: 1,
        firstName: 'Son',
        lastName: 'Goku',
        email: 'email@example.net',
        cgu: true,
        lastTermsOfServiceValidatedAt: '2020-05-04T13:40:00.000Z',
        mustValidateTermsOfService: true,
        isAnonymous: false,
      };

      // when
      const user = new User(rawData);

      // then
      expect(user.id).to.equal(rawData.id);
      expect(user.firstName).to.equal(rawData.firstName);
      expect(user.lastName).to.equal(rawData.lastName);
      expect(user.email).to.equal(rawData.email);
      expect(user.cgu).to.equal(rawData.cgu);
      expect(user.lastTermsOfServiceValidatedAt).to.equal(rawData.lastTermsOfServiceValidatedAt);
      expect(user.mustValidateTermsOfService).to.equal(rawData.mustValidateTermsOfService);
      expect(user.isAnonymous).to.equal(rawData.isAnonymous);
    });
  });

  describe('the attribute "hasRoleSuperAdmin"', function () {
    let userRawDetails;

    beforeEach(function () {
      userRawDetails = {
        id: 1,
        firstName: 'Son',
        lastName: 'Goku',
        email: 'email@example.net',
        password: 'pix123',
        cgu: true,
        pixAdminRoles: [],
      };
    });

    it('should be true if user has role SUPER_ADMIN', function () {
      // given
      userRawDetails.pixAdminRoles = [
        {
          role: 'SUPER_ADMIN',
        },
      ];
      const user = new User(userRawDetails);

      // when
      const hasRole = user.hasRoleSuperAdmin;

      // then
      expect(hasRole).to.be.true;
    });

    it('should be false if user has notrole SUPER_ADMIN ', function () {
      // given
      userRawDetails.pixAdminRoles = [];

      const user = new User(userRawDetails);

      // when
      const hasRole = user.hasRoleSuperAdmin;

      // then
      expect(hasRole).to.be.false;
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
});
