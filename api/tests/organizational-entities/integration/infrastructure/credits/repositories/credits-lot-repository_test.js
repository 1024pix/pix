import { expect } from 'chai';

import { CreditsLot } from '../../../../../../src/organizational-entities/domain/credits/models/CreditsLot.js';
import { CreditsLotToCreate } from '../../../../../../src/organizational-entities/domain/credits/models/CreditsLotToCreate.js';
import * as creditsLotRepository from '../../../../../../src/organizational-entities/infrastructure/credits/repositories/credits-lot-repository.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';

describe('Integration | Repository | Credits Lot', function () {
  context('create', function () {
    it('should have successfully create a credits lot and return its ID', async function () {
      //given
      const { structure } = databaseBuilder.factory.buildOrganizationWithStructure();
      const createdBy = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      const creditsLotToCreate = new CreditsLotToCreate({
        structureId: structure.id,
        count: 100,
        activationDate: '2023-01-01',
        expirationDate: '2023-12-31',
        reference: 'REF123',
        createdBy,
      });

      const id = await creditsLotRepository.create(creditsLotToCreate);

      const creditsLotCreated = await knex('credits_lots').where({ id: id }).first();

      expect(creditsLotCreated.count).to.equal(100);
      expect(creditsLotCreated.activation_date).to.deep.equal(creditsLotToCreate.activationDate);
      expect(creditsLotCreated.expiration_date).to.deep.equal(creditsLotToCreate.expirationDate);
      expect(creditsLotCreated.reference).to.equal('REF123');
      expect(creditsLotCreated.created_by).to.equal(createdBy);
      expect(creditsLotCreated.created_at).to.not.be.null;
    });
  });

  context('findAllByStructureId', function () {
    it('should return an empty array if no creditsLot are found', async function () {
      // given
      const { structure } = databaseBuilder.factory.buildOrganizationWithStructure();

      // when
      const creditsLot = await creditsLotRepository.findAllByStructureId(structure.id);

      // then
      expect(creditsLot).to.be.empty;
    });

    it('should return a list of credits lot for given structure id', async function () {
      // given
      const { structure } = databaseBuilder.factory.buildOrganizationWithStructure();

      const { structure: otherStructure } = databaseBuilder.factory.buildOrganizationWithStructure();

      const creator = databaseBuilder.factory.buildUser({
        firstName: 'Bruce',
        lastName: 'Wayne',
      });

      const firstCreditsLot = databaseBuilder.factory.buildCreditsLot({
        structureId: structure.id,
        count: 100,
        reference: 'REF123',
        activationDate: '2027-01-01',
        expirationDate: '2028-01-01',
        createdAt: '2026-01-01',
        createdBy: creator.id,
      });

      const secondCreditsLot = databaseBuilder.factory.buildCreditsLot({
        structureId: structure.id,
        count: 100,
        reference: 'REF456',
        activationDate: '2027-06-01',
        expirationDate: '2028-09-01',
        createdAt: '2026-01-01',
        createdBy: creator.id,
      });

      databaseBuilder.factory.buildCreditsLot({
        structureId: otherStructure.id,
        count: 100,
        reference: 'REF789',
        activationDate: '2027-06-01',
        expirationDate: '2028-09-01',
        createdAt: '2026-01-02',
        createdBy: creator.id,
      });

      await databaseBuilder.commit();

      const expectedCreditsLot = [
        {
          id: secondCreditsLot.id,
          structureId: structure.id,
          count: 100,
          reference: 'REF456',
          activationDate: new Date('2027-06-01'),
          expirationDate: new Date('2028-09-01'),
          creatorFullName: 'Bruce Wayne',
        },
        {
          id: firstCreditsLot.id,
          structureId: structure.id,
          count: 100,
          reference: 'REF123',
          activationDate: new Date('2027-01-01'),
          expirationDate: new Date('2028-01-01'),
          creatorFullName: 'Bruce Wayne',
        },
      ];

      // when
      const foundCreditsLot = await creditsLotRepository.findAllByStructureId(structure.id);

      // then
      expect(foundCreditsLot).lengthOf(2);
      expect(foundCreditsLot[0]).to.be.instanceOf(CreditsLot);
      expect(foundCreditsLot[1]).to.be.instanceOf(CreditsLot);
      expect(foundCreditsLot).to.deep.equal(expectedCreditsLot);
    });

    it('should return credits lot ordered by activation date or expiration date', async function () {
      // given
      const { structure } = databaseBuilder.factory.buildOrganizationWithStructure();

      const creator = databaseBuilder.factory.buildUser();

      databaseBuilder.factory.buildCreditsLot({
        structureId: structure.id,
        count: 100,
        reference: 'THIRD',
        activationDate: '2026-01-01',
        expirationDate: '2027-12-31',
        createdAt: '2026-01-01',
        createdBy: creator.id,
      });
      databaseBuilder.factory.buildCreditsLot({
        structureId: structure.id,
        count: 100,
        reference: 'FIRST',
        activationDate: '2027-01-01',
        expirationDate: '2028-12-31',
        createdAt: '2026-01-02',
        createdBy: creator.id,
      });
      databaseBuilder.factory.buildCreditsLot({
        structureId: structure.id,
        count: 100,
        reference: 'SECOND',
        activationDate: '2026-01-01',
        expirationDate: '2028-12-31',
        createdAt: '2026-01-01',
        createdBy: creator.id,
      });

      await databaseBuilder.commit();

      // when
      const foundCreditsLot = await creditsLotRepository.findAllByStructureId(structure.id);

      // then
      expect(foundCreditsLot[0].reference).to.equal('FIRST');
      expect(foundCreditsLot[1].reference).to.equal('SECOND');
      expect(foundCreditsLot[2].reference).to.equal('THIRD');
    });
  });

  context('findByOrganizationIdForUpdate', function () {
    it('returns the lots of the structure carrying the organization, with their consumed count', async function () {
      // given
      const { organization, structure } = databaseBuilder.factory.buildOrganizationWithStructure();

      const creditsLotId = databaseBuilder.factory.buildCreditsLot({
        structureId: structure.id,
        count: 10,
      }).id;
      databaseBuilder.factory.buildCreditsConsumption({
        creditsLotId,
        organizationLearnerId: databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization.id }).id,
      });
      databaseBuilder.factory.buildCreditsConsumption({
        creditsLotId,
        organizationLearnerId: databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization.id }).id,
      });

      await databaseBuilder.commit();

      // when
      const creditsLots = await creditsLotRepository.findByOrganizationIdForUpdate({
        organizationId: organization.id,
      });

      // then
      expect(creditsLots).to.have.lengthOf(1);
      expect(creditsLots[0].id).to.equal(creditsLotId);
      expect(creditsLots[0].count).to.equal(10);
      expect(creditsLots[0].consumedCount).to.equal(2);
    });

    it('returns a lot never consumed with a zero count rather than undefined', async function () {
      // given
      const { organization, structure } = databaseBuilder.factory.buildOrganizationWithStructure();
      databaseBuilder.factory.buildCreditsLot({ structureId: structure.id });

      await databaseBuilder.commit();

      // when
      const creditsLots = await creditsLotRepository.findByOrganizationIdForUpdate({
        organizationId: organization.id,
      });

      // then
      expect(creditsLots[0].consumedCount).to.equal(0);
    });

    it('ignores the lots of another structure', async function () {
      // given
      const { organization } = databaseBuilder.factory.buildOrganizationWithStructure();
      databaseBuilder.factory.buildCreditsLot();

      await databaseBuilder.commit();

      // when
      const creditsLots = await creditsLotRepository.findByOrganizationIdForUpdate({
        organizationId: organization.id,
      });

      // then
      expect(creditsLots).to.be.empty;
    });
  });
});
