const { expect } = require('../../test-helper');
const { SCO_MIDDLE_SCHOOL_ID } = require('../../../db/seeds/data/organizations-sco-builder');

const { knex } = require('../../../lib/infrastructure/bookshelf');
const BookshelfSchoolingRegistration = require('../../../lib/infrastructure/data/schooling-registration');
const { databaseBuilder } = require('../../test-helper');

const { addManyStudentsToScoCertificationCenter } = require('../../../scripts/data-generation/add-many-students-to-sco-certification-center');

describe('Acceptance | Scripts | add-many-students-to-sco-certification-centers.js', () => {

  describe('#addManyStudentsToScoCertificationCenter', () => {

    afterEach(() => {
      return knex('schooling-registrations').delete();
    });

    it('should insert 2 sco certification centers', async () => {
      // given
      const numberOfSchoolingRegistrationToCreate = 3;
      databaseBuilder.factory.buildOrganization({
        id: SCO_MIDDLE_SCHOOL_ID,
        type: 'SCO',
        name: 'Collège The Night Watch',
        isManagingStudents: true,
        canCollectProfiles: true,
        email: 'sco.generic.account@example.net',
        externalId: 123,
        provinceCode: '12',
      });
      await databaseBuilder.commit();

      // when
      await addManyStudentsToScoCertificationCenter(numberOfSchoolingRegistrationToCreate);
      const numberAfter = await _getNumberOfSchoolingRegistrations();

      // then
      expect(numberAfter).to.equal(numberOfSchoolingRegistrationToCreate);
    });
  });
});

function _getNumberOfSchoolingRegistrations() {
  return BookshelfSchoolingRegistration.count()
    .then((number) => parseInt(number, 10));
}
