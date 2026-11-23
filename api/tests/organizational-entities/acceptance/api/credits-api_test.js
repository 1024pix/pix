import { expect } from 'chai';

import * as creditsApi from '../../../../src/organizational-entities/application/api/credits-api.js';
import { ORGANIZATION_FEATURE } from '../../../../src/shared/constants.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';
import { catchErr } from '../../../tooling/test-utils/error.js';

describe('Acceptance | Organizational Entities | Application | credits-api', function () {
  describe('#consumeCredit', function () {
    it('charges an active lot that has capacity', async function () {
      // given
      const { organization, structure } = databaseBuilder.factory.buildOrganizationWithStructure();
      const featureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.CREDITS_MANAGEMENT).id;
      databaseBuilder.factory.buildOrganizationFeature({ organizationId: organization.id, featureId });
      const creditsLotId = databaseBuilder.factory.buildCreditsLot({ structureId: structure.id, count: 10 }).id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
      }).id;
      await databaseBuilder.commit();

      // when
      await creditsApi.consumeCredit({ organizationLearnerId, organizationId: organization.id });

      // then
      const row = await knex('credits_consumptions').where({ organization_learner_id: organizationLearnerId }).first();
      expect(row.credit_lot_id).to.equal(creditsLotId);
    });

    it('throws an error the calling context can catch when no credit is available', async function () {
      // given
      const { organization } = databaseBuilder.factory.buildOrganizationWithStructure();
      const featureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.CREDITS_MANAGEMENT).id;
      databaseBuilder.factory.buildOrganizationFeature({ organizationId: organization.id, featureId });
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
      }).id;
      await databaseBuilder.commit();

      // when
      const error = await catchErr(creditsApi.consumeCredit)({
        organizationLearnerId,
        organizationId: organization.id,
      });

      // then
      expect(error).to.be.instanceOf(creditsApi.NoCreditAvailableError);
    });
  });
});
