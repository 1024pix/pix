import dayjs from 'dayjs';
import sinon from 'sinon';

import { ArchiveOrganizationError } from '../../../../../src/organizational-entities/domain/errors.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';

import { databaseBuilder } from '../../../../tooling/databases.js';
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
