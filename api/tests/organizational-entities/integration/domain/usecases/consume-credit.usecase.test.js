import { expect } from 'chai';

import { NoCreditAvailableError } from '../../../../../src/organizational-entities/domain/errors.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/constants.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Organizational Entities | Domain | UseCase | consume-credit', function () {
  context('when the organization is not in credits mode', function () {
    it('does nothing', async function () {
      // given
      const { organization, structure } = databaseBuilder.factory.buildOrganizationWithStructure();
      databaseBuilder.factory.buildCreditsLot({ structureId: structure.id, count: 10 });
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
      }).id;
      await databaseBuilder.commit();

      // when
      await usecases.consumeCredit({ organizationLearnerId, organizationId: organization.id });

      // then
      const consumptions = await knex('credits_consumptions');
      expect(consumptions).to.be.empty;
    });
  });

  context('when an active lot has capacity', function () {
    it('charges the lot expiring first', async function () {
      // given
      const { organization, structure } = databaseBuilder.factory.buildOrganizationWithStructure();
      const featureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.CREDITS_MANAGEMENT).id;
      databaseBuilder.factory.buildOrganizationFeature({ organizationId: organization.id, featureId });
      const expiringLater = databaseBuilder.factory.buildCreditsLot({
        structureId: structure.id,
        expirationDate: new Date('2999-12-31'),
      }).id;
      const expiringFirst = databaseBuilder.factory.buildCreditsLot({
        structureId: structure.id,
        expirationDate: new Date('2100-01-01'),
      }).id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
      }).id;
      await databaseBuilder.commit();

      // when
      await usecases.consumeCredit({ organizationLearnerId, organizationId: organization.id });

      // then
      const consumptions = await knex('credits_consumptions');
      expect(consumptions).to.have.lengthOf(1);
      expect(consumptions[0].credit_lot_id).to.equal(expiringFirst);
      expect(consumptions[0].credit_lot_id).to.not.equal(expiringLater);
    });

    it('skips a full lot and charges the next one expiring', async function () {
      // given
      const { organization, structure } = databaseBuilder.factory.buildOrganizationWithStructure();
      const featureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.CREDITS_MANAGEMENT).id;
      databaseBuilder.factory.buildOrganizationFeature({ organizationId: organization.id, featureId });
      const fullButExpiringFirst = databaseBuilder.factory.buildCreditsLot({
        structureId: structure.id,
        count: 1,
        expirationDate: new Date('2100-01-01'),
      }).id;
      databaseBuilder.factory.buildCreditsConsumption({
        creditsLotId: fullButExpiringFirst,
        organizationLearnerId: databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization.id }).id,
      });
      const expiringLater = databaseBuilder.factory.buildCreditsLot({
        structureId: structure.id,
        expirationDate: new Date('2999-12-31'),
      }).id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
      }).id;
      await databaseBuilder.commit();

      // when
      await usecases.consumeCredit({ organizationLearnerId, organizationId: organization.id });

      // then
      const consumption = await knex('credits_consumptions')
        .where({ organization_learner_id: organizationLearnerId })
        .first();
      expect(consumption.credit_lot_id).to.equal(expiringLater);
    });

    it('ignores the lots of another organization', async function () {
      // given
      const { organization } = databaseBuilder.factory.buildOrganizationWithStructure();
      const featureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.CREDITS_MANAGEMENT).id;
      databaseBuilder.factory.buildOrganizationFeature({ organizationId: organization.id, featureId });
      databaseBuilder.factory.buildCreditsLot({ count: 10 });
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
      }).id;
      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.consumeCredit)({
        organizationLearnerId,
        organizationId: organization.id,
      });

      // then
      expect(error).to.be.instanceOf(NoCreditAvailableError);
    });
  });

  context('when the learner already holds a credit', function () {
    it('does not consume a second one on an active lot', async function () {
      // given
      const { organization, structure } = databaseBuilder.factory.buildOrganizationWithStructure();
      const featureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.CREDITS_MANAGEMENT).id;
      databaseBuilder.factory.buildOrganizationFeature({ organizationId: organization.id, featureId });
      const creditsLotId = databaseBuilder.factory.buildCreditsLot({ structureId: structure.id, count: 10 }).id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
      }).id;
      databaseBuilder.factory.buildCreditsConsumption({ creditsLotId, organizationLearnerId });
      await databaseBuilder.commit();

      // when
      await usecases.consumeCredit({ organizationLearnerId, organizationId: organization.id });

      // then
      const consumptions = await knex('credits_consumptions').where({
        organization_learner_id: organizationLearnerId,
      });
      expect(consumptions).to.have.lengthOf(1);
    });

    it('charges a new lot if the previous one is expired', async function () {
      // given
      const { organization, structure } = databaseBuilder.factory.buildOrganizationWithStructure();
      const featureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.CREDITS_MANAGEMENT).id;
      databaseBuilder.factory.buildOrganizationFeature({ organizationId: organization.id, featureId });
      const expiredLotId = databaseBuilder.factory.buildCreditsLot({
        structureId: structure.id,
        activationDate: new Date('2020-01-01'),
        expirationDate: new Date('2021-01-01'),
      }).id;
      const activeLotId = databaseBuilder.factory.buildCreditsLot({ structureId: structure.id, count: 10 }).id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
      }).id;
      databaseBuilder.factory.buildCreditsConsumption({ creditsLotId: expiredLotId, organizationLearnerId });
      await databaseBuilder.commit();

      // when
      await usecases.consumeCredit({ organizationLearnerId, organizationId: organization.id });

      // then
      const consumptions = await knex('credits_consumptions').where({
        organization_learner_id: organizationLearnerId,
      });
      expect(consumptions.map(({ credit_lot_id }) => credit_lot_id)).to.have.members([expiredLotId, activeLotId]);
    });
  });

  context('when no active lot has capacity', function () {
    it('throws rather than letting the organization go over its credits', async function () {
      // given
      const { organization, structure } = databaseBuilder.factory.buildOrganizationWithStructure();
      const featureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.CREDITS_MANAGEMENT).id;
      databaseBuilder.factory.buildOrganizationFeature({ organizationId: organization.id, featureId });
      const creditsLotId = databaseBuilder.factory.buildCreditsLot({ structureId: structure.id, count: 1 }).id;
      databaseBuilder.factory.buildCreditsConsumption({
        creditsLotId,
        organizationLearnerId: databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization.id }).id,
      });
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
      }).id;
      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.consumeCredit)({
        organizationLearnerId,
        organizationId: organization.id,
      });

      // then
      expect(error).to.be.instanceOf(NoCreditAvailableError);
      expect(error.meta).to.deep.equal({ organizationId: organization.id, organizationLearnerId });

      const consumptions = await knex('credits_consumptions').where({
        organization_learner_id: organizationLearnerId,
      });
      expect(consumptions).to.be.empty;
    });

    it('throws when the only lot has not started yet', async function () {
      // given
      const { organization, structure } = databaseBuilder.factory.buildOrganizationWithStructure();
      const featureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.CREDITS_MANAGEMENT).id;
      databaseBuilder.factory.buildOrganizationFeature({ organizationId: organization.id, featureId });
      databaseBuilder.factory.buildCreditsLot({
        structureId: structure.id,
        activationDate: new Date('2100-01-01'),
        expirationDate: new Date('2999-12-31'),
      });
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
      }).id;
      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.consumeCredit)({
        organizationLearnerId,
        organizationId: organization.id,
      });

      // then
      expect(error).to.be.instanceOf(NoCreditAvailableError);
    });

    it('throws when the organization has no lot at all', async function () {
      // given
      const { organization } = databaseBuilder.factory.buildOrganizationWithStructure();
      const featureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.CREDITS_MANAGEMENT).id;
      databaseBuilder.factory.buildOrganizationFeature({ organizationId: organization.id, featureId });
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
      }).id;
      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.consumeCredit)({
        organizationLearnerId,
        organizationId: organization.id,
      });

      // then
      expect(error).to.be.instanceOf(NoCreditAvailableError);
    });
  });
});
