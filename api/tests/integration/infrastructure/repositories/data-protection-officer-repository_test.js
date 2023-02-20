import { databaseBuilder, expect, knex } from '../../../test-helper';
import DataProtectionOfficer from '../../../../lib/domain/models/DataProtectionOfficer';
import dataProtectionOfficerRepository from '../../../../lib/infrastructure/repositories/data-protection-officer-repository';

describe('Integration | Repository | data-protection-officer', function () {
  const now = new Date('2022-09-27T16:30:00Z');

  afterEach(async function () {
    await knex('data-protection-officers').delete();
  });

  describe('#batchAddDataProtectionOfficerToOrganization', function () {
    it('should add rows in the table "data-protection-officers"', async function () {
      // given
      const firstOrganization = databaseBuilder.factory.buildOrganization();
      const secondOrganization = databaseBuilder.factory.buildOrganization();

      await databaseBuilder.commit();

      const dataProtectionOfficerA = {
        firstName: 'Djamal',
        lastName: 'Dormi',
        email: 'test@example.net',
        organizationId: firstOrganization.id,
      };
      const dataProtectionOfficerB = {
        firstName: 'Alain',
        lastName: 'Terieur',
        email: 'test@example.net',
        organizationId: secondOrganization.id,
      };

      // when
      await dataProtectionOfficerRepository.batchAddDataProtectionOfficerToOrganization([
        dataProtectionOfficerA,
        dataProtectionOfficerB,
      ]);

      // then
      const foundDataProtectionOfficers = await knex('data-protection-officers').select();
      expect(foundDataProtectionOfficers.length).to.equal(2);
      expect(foundDataProtectionOfficers[0]).to.contain({
        ...dataProtectionOfficerA,
        organizationId: firstOrganization.id,
      });
      expect(foundDataProtectionOfficers[1]).to.contain({
        ...dataProtectionOfficerB,
        organizationId: secondOrganization.id,
      });
    });
  });

  describe('#create', function () {
    context('on success', function () {
      it('should return a DPO domain object', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        const organization = databaseBuilder.factory.buildOrganization({
          name: 'InYak',
          createdBy: user.id,
        });
        await databaseBuilder.commit();

        // when
        const dataProtectionOfficer = new DataProtectionOfficer({
          firstName: 'Justin',
          lastName: 'Ptipeu',
          email: 'justin.ptipeu@example.net',
          organizationId: organization.id,
        });
        const dataProtectionOfficerSaved = await dataProtectionOfficerRepository.create(dataProtectionOfficer);

        // then
        expect(dataProtectionOfficerSaved).to.be.an.instanceof(DataProtectionOfficer);
        expect(dataProtectionOfficerSaved).to.deep.equal({
          id: dataProtectionOfficerSaved.id,
          firstName: 'Justin',
          lastName: 'Ptipeu',
          email: 'justin.ptipeu@example.net',
          organizationId: organization.id,
          certificationCenterId: null,
          createdAt: dataProtectionOfficerSaved.createdAt,
          updatedAt: dataProtectionOfficerSaved.updatedAt,
        });
      });
    });
  });

  describe('#get', function () {
    context('on success', function () {
      context('when DPO exists', function () {
        it('should return a DPO domain object', async function () {
          // given
          const user = databaseBuilder.factory.buildUser();
          const organization = databaseBuilder.factory.buildOrganization({
            name: 'InYak',
            createdBy: user.id,
          });
          const dataProtectionOfficer = databaseBuilder.factory.buildDataProtectionOfficer.withOrganizationId({
            firstName: 'Justin',
            lastName: 'Ptipeu',
            email: 'justin.ptipeu@example.net',
            organizationId: organization.id,
          });
          await databaseBuilder.commit();

          // when
          const dataProtectionOfficerFound = await dataProtectionOfficerRepository.get({
            organizationId: organization.id,
          });

          // then
          expect(dataProtectionOfficerFound).to.be.an.instanceof(DataProtectionOfficer);
          expect(dataProtectionOfficerFound).to.deep.equal({
            id: dataProtectionOfficer.id,
            firstName: 'Justin',
            lastName: 'Ptipeu',
            email: 'justin.ptipeu@example.net',
            organizationId: organization.id,
            certificationCenterId: null,
            createdAt: dataProtectionOfficer.createdAt,
            updatedAt: dataProtectionOfficer.updatedAt,
          });
        });
      });

      context('when DPO does not exist', function () {
        it('should return undefined', async function () {
          // given & when
          const dataProtectionOfficerFound = await dataProtectionOfficerRepository.get({ organizationId: 1234 });

          // then
          expect(dataProtectionOfficerFound).to.be.undefined;
        });
      });
    });
  });

  describe('#update', function () {
    context('on success', function () {
      it('should return a DPO domain object', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        const organization = databaseBuilder.factory.buildOrganization({
          name: 'UruYak',
          createdBy: user.id,
        });
        const dataProtectionOfficer = databaseBuilder.factory.buildDataProtectionOfficer.withOrganizationId({
          firstName: 'Justin',
          lastName: 'Ptipeu',
          email: 'justin.ptipeu@example.net',
          organizationId: organization.id,
          createdAt: now,
          updatedAt: now,
        });
        await databaseBuilder.commit();

        // when
        const dataProtectionOfficerToUpdate = new DataProtectionOfficer({
          id: dataProtectionOfficer.id,
          firstName: '',
          lastName: '',
          email: '',
          organizationId: organization.id,
        });
        const dataProtectionOfficerSaved = await dataProtectionOfficerRepository.update(dataProtectionOfficerToUpdate);

        // then
        expect(dataProtectionOfficerSaved).to.be.an.instanceof(DataProtectionOfficer);
        expect(dataProtectionOfficerSaved).to.deep.equal({
          id: dataProtectionOfficerSaved.id,
          firstName: '',
          lastName: '',
          email: '',
          organizationId: organization.id,
          certificationCenterId: null,
          createdAt: now,
          updatedAt: dataProtectionOfficerSaved.updatedAt,
        });
      });
    });
  });
});
