import { expect } from 'chai';

import { tagRepository } from '../../../../../../src/organizational-entities/infrastructure/repositories/tag.repository.js';
import { findOrganizationLearnersWithOrganizationByIds } from '../../../../../../src/prescription/organization-learner/domain/usecases/find-organization-learners-with-organization-by-ids.js';
import * as organizationLearnerRepository from '../../../../../../src/prescription/organization-learner/infrastructure/repositories/organization-learner-repository.js';
import * as organizationRepository from '../../../../../../src/shared/infrastructure/repositories/organization-repository.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCases | find-organization-learners-with-organization-by-ids', function () {
  it('should return organization learners with their organization and tags', async function () {
    // given
    const organization = databaseBuilder.factory.buildOrganization({ isManagingStudents: true, type: 'SCO' });
    const tag = databaseBuilder.factory.buildTag({ name: 'tagName' });
    databaseBuilder.factory.buildOrganizationTag({ organizationId: organization.id, tagId: tag.id });
    const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization.id });
    await databaseBuilder.commit();

    // when
    const result = await findOrganizationLearnersWithOrganizationByIds({
      organizationLearnerIds: [organizationLearner.id],
      organizationId: organization.id,
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
});
