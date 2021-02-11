const { expect } = require('../../test-helper');
const { SCO_MIDDLE_SCHOOL_ID } = require('../../../db/seeds/data/organizations-sco-builder');

const { knex } = require('../../../lib/infrastructure/bookshelf');
const BookshelfSchoolingRegistration = require('../../../lib/infrastructure/data/schooling-registration');
const { databaseBuilder } = require('../../test-helper');

const { addManyDivisionsAndStudentsToScoCertificationCenter } = require('../../../scripts/data-generation/add-many-divisions-and-students-to-sco-organization');

describe('Acceptance | Scripts | add-many-divisions-and-students-to-sco-organization', () => {

  describe('#addManyDivisionsAndStudentsToScoCertificationCenter', () => {

    afterEach(() => {
      return knex('schooling-registrations').delete();
    });

    it('should insert many divisions and schooling registrations', async () => {
      // given
      const numberOfDivisionsToCreate = 4;
      const numberOfStudentsPerDivision = 30;
      const numberOfSchoolingRegistrationToCreate = numberOfDivisionsToCreate * numberOfStudentsPerDivision;

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
      await addManyDivisionsAndStudentsToScoCertificationCenter(numberOfDivisionsToCreate, SCO_MIDDLE_SCHOOL_ID);
      const numberOfCreatedSchoolingRegistrations = await _getNumberOfSchoolingRegistrations();
      const createdDivisions = await _getDistinctDivisions();

      // then
      expect(numberOfCreatedSchoolingRegistrations).to.equal(numberOfSchoolingRegistrationToCreate);
      expect(createdDivisions.length).to.equal(numberOfDivisionsToCreate);
    });
  });
});

function _getNumberOfSchoolingRegistrations() {
  return BookshelfSchoolingRegistration.count()
    .then((number) => parseInt(number, 10));
}

function _getDistinctDivisions() {
  return knex('schooling-registrations')
    .distinct('division');
}
