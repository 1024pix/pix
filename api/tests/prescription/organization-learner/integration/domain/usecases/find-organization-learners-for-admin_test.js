import { OrganizationLearnerOverviewForAdmin } from '../../../../../../src/prescription/organization-learner/domain/read-models/OrganizationLearnerOverviewForAdmin.js';
import { usecases } from '../../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCases | find-paginated-filtered-organization-learners-for-admin', function () {
  it('should return paginated organization learners filtered by name', async function () {
    const learner = databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Jean-René',
      lastName: 'Michel',
    });
    const learner2 = databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Jeanne-Michelle',
      lastName: 'René',
    });
    const learner3 = databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Michel',
      lastName: 'michel',
    });
    databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Jean',
      lastName: 'Dion',
    });
    await databaseBuilder.commit();

    const result = await usecases.findOrganizationLearnersForAdmin({
      page: {
        size: 2,
        number: 1,
      },
      filter: { fullName: 'michel' },
    });
    const result2 = await usecases.findOrganizationLearnersForAdmin({
      page: {
        size: 2,
        number: 2,
      },
      filter: { fullName: 'michel' },
    });

    const learners = result.learners;
    const learners2 = result2.learners;

    expect(learners).lengthOf(2);
    expect(learners[0]).to.be.an.instanceOf(OrganizationLearnerOverviewForAdmin);
    expect(learners[1]).to.be.an.instanceOf(OrganizationLearnerOverviewForAdmin);
    expect(learners[0].id).to.be.equal(learner.id);
    expect(learners[1].id).to.be.equal(learner2.id);

    expect(learners2).lengthOf(1);
    expect(learners2[0]).to.be.an.instanceOf(OrganizationLearnerOverviewForAdmin);
    expect(learners2[0].id).to.be.equal(learner3.id);
  });

  it('should return paginated organization learners filtered by organizationId', async function () {
    const organization = databaseBuilder.factory.buildOrganization({
      externalId: 'ABC123',
    });
    const learner = databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Jean-René',
      lastName: 'Michel',
      organizationId: organization.id,
    });
    databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Jean',
      lastName: 'Dion',
    });
    await databaseBuilder.commit();

    const result = await usecases.findOrganizationLearnersForAdmin({
      page: {
        size: 2,
        number: 1,
      },
      filter: { organizationExternalId: organization.externalId },
    });
    const learners = result.learners;

    expect(learners).lengthOf(1);
    expect(learners[0]).to.be.an.instanceOf(OrganizationLearnerOverviewForAdmin);
    expect(learners[0].id).to.be.equal(learner.id);
  });

  it('should return paginated organization learners not disabled', async function () {
    const organization = databaseBuilder.factory.buildOrganization();
    databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Jean',
      lastName: 'Dion',
      isDisabled: true,
    });
    const learner = databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Jean-René',
      lastName: 'Michel',
      organizationId: organization.id,
      isDisabled: false,
    });
    await databaseBuilder.commit();

    const result = await usecases.findOrganizationLearnersForAdmin({
      page: {
        size: 2,
        number: 1,
      },
      filter: { hideDisabled: true },
    });
    const learners = result.learners;

    expect(learners).lengthOf(1);
    expect(learners[0]).to.be.an.instanceOf(OrganizationLearnerOverviewForAdmin);
    expect(learners[0].id).to.be.equal(learner.id);
  });

  context('Sort', function () {
    let organization;
    let otherOrganization;
    let learner1, learner2;
    beforeEach(async function () {
      organization = databaseBuilder.factory.buildOrganization({
        name: 'Observatoire de Pix',
      });
      otherOrganization = databaseBuilder.factory.buildOrganization({
        name: 'PIX',
      });

      learner1 = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        firstName: 'Annie',
        birthdate: '2000-01-01',
        updatedAt: new Date('2022-01-01'),
      });
      learner2 = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: otherOrganization.id,
        firstName: 'Jean',
        lastName: 'De Ségazan',
        birthdate: '2002-01-01',
        updatedAt: new Date('2020-01-01'),
      });

      await databaseBuilder.commit();
    });
    it('retrieve learners sorted by organization name desc', async function () {
      //when
      const result = await usecases.findOrganizationLearnersForAdmin({
        sort: {
          organizationSort: 'desc',
        },
      });
      //then
      expect(result.learners[0].id).to.be.equal(learner2.id);
      expect(result.learners[1].id).to.be.equal(learner1.id);
    });
    it('retrieve learners sorted by birthdate desc', async function () {
      //when
      const result = await usecases.findOrganizationLearnersForAdmin({
        sort: {
          birthdateSort: 'desc',
        },
      });
      //then
      expect(result.learners[0].id).to.be.equal(learner2.id);
      expect(result.learners[1].id).to.be.equal(learner1.id);
    });
    it('retrieve learners sorted by updatedAt asc', async function () {
      //when
      const result = await usecases.findOrganizationLearnersForAdmin({
        sort: {
          updatedAtSort: 'asc',
        },
      });
      //then
      expect(result.learners[0].id).to.be.equal(learner2.id);
      expect(result.learners[1].id).to.be.equal(learner1.id);
    });
  });
});
