const { expect, databaseBuilder, catchErr } = require('../../../test-helper');
const faker = require('faker');
const bcrypt = require('bcrypt');

const { UserNotFoundError } = require('../../../../lib/domain/errors');
const prescriberRepository = require('../../../../lib/infrastructure/repositories/prescriber-repository');
const Prescriber = require('../../../../lib/domain/read-models/Prescriber');
const Membership = require('../../../../lib/domain/models/Membership');
const UserOrgaSettings = require('../../../../lib/domain/models/UserOrgaSettings');
const Organization = require('../../../../lib/domain/models/Organization');

describe('Integration | Infrastructure | Repository | UserRepository', () => {

  const userToInsert = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.exampleEmail().toLowerCase(),
    password: bcrypt.hashSync('A124B2C3#!', 1),
    cgu: true,
    samlId: 'some-saml-id',
    shouldChangePassword: false,
  };

  let user;
  let organization;
  let membership;
  let userOrgaSettings;

  describe('#getPrescriber', () => {

    let expectedPrescriber;

    beforeEach(async () => {
      user = databaseBuilder.factory.buildUser(userToInsert);
      organization = databaseBuilder.factory.buildOrganization();
      membership = databaseBuilder.factory.buildMembership({
        userId: user.id,
        organizationId: organization.id,
      });
      userOrgaSettings = databaseBuilder.factory.buildUserOrgaSettings({
        userId: user.id, currentOrganizationId: organization.id
      });

      await databaseBuilder.commit();

      expectedPrescriber = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        pixOrgaTermsOfServiceAccepted: user.pixOrgaTermsOfServiceAccepted,
      };
    });

    it('should return the found prescriber', async () => {
      // when
      const foundPrescriber = await prescriberRepository.getPrescriber(user.id);

      // then
      expect(foundPrescriber).to.be.an.instanceOf(Prescriber);
      expect(foundPrescriber.id).to.equal(expectedPrescriber.id);
      expect(foundPrescriber.firstName).to.equal(expectedPrescriber.firstName);
      expect(foundPrescriber.lastName).to.equal(expectedPrescriber.lastName);
      expect(foundPrescriber.pixOrgaTermsOfServiceAccepted).to.equal(expectedPrescriber.pixOrgaTermsOfServiceAccepted);
    });

    it('should return a UserNotFoundError if no user is found', async () => {
      // given
      const nonExistentUserId = 678;

      // when
      const result = await catchErr(prescriberRepository.getPrescriber)(nonExistentUserId);

      // then
      expect(result).to.be.instanceOf(UserNotFoundError);
    });

    it('should return memberships associated to the prescriber', async () => {
      // given
      expectedPrescriber.memberships = [membership];

      // when
      const foundPrescriber = await prescriberRepository.getPrescriber(user.id);

      // then
      const firstMembership = foundPrescriber.memberships[0];
      expect(firstMembership).to.be.an.instanceof(Membership);
      expect(firstMembership.id).to.equal(expectedPrescriber.memberships[0].id);

      const associatedOrganization = firstMembership.organization;
      expect(associatedOrganization).to.be.an.instanceof(Organization);
      expect(associatedOrganization.id).to.equal(organization.id);
      expect(associatedOrganization.code).to.equal(organization.code);
      expect(associatedOrganization.name).to.equal(organization.name);
      expect(associatedOrganization.type).to.equal(organization.type);
    });

    context('when the membership associated to the prescriber has been disabled', () => {

      it('should not return membership', async () => {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildMembership({ userId, organizationId, disabledAt: new Date() });
        await databaseBuilder.commit();

        // when
        const foundPrescriber = await prescriberRepository.getPrescriber(userId);

        // then
        expect(foundPrescriber.memberships).to.be.empty;
      });
    });

    it('should return user-orga-settings associated to the prescriber', async () => {
      // given
      expectedPrescriber.userOrgaSettings = userOrgaSettings;

      // when
      const foundUser = await prescriberRepository.getPrescriber(user.id);

      // then
      expect(foundUser.userOrgaSettings).to.be.an.instanceOf(UserOrgaSettings);
      expect(foundUser.userOrgaSettings.id).to.equal(expectedPrescriber.userOrgaSettings.id);
      expect(foundUser.userOrgaSettings.currentOrganization.id).to.equal(expectedPrescriber.userOrgaSettings.currentOrganizationId);
    });

    it('should return prescriber despite that user-orga-settings does not exists', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({ userId, organizationId });

      await databaseBuilder.commit();

      // when
      const foundPrescriber = await prescriberRepository.getPrescriber(userId);

      // then
      expect(foundPrescriber).to.be.an.instanceOf(Prescriber);
    });
  });

});
