import { expect } from 'chai';

import * as creditsConsumptionRepository from '../../../../../../src/organizational-entities/infrastructure/credits/repositories/credits-consumption-repository.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';

describe('Integration | Organizational Entities | Infrastructure | Repository | credits-consumption', function () {
  describe('#save', function () {
    it('writes one consumption for the learner on the given lot', async function () {
      // given
      const { organization, structure } = databaseBuilder.factory.buildOrganizationWithStructure();
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
      }).id;
      const creditsLotId = databaseBuilder.factory.buildCreditsLot({ structureId: structure.id }).id;
      await databaseBuilder.commit();

      // when
      await creditsConsumptionRepository.save({ organizationLearnerId, creditsLotId });

      // then
      const row = await knex('credits_consumptions').where({ credit_lot_id: creditsLotId }).first();
      expect(row.organization_learner_id).to.equal(organizationLearnerId);
      expect(row.consumed_at).to.not.be.null;
    });
  });

  describe('#hasConsumptionOnLots', function () {
    it('returns true when the learner already consumed on one of the lots', async function () {
      // given
      const { organization, structure } = databaseBuilder.factory.buildOrganizationWithStructure();
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
      }).id;
      const creditsLotId = databaseBuilder.factory.buildCreditsLot({ structureId: structure.id }).id;
      const otherCreditsLotId = databaseBuilder.factory.buildCreditsLot({ structureId: structure.id }).id;
      databaseBuilder.factory.buildCreditsConsumption({ creditsLotId, organizationLearnerId });
      await databaseBuilder.commit();

      // when
      const hasConsumption = await creditsConsumptionRepository.hasConsumptionOnLots({
        organizationLearnerId,
        creditsLotIds: [otherCreditsLotId, creditsLotId],
      });

      // then
      expect(hasConsumption).to.be.true;
    });

    it('returns false when the learner only consumed on another lot', async function () {
      // given
      const { organization, structure } = databaseBuilder.factory.buildOrganizationWithStructure();
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
      }).id;
      const creditsLotId = databaseBuilder.factory.buildCreditsLot({ structureId: structure.id }).id;
      const otherCreditsLotId = databaseBuilder.factory.buildCreditsLot({ structureId: structure.id }).id;
      databaseBuilder.factory.buildCreditsConsumption({ creditsLotId, organizationLearnerId });
      await databaseBuilder.commit();

      // when
      const hasConsumption = await creditsConsumptionRepository.hasConsumptionOnLots({
        organizationLearnerId,
        creditsLotIds: [otherCreditsLotId],
      });

      // then
      expect(hasConsumption).to.be.false;
    });

    it('returns false when there is no active lot', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
      await databaseBuilder.commit();

      // when
      const hasConsumption = await creditsConsumptionRepository.hasConsumptionOnLots({
        organizationLearnerId,
        creditsLotIds: [],
      });

      // then
      expect(hasConsumption).to.be.false;
    });
  });
});
