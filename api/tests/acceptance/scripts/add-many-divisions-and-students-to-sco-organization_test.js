import { expect } from '../../test-helper';
import { SCO_MIDDLE_SCHOOL_ID } from '../../../db/seeds/data/organizations-sco-builder';
import { knex } from '../../../lib/infrastructure/bookshelf';
import BookshelfOrganizationLearner from '../../../lib/infrastructure/orm-models/OrganizationLearner';
import { databaseBuilder } from '../../test-helper';
import { addManyDivisionsAndStudentsToScoCertificationCenter } from '../../../scripts/data-generation/add-many-divisions-and-students-to-sco-organization';

describe('Acceptance | Scripts | add-many-divisions-and-students-to-sco-organization', function () {
  describe('#addManyDivisionsAndStudentsToScoCertificationCenter', function () {
    afterEach(function () {
      return knex('organization-learners').delete();
    });

    it('should insert many divisions and organization learners', async function () {
      // given
      const numberOfDivisionsToCreate = 4;
      const numberOfStudentsPerDivision = 30;
      const numberOfOrganizationLearnerToCreate = numberOfDivisionsToCreate * numberOfStudentsPerDivision;

      databaseBuilder.factory.buildOrganization({
        id: SCO_MIDDLE_SCHOOL_ID,
        type: 'SCO',
        name: 'Collège The Night Watch',
        isManagingStudents: true,
        email: 'sco.generic.account@example.net',
        externalId: 123,
        provinceCode: '12',
      });

      await databaseBuilder.commit();

      // when
      await addManyDivisionsAndStudentsToScoCertificationCenter(numberOfDivisionsToCreate, SCO_MIDDLE_SCHOOL_ID);
      const numberOfCreatedOrganizationLearners = await _getNumberOfOrganizationLearners();
      const createdDivisions = await _getDistinctDivisions();

      // then
      expect(numberOfCreatedOrganizationLearners).to.equal(numberOfOrganizationLearnerToCreate);
      expect(createdDivisions.length).to.equal(numberOfDivisionsToCreate);
    });
  });
});

function _getNumberOfOrganizationLearners() {
  return BookshelfOrganizationLearner.count().then((number) => parseInt(number, 10));
}

function _getDistinctDivisions() {
  return knex('organization-learners').distinct('division');
}
