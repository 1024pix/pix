import { expect, databaseBuilder, catchErr } from '../../../../test-helper';
import campaignForArchivingRepository from '../../../../../lib/infrastructure/repositories/campaign/campaign-for-archiving-repository';
import Campaign from '../../../../../lib/domain/models/CampaignForArchiving';
import { NotFoundError, UserNotFoundError } from '../../../../../lib/domain/errors';

describe('Integration | Infrastructure | Repository | campaign-for-archiving-repository', function () {
  describe('#save', function () {
    it('updates the campaign', async function () {
      databaseBuilder.factory.buildCampaign({ id: 1, code: '123ABC', archivedAt: null, archivedBy: null });
      databaseBuilder.factory.buildUser({ id: 12 });
      await databaseBuilder.commit();
      const campaign = new Campaign({ id: 1, code: '123ABC', archivedAt: '2022-01-22', archivedBy: 12 });

      await campaignForArchivingRepository.save(campaign);
      const actualCampaign = await campaignForArchivingRepository.getByCode('123ABC');

      expect(actualCampaign).to.deep.equal({
        id: 1,
        code: '123ABC',
        archivedAt: new Date('2022-01-22'),
        archivedBy: 12,
      });
    });

    context('when there is several campaign', function () {
      it('updates the campaign with the correct code', async function () {
        databaseBuilder.factory.buildCampaign({ id: 1, code: 'ABC123', archivedAt: null, archivedBy: null });
        databaseBuilder.factory.buildCampaign({ id: 2, code: 'ABC456', archivedAt: null, archivedBy: null });
        databaseBuilder.factory.buildUser({ id: 12 });
        await databaseBuilder.commit();

        const campaignToArchived = new Campaign({ code: 'ABC123', archivedAt: '2022-01-22', archivedBy: 12 });

        await campaignForArchivingRepository.save(campaignToArchived);
        const campaign1 = await campaignForArchivingRepository.getByCode('ABC123');
        const campaign2 = await campaignForArchivingRepository.getByCode('ABC456');

        expect(campaign1).to.deep.equal({ id: 1, code: 'ABC123', archivedAt: new Date('2022-01-22'), archivedBy: 12 });
        expect(campaign2).to.deep.equal({ id: 2, code: 'ABC456', archivedAt: null, archivedBy: null });
      });
    });

    context('when the user does not exist', function () {
      it('updates the campaign with the correct code', async function () {
        databaseBuilder.factory.buildCampaign({ id: 1, code: 'ABC123', archivedAt: null, archivedBy: null });
        await databaseBuilder.commit();

        const campaignToArchived = new Campaign({ code: 'ABC123', archivedAt: '2022-01-22', archivedBy: 12 });

        const error = await catchErr(campaignForArchivingRepository.save)(campaignToArchived);

        expect(error).to.be.an.instanceOf(UserNotFoundError);
      });
    });
  });

  describe('#getByCode', function () {
    it('find the campaign with the correct code', async function () {
      databaseBuilder.factory.buildCampaign({ id: 1, code: '123ABC', archivedAt: null, archivedBy: null });
      databaseBuilder.factory.buildUser({ id: 12 });
      await databaseBuilder.commit();

      const actualCampaign = await campaignForArchivingRepository.getByCode('123ABC');

      expect(actualCampaign).to.deep.equal({ id: 1, code: '123ABC', archivedAt: null, archivedBy: null });
    });

    context('when there the campaign does not exists', function () {
      it('throws an error', async function () {
        const error = await catchErr(campaignForArchivingRepository.getByCode)('ABC123');

        expect(error).to.be.an.instanceOf(NotFoundError);
      });
    });
  });

  describe('#get', function () {
    it('find the campaign with the correct id', async function () {
      databaseBuilder.factory.buildCampaign({ id: 2, code: '123ABC', archivedAt: null, archivedBy: null });
      databaseBuilder.factory.buildUser({ id: 12 });
      await databaseBuilder.commit();

      const actualCampaign = await campaignForArchivingRepository.get(2);

      expect(actualCampaign).to.deep.equal({ id: 2, code: '123ABC', archivedAt: null, archivedBy: null });
    });

    context('when there the campaign does not exists', function () {
      it('throws an error', async function () {
        const error = await catchErr(campaignForArchivingRepository.get)(1);

        expect(error).to.be.an.instanceOf(NotFoundError);
      });
    });
  });
});
