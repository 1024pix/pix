import { expect, databaseBuilder, knex, sinon } from '../../test-helper.js';
import { deleteSupOrganizationLearnersDisabled } from '../../../db/migrations/20231003140113_delete-sup-organization-learners-disabled.js';

describe('Integration | Scripts | delete-sup-organization-learners-disabled', function () {
  let clock;
  let deletedById;

  const now = new Date('2023-09-10');

  beforeEach(function () {
    deletedById = databaseBuilder.factory.buildUser().id;
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  it('should not delete SCO organization learners with isDisabled TRUE', async function () {
    // given
    const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'SCO' });
    const { id: scoOrganizationLearnerDisabledId } = databaseBuilder.factory.buildOrganizationLearner({
      organizationId,
      isDisabled: true,
    });

    await databaseBuilder.commit();

    // when
    await deleteSupOrganizationLearnersDisabled(deletedById, knex);

    // then
    const organizationLearner = await knex('organization-learners')
      .where('id', scoOrganizationLearnerDisabledId)
      .first();

    expect(organizationLearner.deletedBy).to.be.null;
    expect(organizationLearner.deletedAt).to.be.null;
  });

  it('should not delete SUP organization learners with isDisabled FALSE', async function () {
    // given
    const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'SUP' });
    const { id: organizationLearnerNotDisabledId } = databaseBuilder.factory.buildOrganizationLearner({
      organizationId,
      isDisabled: false,
    });

    await databaseBuilder.commit();

    // when
    await deleteSupOrganizationLearnersDisabled(deletedById, knex);

    // then
    const organizationLearner = await knex('organization-learners')
      .where('id', organizationLearnerNotDisabledId)
      .first();

    expect(organizationLearner.deletedBy).to.be.null;
    expect(organizationLearner.deletedAt).to.be.null;
  });

  context('when learners are SUP and with isDisabled TRUE', function () {
    it('should delete campaign participations with given ids', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'SUP' });
      const { id: firstOrganizationLearnerDisabledId } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        isDisabled: true,
      });
      const { id: secondOrganizationLearnerDisabledId } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        isDisabled: true,
      });

      databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId: firstOrganizationLearnerDisabledId,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId: secondOrganizationLearnerDisabledId,
      });

      await databaseBuilder.commit();

      // when

      await deleteSupOrganizationLearnersDisabled(deletedById, knex);

      // then

      const result = await knex('campaign-participations').whereIn('organizationLearnerId', [
        firstOrganizationLearnerDisabledId,
        secondOrganizationLearnerDisabledId,
      ]);

      expect(result[0].deletedAt).to.deep.equal(new Date());
      expect(result[0].deletedBy).to.equal(deletedById);

      expect(result[1].deletedAt).to.deep.equal(new Date());
      expect(result[1].deletedBy).to.equal(deletedById);
    });

    it('should delete all SUP organization learners with isDisabled TRUE', async function () {
      // given
      const { id: firstOrganizationId } = databaseBuilder.factory.buildOrganization({ type: 'SUP' });
      const { id: secondOrganizationId } = databaseBuilder.factory.buildOrganization({ type: 'SUP' });
      const firstOrganizationLearnerDisabledId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: firstOrganizationId,
        isDisabled: true,
      }).id;
      const secondOrganizationLearnerDisabledId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: secondOrganizationId,
        isDisabled: true,
      }).id;
      await databaseBuilder.commit();

      // when
      await deleteSupOrganizationLearnersDisabled(deletedById, knex);

      // then
      const firstDeletedLearner = await knex('organization-learners')
        .where('id', firstOrganizationLearnerDisabledId)
        .first();
      const secondDeletedLearner = await knex('organization-learners')
        .where('id', secondOrganizationLearnerDisabledId)
        .first();

      expect(firstDeletedLearner.deletedBy).to.equal(deletedById);
      expect(firstDeletedLearner.deletedAt).to.deep.equal(new Date());

      expect(secondDeletedLearner.deletedBy).to.equal(deletedById);
      expect(secondDeletedLearner.deletedAt).to.deep.equal(new Date());
    });

    it('should not delete SUP organization learners already deleted', async function () {
      // given
      const otherDeletedById = databaseBuilder.factory.buildUser().id;
      const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'SUP' });
      const { id: organizationLearnerDeletedId } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        isDisabled: true,
        deletedBy: deletedById,
        deletedAt: new Date(),
      });

      await databaseBuilder.commit();

      // when
      await deleteSupOrganizationLearnersDisabled(otherDeletedById, knex);

      // then
      const organizationLearner = await knex('organization-learners').where('id', organizationLearnerDeletedId).first();

      expect(organizationLearner.deletedBy).to.equal(deletedById);
    });
  });
});
