import { expect } from 'chai';
import sinon from 'sinon';

import { RedirectCampaignsToTunnelScript } from '../../../../src/quest/scripts/redirect-campaigns-to-tunnel.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

describe('RedirectCampaignsToTunnelScript', function () {
  let script;
  beforeEach(function () {
    script = new RedirectCampaignsToTunnelScript();
  });

  describe('Options', function () {
    it('has the correct options', function () {
      const { options } = script.metaInfo;

      expect(options.dryRun).to.deep.include({
        type: 'boolean',
        default: false,
      });
    });
  });

  describe('Handle', function () {
    describe('dry run false', function () {
      let campaign1, campaign2, campaign3, campaign4, campaign5, loggerStub;
      beforeEach(async function () {
        loggerStub = { info: sinon.spy(), error: sinon.spy() };
        campaign1 = await databaseBuilder.factory.buildCampaign({
          customResultPageButtonUrl: '/parcours/COMBINIX1',
        });
        campaign2 = await databaseBuilder.factory.buildCampaign({
          customResultPageButtonUrl: '/parcours/COMBINIX1/chargement',
        });
        campaign3 = await databaseBuilder.factory.buildCampaign({
          customResultPageButtonUrl: '/parcours-etudiant',
        });
        campaign4 = await databaseBuilder.factory.buildCampaign({ customResultPageButtonUrl: '/random' });
        campaign5 = await databaseBuilder.factory.buildCampaign({ customResultPageButtonUrl: undefined });
        await databaseBuilder.commit();
      });

      it('should update the correct campaigns', async function () {
        //given&when

        await script.handle({
          options: { dryRun: false },
          logger: loggerStub,
        });

        //then
        const campaign1Result = await knex('campaigns').where('id', campaign1.id).first();
        expect(campaign1Result.customResultPageButtonUrl).to.equal('/parcours/COMBINIX1/checkpoint');

        const campaign2Result = await knex('campaigns').where('id', campaign2.id).first();
        expect(campaign2Result.customResultPageButtonUrl).to.equal(campaign2.customResultPageButtonUrl);

        const campaign3Result = await knex('campaigns').where('id', campaign3.id).first();
        expect(campaign3Result.customResultPageButtonUrl).to.equal(campaign3.customResultPageButtonUrl);

        const campaign4Result = await knex('campaigns').where('id', campaign4.id).first();
        expect(campaign4Result.customResultPageButtonUrl).to.equal(campaign4.customResultPageButtonUrl);

        const campaign5Result = await knex('campaigns').where('id', campaign5.id).first();
        expect(campaign5Result.customResultPageButtonUrl).to.equal(campaign5.customResultPageButtonUrl);
      });
    });
    describe('dry run true', function () {
      let campaign1, campaign2, loggerStub;
      beforeEach(async function () {
        loggerStub = { info: sinon.spy(), error: sinon.spy() };
        campaign1 = await databaseBuilder.factory.buildCampaign({
          customResultPageButtonUrl: '/parcours/COMBINIX1',
        });
        campaign2 = await databaseBuilder.factory.buildCampaign({
          customResultPageButtonUrl: '/parcours/COMBINIX1/chargement',
        });
        await databaseBuilder.commit();
      });

      it('should not update the campaigns', async function () {
        await script.handle({
          options: { dryRun: true },
          logger: loggerStub,
        });

        //then
        const campaign1Result = await knex('campaigns').where('id', campaign1.id).first();
        expect(campaign1Result.customResultPageButtonUrl).to.equal(campaign1.customResultPageButtonUrl);

        const campaign2Result = await knex('campaigns').where('id', campaign2.id).first();
        expect(campaign2Result.customResultPageButtonUrl).to.equal(campaign2.customResultPageButtonUrl);
      });
    });
  });
});
