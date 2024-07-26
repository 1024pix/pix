import { addManyStudentsToScoCertificationCenter } from '../../../scripts/data-generation/add-many-students-to-sco-certification-center.js';
import { BookshelfOrganizationLearner } from '../../../src/shared/infrastructure/orm-models/OrganizationLearner.js';
import { databaseBuilder, expect } from '../../test-helper.js';

describe('Acceptance | Scripts | add-many-students-to-sco-certification-centers.js', function () {
  const organizationId = 123;

  describe('#addManyStudentsToScoCertificationCenter', function () {
    it('should insert 2 sco certification centers', async function () {
      // given
      const numberOfOrganizationLearnerToCreate = 3;
      databaseBuilder.factory.buildOrganization({
        id: organizationId,
        type: 'SCO',
        name: 'Collège The Night Watch',
        isManagingStudents: true,
        email: 'sco.generic.account@example.net',
        externalId: 123,
        provinceCode: '12',
      });
      await databaseBuilder.commit();

      // when
      await addManyStudentsToScoCertificationCenter(numberOfOrganizationLearnerToCreate);
      const numberAfter = await _getNumberOfOrganizationLearners();

      // then
      expect(numberAfter).to.equal(numberOfOrganizationLearnerToCreate);
    });
  });
});

function _getNumberOfOrganizationLearners() {
  return BookshelfOrganizationLearner.count().then((number) => parseInt(number, 10));
}
