const { expect, databaseBuilder, catchErr } = require('../../../test-helper');
const bcrypt = require('bcrypt');
const settings = require('../../../../lib/config');

const { ForbiddenAccess, UserNotFoundError } = require('../../../../lib/domain/errors');
const prescriberRepository = require('../../../../lib/infrastructure/repositories/prescriber-repository');
const Prescriber = require('../../../../lib/domain/read-models/Prescriber');
const Membership = require('../../../../lib/domain/models/Membership');
const UserOrgaSettings = require('../../../../lib/domain/models/UserOrgaSettings');
const Organization = require('../../../../lib/domain/models/Organization');
const Tag = require('../../../../lib/domain/models/Tag');

describe('Integration | Infrastructure | Repository | Prescriber', function () {
  const userToInsert = {
    firstName: 'estelle',
    lastName: 'popopo',
    email: 'estelle.popopo@example.net',
    lang: 'someSuperCoolLanguage',
    /* eslint-disable-next-line no-sync, mocha/no-setup-in-describe */
    password: bcrypt.hashSync('A124B2C3#!', 1),
    cgu: true,
    samlId: 'some-saml-id',
    shouldChangePassword: false,
  };

  let user;
  let organization;
  let membership;
  let userOrgaSettings;

  describe('#getPrescriber', function () {
    let expectedPrescriber;

    context('when user is not a prescriber', function () {
      it('should throw a ForbiddenAccess error', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();

        // when
        const error = await catchErr(prescriberRepository.getPrescriber)(userId);

        // then
        expect(error).to.be.an.instanceOf(ForbiddenAccess);
      });
    });

    context('when user is a prescriber', function () {
      beforeEach(async function () {
        user = databaseBuilder.factory.buildUser(userToInsert);
        organization = databaseBuilder.factory.buildOrganization();
        membership = databaseBuilder.factory.buildMembership({
          id: 3000001,
          userId: user.id,
          organizationId: organization.id,
        });
        userOrgaSettings = databaseBuilder.factory.buildUserOrgaSettings({
          userId: user.id,
          currentOrganizationId: organization.id,
        });

        await databaseBuilder.commit();

        expectedPrescriber = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          pixOrgaTermsOfServiceAccepted: user.pixOrgaTermsOfServiceAccepted,
          lang: user.lang,
        };
      });

      it('should return the found prescriber', async function () {
        // when
        const foundPrescriber = await prescriberRepository.getPrescriber(user.id);

        // then
        expect(foundPrescriber).to.be.an.instanceOf(Prescriber);
        expect(foundPrescriber.id).to.equal(expectedPrescriber.id);
        expect(foundPrescriber.firstName).to.equal(expectedPrescriber.firstName);
        expect(foundPrescriber.lastName).to.equal(expectedPrescriber.lastName);
        expect(foundPrescriber.pixOrgaTermsOfServiceAccepted).to.equal(
          expectedPrescriber.pixOrgaTermsOfServiceAccepted
        );
        expect(foundPrescriber.lang).to.equal(expectedPrescriber.lang);
      });

      it('should return a UserNotFoundError if no user is found', async function () {
        // given
        const nonExistentUserId = 678;

        // when
        const result = await catchErr(prescriberRepository.getPrescriber)(nonExistentUserId);

        // then
        expect(result).to.be.instanceOf(UserNotFoundError);
      });

      it('should return memberships associated to the prescriber', async function () {
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
        expect(associatedOrganization.credit).to.equal(organization.credit);
        expect(associatedOrganization.name).to.equal(organization.name);
        expect(associatedOrganization.type).to.equal(organization.type);
      });

      it('should return memberships ordered by id', async function () {
        // given
        const anotherMembership = databaseBuilder.factory.buildMembership({ id: 3000000, userId: user.id });
        expectedPrescriber.memberships = [membership, anotherMembership];
        await databaseBuilder.commit();

        // when
        const foundPrescriber = await prescriberRepository.getPrescriber(user.id);

        // then
        expect(foundPrescriber.memberships[0].id).to.equal(3000000);
        expect(foundPrescriber.memberships[1].id).to.equal(3000001);
      });

      it('should return user-orga-settings associated to the prescriber', async function () {
        // given
        expectedPrescriber.userOrgaSettings = userOrgaSettings;

        // when
        const foundUser = await prescriberRepository.getPrescriber(user.id);

        // then
        expect(foundUser.userOrgaSettings).to.be.an.instanceOf(UserOrgaSettings);
        expect(foundUser.userOrgaSettings.id).to.equal(expectedPrescriber.userOrgaSettings.id);
        expect(foundUser.userOrgaSettings.currentOrganization.id).to.equal(
          expectedPrescriber.userOrgaSettings.currentOrganizationId
        );
      });

      context('when current organization defined in user-orga-settings has tags', function () {
        it('should return a list of tags', async function () {
          // given
          const tag1 = databaseBuilder.factory.buildTag({ name: 'AGRICULTURE' });
          databaseBuilder.factory.buildOrganizationTag({ organizationId: organization.id, tagId: tag1.id });
          const tag2 = databaseBuilder.factory.buildTag({ name: 'OTHER' });
          databaseBuilder.factory.buildOrganizationTag({ organizationId: organization.id, tagId: tag2.id });

          await databaseBuilder.commit();

          // when
          const foundPrescriber = await prescriberRepository.getPrescriber(user.id);

          // then
          expect(foundPrescriber.userOrgaSettings.currentOrganization.tags.map((tag) => tag.name)).to.have.members([
            'OTHER',
            'AGRICULTURE',
          ]);
          expect(foundPrescriber.userOrgaSettings.currentOrganization.tags[0]).to.be.instanceOf(Tag);
        });
      });

      describe('#areNewYearOrganizationLearnersImported', function() {
        context('when newYearOrganizationLearnersImportDate is defined in the env.', function () {
          let originalEnvValue;
          beforeEach(function () {
            originalEnvValue = settings.features.newYearOrganizationLearnersImportDate;
            settings.features.newYearOrganizationLearnersImportDate = '2020-08-15T00:00:00Z';
          });

          afterEach(function () {
            settings.features.newYearOrganizationLearnersImportDate = originalEnvValue;
          });

          it('should return areNewYearOrganizationLearnersImported as true if there is at least one organization-learners created after the date in the env. for the organization', async function () {
            // given
            const userId = databaseBuilder.factory.buildUser().id;
            const organizationId = databaseBuilder.factory.buildOrganization().id;
            databaseBuilder.factory.buildMembership({ userId, organizationId });
            databaseBuilder.factory.buildUserOrgaSettings({ userId, currentOrganizationId: organizationId });
            databaseBuilder.factory.buildOrganizationLearner({ organizationId, createdAt: new Date('2020-08-17') });
            await databaseBuilder.commit();

            // when
            const foundPrescriber = await prescriberRepository.getPrescriber(userId);

            // then
            expect(foundPrescriber.areNewYearOrganizationLearnersImported).to.be.true;
          });
        });

        context('when newYearOrganizationLearnersImportDate is not defined in the env.', function () {
          let originalEnvValue;
          beforeEach(function () {
            originalEnvValue = settings.features.newYearOrganizationLearnersImportDate;
            settings.features.newYearOrganizationLearnersImportDate = null;
          });

          afterEach(function () {
            settings.features.newYearOrganizationLearnersImportDate = originalEnvValue;
          });

          it('should return areNewYearOrganizationLearnersImported as true if there is at least one organization-learners created for the organization', async function () {
            // given
            const userId = databaseBuilder.factory.buildUser().id;
            const organizationId = databaseBuilder.factory.buildOrganization().id;
            databaseBuilder.factory.buildMembership({ userId, organizationId });
            databaseBuilder.factory.buildUserOrgaSettings({ userId, currentOrganizationId: organizationId });
            databaseBuilder.factory.buildOrganizationLearner({ organizationId });
            await databaseBuilder.commit();

            // when
            const foundPrescriber = await prescriberRepository.getPrescriber(userId);

            // then
            expect(foundPrescriber.areNewYearOrganizationLearnersImported).to.be.true;
          });
        });

        context('when there is no organization-learners created for the organization of the user-orga-settings', function () {
          let originalEnvValue;
          beforeEach(function () {
            originalEnvValue = settings.features.newYearOrganizationLearnersImportDate;
            settings.features.newYearOrganizationLearnersImportDate = '2020-08-15T00:00:00Z';
          });
  
          afterEach(function () {
            settings.features.newYearOrganizationLearnersImportDate = originalEnvValue;
          });
  
          it('should return areNewYearOrganizationLearnersImported as false', async function () {
            // given
            const userId = databaseBuilder.factory.buildUser().id;
            const organizationId = databaseBuilder.factory.buildOrganization().id;
            databaseBuilder.factory.buildMembership({ userId, organizationId });
            databaseBuilder.factory.buildUserOrgaSettings({ userId, currentOrganizationId: organizationId });
            databaseBuilder.factory.buildOrganizationLearner({ organizationId, createdAt: new Date('2020-07-17') });
            await databaseBuilder.commit();
  
            // when
            const foundPrescriber = await prescriberRepository.getPrescriber(userId);
  
            // then
            expect(foundPrescriber.areNewYearOrganizationLearnersImported).to.be.false;
          });
        });
      });
    });
  });
});
