const { expect, databaseBuilder, knex, sinon } = require('../../test-helper');
const { writeFile, rm } = require('fs/promises');
const values = require('lodash/values');
const logger = require('../../../lib/infrastructure/logger');
const { updateCertificationInfos, headers } = require('../../../scripts/update-certification-infos');
const dataFile = `${__dirname}/data.csv`;

describe('Acceptance | Scripts | update-certification-infos', function () {
  describe('#updateCertificationInfos', function () {
    afterEach(function () {
      return rm(dataFile);
    });

    it('should update course and candidate by external id', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildCertificationCourse({
        id: 5,
        externalId: '123',
        userId: user.id,
      });
      databaseBuilder.factory.buildCertificationCandidate({
        id: 50,
        externalId: '123',
        userId: user.id,
      });

      await databaseBuilder.commit();

      await _createDataFile(dataFile, [
        {
          externalId: '123',
          birthdate: '2000-12-31',
          birthINSEECode: 'inseeUPDATED123',
          birthPostalCode: 'postalUPDATED123',
          birthCity: 'cityUPDATED123',
          birthCountry: 'countryUPDATED123',
        },
      ]);
      await updateCertificationInfos(dataFile);
      const certificationCandidates = await _getCertificationCandidates();

      // when
      const certificationCourses = await _getCertificationCourses();

      // then
      expect(certificationCourses).to.deep.equal([
        {
          id: 5,
          externalId: '123',
          birthdate: '2000-12-31',
          birthINSEECode: 'inseeUPDATED123',
          birthPostalCode: 'postalUPDATED123',
          birthplace: 'cityUPDATED123',
          birthCountry: 'countryUPDATED123',
        },
      ]);
      expect(certificationCandidates).to.deep.equal([
        {
          id: 50,
          externalId: '123',
          birthdate: '2000-12-31',
          birthINSEECode: 'inseeUPDATED123',
          birthPostalCode: 'postalUPDATED123',
          birthCity: 'cityUPDATED123',
          birthCountry: 'countryUPDATED123',
        },
      ]);
    });

    context('when there is no certification course for the candidate', function () {
      it('should not update candidate', async function () {
        // given
        databaseBuilder.factory.buildCertificationCandidate({
          id: 52,
          externalId: '123',
          userId: null,
          birthdate: '2000-01-01',
          birthINSEECode: 'y',
          birthPostalCode: 'y',
          birthCity: 'y',
          birthCountry: 'y',
        });

        await databaseBuilder.commit();

        await _createDataFile(dataFile, [
          {
            externalId: '123',
            birthdate: '2000-12-31',
            birthINSEECode: 'inseeUPDATED123',
            birthPostalCode: 'postalUPDATED123',
            birthCity: 'cityUPDATED123',
            birthCountry: 'countryUPDATED123',
          },
        ]);
        await updateCertificationInfos(dataFile);

        // when
        const certificationCandidates = await _getCertificationCandidates();

        // then
        expect(certificationCandidates.find(({ id }) => id === 52)).to.deep.equal({
          id: 52,
          externalId: '123',
          birthdate: '2000-01-01',
          birthINSEECode: 'y',
          birthPostalCode: 'y',
          birthCity: 'y',
          birthCountry: 'y',
        });
      });

      it('should log a warning', async function () {
        // given
        sinon.stub(logger, 'warn');
        await _createDataFile(dataFile, [
          {
            externalId: '123',
            birthdate: '2000-12-31',
            birthINSEECode: 'inseeUPDATED123',
            birthPostalCode: 'postalUPDATED123',
            birthCity: 'cityUPDATED123',
            birthCountry: 'countryUPDATED123',
          },
        ]);

        // when
        await updateCertificationInfos(dataFile);

        // then
        expect(logger.warn).to.have.been.calledWith('Certification for external id 123 not found');
      });
    });
  });
});

function _getCertificationCandidates() {
  return knex
    .select('id', 'birthdate', 'birthCity', 'birthPostalCode', 'birthINSEECode', 'birthCountry', 'externalId')
    .from('certification-candidates');
}

function _getCertificationCourses() {
  return knex
    .select('id', 'birthdate', 'birthplace', 'birthPostalCode', 'birthINSEECode', 'birthCountry', 'externalId')
    .from('certification-courses');
}

async function _createDataFile(dataFile, data) {
  return writeFile(dataFile, [values(headers).join(',')].concat(data.map((line) => values(line))).join('\n'));
}
