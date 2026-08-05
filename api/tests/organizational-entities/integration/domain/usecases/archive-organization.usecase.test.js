import dayjs from 'dayjs';
import sinon from 'sinon';

import { ArchiveOrganizationError } from '../../../../../src/organizational-entities/domain/errors.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Organizational Entities | Domain | UseCase | archive-organization', function () {
  context('when the organization does exist', function () {
    context('when there is no active places lot', function () {
      it('archives the organization', async function () {
        // given
        const now = new Date('2022-02-22');
        const clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
        const superAdminUser = databaseBuilder.factory.buildUser.withRole();
        const organization = databaseBuilder.factory.buildOrganization();
        await databaseBuilder.commit();

        // when
        const archivedOrganization = await usecases.archiveOrganization({
          organizationId: organization.id,
          userId: superAdminUser.id,
        });

        // then
        expect(archivedOrganization.archivedAt).to.deep.equal(now);
        expect(archivedOrganization.archivistFirstName).to.deep.equal(superAdminUser.firstName);
        expect(archivedOrganization.archivistLastName).to.deep.equal(superAdminUser.lastName);

        clock.restore();
      });

      it('deletes the active campaigns of the organization', async function () {
        // given
        const now = new Date('2022-02-02');
        const clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
        const previousDate = new Date('2021-01-01');
        const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;

        databaseBuilder.factory.buildCampaign({ organizationId });
        databaseBuilder.factory.buildCampaign({ organizationId });
        databaseBuilder.factory.buildCampaign({ organizationId, archivedAt: previousDate });
        databaseBuilder.factory.buildCampaign({ organizationId, deletedAt: previousDate });

        await databaseBuilder.commit();

        // when
        await usecases.archiveOrganization({ organizationId, userId: superAdminUserId });

        // then
        const activeCampaigns = await knex('campaigns').whereNull('deletedAt');
        expect(activeCampaigns).to.have.lengthOf(0);

        const newlyDeletedCampaigns = await knex('campaigns').where({ deletedAt: now });
        expect(newlyDeletedCampaigns).to.have.lengthOf(3);

        const previouslyArchivedCampaigns = await knex('campaigns').where({ archivedAt: previousDate });
        expect(previouslyArchivedCampaigns).to.have.lengthOf(1);

        clock.restore();
      });

      it('deletes the organization learners', async function () {
        // given
        const now = new Date('2022-02-02');
        const clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
        const previousDate = new Date('2021-01-01');
        const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;

        databaseBuilder.factory.buildCampaign({ organizationId });
        databaseBuilder.factory.buildOrganizationLearner({ organizationId });
        databaseBuilder.factory.buildOrganizationLearner({ organizationId });
        databaseBuilder.factory.buildOrganizationLearner({ organizationId, deletedAt: previousDate });

        await databaseBuilder.commit();

        // when
        await usecases.archiveOrganization({ organizationId, userId: superAdminUserId });

        // then
        const activeLearners = await knex('organization-learners').whereNull('deletedAt');
        expect(activeLearners).to.have.lengthOf(0);

        const newlyDeletedLearners = await knex('organization-learners').where({ deletedAt: now });
        expect(newlyDeletedLearners).to.have.lengthOf(2);

        const previouslyDeletedLearners = await knex('organization-learners').where({ deletedAt: previousDate });
        expect(previouslyDeletedLearners).to.have.lengthOf(1);

        clock.restore();
      });

      it('deletes the campaign participations of the organization', async function () {
        // given
        const now = new Date('2022-02-02');
        const clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
        const previousDate = new Date('2021-01-01');
        const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaign = databaseBuilder.factory.buildCampaign({ organizationId });

        databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id, deletedAt: previousDate });

        await databaseBuilder.commit();

        // when
        await usecases.archiveOrganization({ organizationId, userId: superAdminUserId });

        // then
        const activeParticipations = await knex('campaign-participations').whereNull('deletedAt');
        expect(activeParticipations).to.have.lengthOf(0);

        const newlyDeletedParticipations = await knex('campaign-participations').where({ deletedAt: now });
        expect(newlyDeletedParticipations).to.have.lengthOf(2);

        const previouslyDeletedParticipations = await knex('campaign-participations').where({
          deletedAt: previousDate,
        });
        expect(previouslyDeletedParticipations).to.have.lengthOf(1);

        clock.restore();
      });
    });

    context('when there are active places lots', function () {
      it('throws an ArchiveOrganizationError', async function () {
        // given
        const superAdminUser = databaseBuilder.factory.buildUser.withRole();
        const organization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildOrganizationPlace({
          organizationId: organization.id,
          activationDate: new Date('2022-02-22'),
          expirationDate: dayjs(new Date()).add(1, 'day').toDate(),
          count: 1,
        });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(await usecases.archiveOrganization)({
          organizationId: organization.id,
          userId: superAdminUser.id,
        });

        // then
        expect(error).to.be.instanceOf(ArchiveOrganizationError);
        expect(error.message).to.equal('Organization with either active or pending lots cannot be archived');
      });
    });

    context('when there are pending places lots', function () {
      it('throws an ArchiveOrganizationError', async function () {
        // given
        const superAdminUser = databaseBuilder.factory.buildUser.withRole();
        const organization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildOrganizationPlace({
          organizationId: organization.id,
          activationDate: dayjs(new Date()).add(1, 'day').toDate(),
          expirationDate: dayjs(new Date()).add(2, 'day').toDate(),
          count: 1,
        });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(await usecases.archiveOrganization)({
          organizationId: organization.id,
          userId: superAdminUser.id,
        });

        // then
        expect(error).to.be.instanceOf(ArchiveOrganizationError);
        expect(error.message).to.equal('Organization with either active or pending lots cannot be archived');
      });
    });
  });

  context('when the organization does not exist', function () {
    it('throws an error', async function () {
      // given
      const nonExistingOrganizationId = 123456;
      const superAdminUser = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.archiveOrganization)({
        organizationId: nonExistingOrganizationId,
        userId: superAdminUser.id,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
