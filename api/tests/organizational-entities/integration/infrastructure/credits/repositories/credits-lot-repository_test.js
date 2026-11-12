import { expect } from 'chai';

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
});
