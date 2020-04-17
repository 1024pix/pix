const { expect, domainBuilder } = require('../../../test-helper');
const User = require('../../../../lib/domain/models/User');

describe('Unit | Domain | Models | User', () => {

  describe('constructor', () => {

    it('should build a user from raw JSON', () => {
      // given
      const rawData = {
        id: 1,
        firstName: 'Son',
        lastName: 'Goku',
        email: 'email@example.net',
        password: 'pix123',
        cgu: true,
        samlId: 'some-saml-id',
        shouldChangePassword: false,
      };

      // when
      const user = new User(rawData);

      // then
      expect(user.id).to.equal(1);
      expect(user.firstName).to.equal('Son');
      expect(user.lastName).to.equal('Goku');
      expect(user.email).to.equal('email@example.net');
      expect(user.password).to.equal('pix123');
      expect(user.cgu).to.be.true;
      expect(user.samlId).to.equal('some-saml-id');
      expect(user.shouldChangePassword).to.be.false;
    });

  });

  describe('the attribute "hasRolePixMaster"', () => {

    let userRawDetails;
    beforeEach(() => {
      userRawDetails = {
        id: 1,
        firstName: 'Son',
        lastName: 'Goku',
        email: 'email@example.net',
        password: 'pix123',
        cgu: true,
        pixRoles: []
      };
    });

    it('should be true if user has role PixMaster ', () => {
      // given
      userRawDetails.pixRoles = [{
        name: 'PIX_MASTER'
      }];
      const user = new User(userRawDetails);

      // when
      const hasRole = user.hasRolePixMaster;

      // then
      expect(hasRole).to.be.deep.equal(true);
    });

    it('should be false if user has role PixMaster ', () => {
      // given
      userRawDetails.pixRoles = [];

      const user = new User(userRawDetails);

      // when
      const hasRole = user.hasRolePixMaster;

      // then
      expect(hasRole).to.be.deep.equal(false);
    });
  });

  describe('isLinkedToOrganizations', () => {

    it('should be true if user has a role in an organization', () => {
      // given
      const user = domainBuilder.buildUser({
        memberships: [domainBuilder.buildMembership()]
      });

      // when/then
      expect(user.isLinkedToOrganizations()).to.be.true;
    });

    it('should be false is user has no role in no organization', () => {
      // given
      const user = new User();

      // when/then
      expect(user.isLinkedToOrganizations()).to.be.false;
    });

  });

  describe('isLinkedToCertificationCenters', () => {

    it('should be true if user has a role in a certification center', () => {
      // given
      const user = domainBuilder.buildUser({
        certificationCenterMemberships: [domainBuilder.buildCertificationCenterMembership()]
      });

      // when
      const isLinked = user.isLinkedToCertificationCenters();

      // then
      expect(isLinked).to.be.true;
    });

    it('should be false if user has no role in certification center', () => {
      // given
      const user = new User();

      // when
      const isLinked = user.isLinkedToCertificationCenters();

      // then
      expect(isLinked).to.be.false;
    });

  });

  describe('hasAccessToOrganization', () => {

    it('should be false is user has no access to no organizations', () => {
      // given
      const user = new User();
      const organizationId = 12345;

      // when/then
      expect(user.hasAccessToOrganization(organizationId)).to.be.false;
    });

    it('should be false is the user has access to many organizations, but not the one asked', () => {
      // given
      const organizationId = 12345;
      const user = domainBuilder.buildUser();
      user.memberships.push(domainBuilder.buildMembership());
      user.memberships[0].organization.id = 93472;
      user.memberships[1].organization.id = 74569;

      // when/then
      expect(user.hasAccessToOrganization(organizationId)).to.be.false;
    });

    it('should be true if the user has an access to the given organizationId', () => {
      // given
      const organizationId = 12345;
      const user = domainBuilder.buildUser();
      user.memberships[0].organization.id = 12345;

      // when/then
      expect(user.hasAccessToOrganization(organizationId)).to.be.true;
    });

  });

  describe('hasAccessToCertificationCenter', () => {

    it('should be false if user has no access to given certification center', () => {
      // given
      const user = new User();
      const certificationCenterId = 12345;

      // when/then
      expect(user.hasAccessToCertificationCenter(certificationCenterId)).to.be.false;
    });

    it('should be false if user has access to many CertificationCenters, but not the given one', () => {
      // given
      const certificationCenterId = 12345;
      const user = domainBuilder.buildUser();
      user.certificationCenterMemberships.push(domainBuilder.buildCertificationCenterMembership());
      user.certificationCenterMemberships.push(domainBuilder.buildCertificationCenterMembership());
      user.certificationCenterMemberships[0].certificationCenter.id = 93472;
      user.certificationCenterMemberships[1].certificationCenter.id = 74569;

      // when/then
      expect(user.hasAccessToCertificationCenter(certificationCenterId)).to.be.false;
    });

    it('should be true if the user has an access to the given CertificationCenterId', () => {
      // given
      const certificationCenterId = 12345;
      const user = domainBuilder.buildUser();
      user.certificationCenterMemberships.push(domainBuilder.buildCertificationCenterMembership());
      user.certificationCenterMemberships[0].certificationCenter.id = 12345;

      // when/then
      expect(user.hasAccessToCertificationCenter(certificationCenterId)).to.be.true;
    });

  });

  describe('#email', () => {

    it('should normalize email', () => {
      // given
      const userData = {
        email: 'TESTMAIL@gmail.com'
      };

      // when
      const userObject = new User(userData);

      // then
      expect(userObject.email).to.equal('testmail@gmail.com');
    });

    it('should default email to undefined', () => {
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

});
