import { expect } from 'chai';

import { tagRepository } from '../../../../../../src/organizational-entities/infrastructure/repositories/tag.repository.js';
import { findOrganizationLearnersWithOrganizationByUserId } from '../../../../../../src/prescription/organization-learner/domain/usecases/find-organization-learners-with-organization.js';
import * as organizationLearnerRepository from '../../../../../../src/prescription/organization-learner/infrastructure/repositories/organization-learner-repository.js';
import * as organizationRepository from '../../../../../../src/shared/infrastructure/repositories/organization-repository.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCases | find-organization-learners-with-organization', function () {
  it('should return organization learners with their organization', async function () {
    // given
    const user = databaseBuilder.factory.buildUser();
    const organization = databaseBuilder.factory.buildOrganization({ isManagingStudents: true, type: 'SCO' });
    const tag = databaseBuilder.factory.buildTag({ name: 'tagName' });
    databaseBuilder.factory.buildOrganizationTag({ organizationId: organization.id, tagId: tag.id });
    const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
      userId: user.id,
      organizationId: organization.id,
    });

    await databaseBuilder.commit();

    // when
    const result = await findOrganizationLearnersWithOrganizationByUserId({
      userId: user.id,
      organizationRepository,
      libOrganizationLearnerRepository: organizationLearnerRepository,
      tagRepository,
    });

    // then
    expect(result).to.have.lengthOf(1);
    expect(result[0].organizationLearner.id).to.equal(organizationLearner.id);
    expect(result[0].organization.id).to.equal(organization.id);
    expect(result[0].organization.isManagingStudents).to.equal(true);
    expect(result[0].organization.type).to.equal('SCO');
    expect(result[0].organization.tags).to.deep.equal(['tagName']);
  });

  it('should return all organization learners for a user registered in multiple organizations', async function () {
    // given
    const user = databaseBuilder.factory.buildUser();
    const organization1 = databaseBuilder.factory.buildOrganization();
    const organization2 = databaseBuilder.factory.buildOrganization();
    const organizationLearner1 = databaseBuilder.factory.buildOrganizationLearner({
      userId: user.id,
      organizationId: organization1.id,
    });
    const organizationLearner2 = databaseBuilder.factory.buildOrganizationLearner({
      userId: user.id,
      organizationId: organization2.id,
    });

    await databaseBuilder.commit();

    // when
    const result = await findOrganizationLearnersWithOrganizationByUserId({
      userId: user.id,
      organizationRepository,
      libOrganizationLearnerRepository: organizationLearnerRepository,
      tagRepository,
    });

    // then
    const learnerIds = result.map((r) => r.organizationLearner.id);
    expect(learnerIds).to.have.members([organizationLearner1.id, organizationLearner2.id]);
  });
});
