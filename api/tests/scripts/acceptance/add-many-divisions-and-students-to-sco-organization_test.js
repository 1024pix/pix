import { addManyDivisionsAndStudentsToScoCertificationCenter } from '../../../scripts/data-generation/add-many-divisions-and-students-to-sco-organization.js';
import { expect } from '../../test-helper.js';
import { databaseBuilder, knex } from '../../tooling/databases.js';

describe('Acceptance | Scripts | add-many-divisions-and-students-to-sco-organization', function () {
  const organizationId = 123;

  describe('#addManyDivisionsAndStudentsToScoCertificationCenter', function () {
    it('should insert many divisions and organization learners', async function () {
      // given
      const numberOfDivisionsToCreate = 4;
      const numberOfStudentsPerDivision = 30;
      const numberOfOrganizationLearnerToCreate = numberOfDivisionsToCreate * numberOfStudentsPerDivision;

      databaseBuilder.factory.buildOrganization({
        id: organizationId,
        type: 'SCO',
        name: 'Collège The Night Watch',
        isManagingStudents: true,
        email: 'sco.generic.account@example.net',
        externalId: organizationId,
        provinceCode: '12',
      });

      await databaseBuilder.commit();

      // when
      await addManyDivisionsAndStudentsToScoCertificationCenter(numberOfDivisionsToCreate, organizationId);
      const numberOfCreatedOrganizationLearners = await _getNumberOfOrganizationLearners();
      const createdDivisions = await _getDistinctDivisions();

      // then
      expect(numberOfCreatedOrganizationLearners).to.equal(numberOfOrganizationLearnerToCreate);
      expect(createdDivisions).to.have.lengthOf(numberOfDivisionsToCreate);
    });
  });
});

async function _getNumberOfOrganizationLearners() {
  const [{ count }] = await knex('organization-learners').count();
  return count;
}

function _getDistinctDivisions() {
  return knex('organization-learners').distinct('division');
}
