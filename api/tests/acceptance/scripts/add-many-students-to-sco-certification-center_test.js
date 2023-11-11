import { expect, databaseBuilder } from '../../test-helper.js';
import { BookshelfOrganizationLearner } from '../../../lib/infrastructure/orm-models/OrganizationLearner.js';
import { addManyStudentsToScoCertificationCenter } from '../../../scripts/data-generation/add-many-students-to-sco-certification-center.js';

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
