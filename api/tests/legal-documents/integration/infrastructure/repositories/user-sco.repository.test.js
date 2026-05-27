import { isUserScoStudent } from '../../../../../src/legal-documents/infrastructure/repositories/user-sco.repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Infrastructure | Repository | UserScoRepository', function () {
  describe('#isUserScoStudent', function () {
    context(
      'when the user has an active SCO learner record created within 6 years and no account recovery demand',
      function () {
        it('returns true', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
          databaseBuilder.factory.buildOrganizationLearner({
            userId,
            organizationId: organization.id,
            createdAt: new Date(),
          });
          await databaseBuilder.commit();

          // when
          const result = await isUserScoStudent(userId);

          // then
          expect(result).to.be.true;
        });
      },
    );

    context('when the user has no organization learner', function () {
      it('returns false', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();

        // when
        const result = await isUserScoStudent(userId);

        // then
        expect(result).to.be.false;
      });
    });

    context('when the user has an organization learner in a non-SCO organization', function () {
      it('returns false', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organization = databaseBuilder.factory.buildOrganization({ type: 'PRO', isManagingStudents: false });
        databaseBuilder.factory.buildOrganizationLearner({
          userId,
          organizationId: organization.id,
          createdAt: new Date(),
        });
        await databaseBuilder.commit();

        // when
        const result = await isUserScoStudent(userId);

        // then
        expect(result).to.be.false;
      });
    });

    context(
      'when the user has an organization learner in an SCO organization that does not manage students',
      function () {
        it('returns false', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: false });
          databaseBuilder.factory.buildOrganizationLearner({
            userId,
            organizationId: organization.id,
            createdAt: new Date(),
          });
          await databaseBuilder.commit();

          // when
          const result = await isUserScoStudent(userId);

          // then
          expect(result).to.be.false;
        });
      },
    );

    context('when the user has an SCO learner record created more than 6 years ago', function () {
      it('returns false', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
        const sevenYearsAgo = new Date();
        sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);
        databaseBuilder.factory.buildOrganizationLearner({
          userId,
          organizationId: organization.id,
          createdAt: sevenYearsAgo,
        });
        await databaseBuilder.commit();

        // when
        const result = await isUserScoStudent(userId);

        // then
        expect(result).to.be.false;
      });
    });

    context('when the user has a deleted SCO learner record', function () {
      it('returns false', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
        databaseBuilder.factory.buildOrganizationLearner({
          userId,
          organizationId: organization.id,
          createdAt: new Date(),
          deletedAt: new Date(),
        });
        await databaseBuilder.commit();

        // when
        const result = await isUserScoStudent(userId);

        // then
        expect(result).to.be.false;
      });
    });

    context(
      'when the user has an active SCO learner record but has a used account recovery demand (sortie du SCO)',
      function () {
        it('returns false', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
          const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
            userId,
            organizationId: organization.id,
            createdAt: new Date(),
          });
          databaseBuilder.factory.buildAccountRecoveryDemand({
            userId,
            organizationLearnerId: organizationLearner.id,
            used: true,
          });
          await databaseBuilder.commit();

          // when
          const result = await isUserScoStudent(userId);

          // then
          expect(result).to.be.false;
        });
      },
    );

    context('when the user has a SCO learner record and an unused account recovery demand', function () {
      it('returns true', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          userId,
          organizationId: organization.id,
          createdAt: new Date(),
        });
        databaseBuilder.factory.buildAccountRecoveryDemand({
          userId,
          organizationLearnerId: organizationLearner.id,
          used: false,
        });
        await databaseBuilder.commit();

        // when
        const result = await isUserScoStudent(userId);

        // then
        expect(result).to.be.true;
      });
    });
  });
});
