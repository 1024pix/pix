import sinon from 'sinon';

import { CorrectCertificationCoursesFirstnamesBadEncoding } from '../../../scripts/certification/correct-certification-courses-firstnames-bad-encoding.js';
import { expect } from '../../test-helper.js';
import { databaseBuilder, knex } from '../../tooling/databases.js';
import { catchErr } from '../../tooling/test-utils/error.js';

describe('Certification | Scripts | CorrectCertificationCandidatesAccentsBadEncoding', function () {
  let courseGoodFirstName,
    courseCase1,
    courseCase2,
    courseCase3,
    courseCase4,
    courseCase5,
    courseMultipleAccentsCase,
    courseDictonary1,
    courseDictonary2,
    courseDictonary3,
    courseDictonary4,
    candidateGoodFirstName,
    candidateCase1,
    candidateCase2,
    candidateCase3,
    candidateCase4,
    candidateCase5,
    candidateMultipleAccentsCase,
    candidateDictonary1,
    candidateDictonary2,
    candidateDictonary3,
    candidateDictonary4,
    script,
    logger;

  beforeEach(function () {
    script = new CorrectCertificationCoursesFirstnamesBadEncoding();
    logger = {
      info: sinon.stub(),
      error: sinon.stub(),
    };

    courseGoodFirstName = databaseBuilder.factory.buildCertificationCourse({
      firstName: 'Héloïse-Françoise',
    });
    courseCase1 = databaseBuilder.factory.buildCertificationCourse({
      firstName: 'CÃ©dric',
    });
    courseCase2 = databaseBuilder.factory.buildCertificationCourse({
      firstName: 'HelÃ¨ne',
    });
    courseCase3 = databaseBuilder.factory.buildCertificationCourse({
      firstName: 'IsmaÃ«l',
    });
    courseCase4 = databaseBuilder.factory.buildCertificationCourse({
      firstName: 'MatheÃ¯s',
    });
    courseCase5 = databaseBuilder.factory.buildCertificationCourse({
      firstName: 'FranÃ§oise',
    });
    courseDictonary1 = databaseBuilder.factory.buildCertificationCourse({
      firstName: 'Mickaï¿œl',
    });
    courseDictonary2 = databaseBuilder.factory.buildCertificationCourse({
      firstName: 'Hï¿œloï¿œse',
    });
    courseDictonary3 = databaseBuilder.factory.buildCertificationCourse({
      firstName: 'Cl�mentine',
    });
    courseDictonary4 = databaseBuilder.factory.buildCertificationCourse({
      firstName: 'Jean-Fran�ois',
    });
    courseMultipleAccentsCase = databaseBuilder.factory.buildCertificationCourse({
      firstName: 'AndrÃ©-MichÃ¨le',
    });

    candidateGoodFirstName = databaseBuilder.factory.buildCertificationCandidate({
      firstName: 'Héloïse-Françoise',
    });
    candidateCase1 = databaseBuilder.factory.buildCertificationCandidate({
      firstName: 'CÃ©dric',
    });
    candidateCase2 = databaseBuilder.factory.buildCertificationCandidate({
      firstName: 'HelÃ¨ne',
    });
    candidateCase3 = databaseBuilder.factory.buildCertificationCandidate({
      firstName: 'IsmaÃ«l',
    });
    candidateCase4 = databaseBuilder.factory.buildCertificationCandidate({
      firstName: 'MatheÃ¯s',
    });
    candidateCase5 = databaseBuilder.factory.buildCertificationCandidate({
      firstName: 'FranÃ§oise',
    });
    candidateDictonary1 = databaseBuilder.factory.buildCertificationCandidate({
      firstName: 'Mickaï¿œl',
    });
    candidateDictonary2 = databaseBuilder.factory.buildCertificationCandidate({
      firstName: 'Hï¿œloï¿œse',
    });
    candidateDictonary3 = databaseBuilder.factory.buildCertificationCandidate({
      firstName: 'Cl�mentine',
    });
    candidateDictonary4 = databaseBuilder.factory.buildCertificationCandidate({
      firstName: 'Jean-Fran�ois',
    });
    candidateMultipleAccentsCase = databaseBuilder.factory.buildCertificationCandidate({
      firstName: 'AndrÃ©-MichÃ¨le',
    });

    return databaseBuilder.commit();
  });

  context('dryRun ON', function () {
    it('does not persist the changes', async function () {
      await script.handle({
        logger,
        options: { dryRun: true },
      });

      const courseFirstNames = await knex.select('firstName').from('certification-courses').orderBy('id');
      const candidateFirstNames = await knex.select('firstName').from('certification-candidates').orderBy('id');

      expect(logger.info).to.have.been.calledWith(`Script execution started with options {"dryRun":true}`);
      expect(logger.info).to.have.been.calledWith(
        '10 certification-courses rows and 10 certification-candidates rows would have been updated',
      );
      expect(logger.error).to.not.have.been.called;

      expect(courseFirstNames[0].firstName).to.equal(courseGoodFirstName.firstName);
      expect(courseFirstNames[1].firstName).to.equal(courseCase1.firstName);
      expect(courseFirstNames[2].firstName).to.equal(courseCase2.firstName);
      expect(courseFirstNames[3].firstName).to.equal(courseCase3.firstName);
      expect(courseFirstNames[4].firstName).to.equal(courseCase4.firstName);
      expect(courseFirstNames[5].firstName).to.equal(courseCase5.firstName);
      expect(courseFirstNames[6].firstName).to.equal(courseDictonary1.firstName);
      expect(courseFirstNames[7].firstName).to.equal(courseDictonary2.firstName);
      expect(courseFirstNames[8].firstName).to.equal(courseDictonary3.firstName);
      expect(courseFirstNames[9].firstName).to.equal(courseDictonary4.firstName);
      expect(courseFirstNames[10].firstName).to.equal(courseMultipleAccentsCase.firstName);

      expect(candidateFirstNames[0].firstName).to.equal(candidateGoodFirstName.firstName);
      expect(candidateFirstNames[1].firstName).to.equal(candidateCase1.firstName);
      expect(candidateFirstNames[2].firstName).to.equal(candidateCase2.firstName);
      expect(candidateFirstNames[3].firstName).to.equal(candidateCase3.firstName);
      expect(candidateFirstNames[4].firstName).to.equal(candidateCase4.firstName);
      expect(candidateFirstNames[5].firstName).to.equal(candidateCase5.firstName);
      expect(candidateFirstNames[6].firstName).to.equal(candidateDictonary1.firstName);
      expect(candidateFirstNames[7].firstName).to.equal(candidateDictonary2.firstName);
      expect(candidateFirstNames[8].firstName).to.equal(candidateDictonary3.firstName);
      expect(candidateFirstNames[9].firstName).to.equal(candidateDictonary4.firstName);
      expect(candidateFirstNames[10].firstName).to.equal(candidateMultipleAccentsCase.firstName);
    });
  });

  context('dryRun OFF', function () {
    context('when there are no errors', function () {
      it('persists all the changes', async function () {
        await script.handle({
          logger,
          options: {
            dryRun: false,
          },
        });

        const courseFirstNames = await knex.select('firstName').from('certification-courses').orderBy('id');
        const candidateFirstNames = await knex.select('firstName').from('certification-candidates').orderBy('id');

        expect(logger.info).to.have.been.calledWith(`Script execution started with options {"dryRun":false}`);
        expect(logger.info).to.have.been.calledWith(
          'Script finished. Number of rows with weirdly encoded firstnames corrected : ' +
            '10 certification-courses, 10 certification-candidates, youpi',
        );
        expect(logger.error).to.not.have.been.called;

        expect(courseFirstNames).to.have.lengthOf(11);
        expect(courseFirstNames[0].firstName).to.equal(courseGoodFirstName.firstName);
        expect(courseFirstNames[1].firstName).to.equal('Cédric');
        expect(courseFirstNames[2].firstName).to.equal('Helène');
        expect(courseFirstNames[3].firstName).to.equal('Ismaël');
        expect(courseFirstNames[4].firstName).to.equal('Matheïs');
        expect(courseFirstNames[5].firstName).to.equal('Françoise');
        expect(courseFirstNames[6].firstName).to.equal('Mickaël');
        expect(courseFirstNames[7].firstName).to.equal('Héloïse');
        expect(courseFirstNames[8].firstName).to.equal('Clémentine');
        expect(courseFirstNames[9].firstName).to.equal('Jean-François');
        expect(courseFirstNames[10].firstName).to.equal('André-Michèle');

        expect(candidateFirstNames).to.have.lengthOf(11);
        expect(candidateFirstNames[0].firstName).to.equal(candidateGoodFirstName.firstName);
        expect(candidateFirstNames[1].firstName).to.equal('Cédric');
        expect(candidateFirstNames[2].firstName).to.equal('Helène');
        expect(candidateFirstNames[3].firstName).to.equal('Ismaël');
        expect(candidateFirstNames[4].firstName).to.equal('Matheïs');
        expect(candidateFirstNames[5].firstName).to.equal('Françoise');
        expect(candidateFirstNames[6].firstName).to.equal('Mickaël');
        expect(candidateFirstNames[7].firstName).to.equal('Héloïse');
        expect(candidateFirstNames[8].firstName).to.equal('Clémentine');
        expect(candidateFirstNames[9].firstName).to.equal('Jean-François');
        expect(candidateFirstNames[10].firstName).to.equal('André-Michèle');
      });
    });

    context('when an error occurs during the process', function () {
      it('rolls back every change and rethrows the error', async function () {
        const rawStub = sinon.stub(knex, 'raw');
        rawStub.callThrough();
        rawStub
          .withArgs('REPLACE(??, ?, ?)', ['firstName', 'Ã§', 'ç'])
          .throws(new Error('SABOTAGING_TO_TRIGGER_ROLLBACK'));

        const err = await catchErr(script.handle)({
          logger,
          options: { dryRun: false },
        });

        expect(err.message).to.equal('SABOTAGING_TO_TRIGGER_ROLLBACK');

        const courseFirstNames = await knex.select('firstName').from('certification-courses').orderBy('id');
        const candidateFirstNames = await knex.select('firstName').from('certification-candidates').orderBy('id');

        expect(courseFirstNames).to.have.lengthOf(11);
        expect(courseFirstNames[0].firstName).to.equal(courseGoodFirstName.firstName);
        expect(courseFirstNames[1].firstName).to.equal(courseCase1.firstName);
        expect(courseFirstNames[2].firstName).to.equal(courseCase2.firstName);
        expect(courseFirstNames[3].firstName).to.equal(courseCase3.firstName);
        expect(courseFirstNames[4].firstName).to.equal(courseCase4.firstName);
        expect(courseFirstNames[5].firstName).to.equal(courseCase5.firstName);
        expect(courseFirstNames[6].firstName).to.equal(courseDictonary1.firstName);
        expect(courseFirstNames[7].firstName).to.equal(courseDictonary2.firstName);
        expect(courseFirstNames[8].firstName).to.equal(courseDictonary3.firstName);
        expect(courseFirstNames[9].firstName).to.equal(courseDictonary4.firstName);
        expect(courseFirstNames[10].firstName).to.equal(courseMultipleAccentsCase.firstName);

        expect(candidateFirstNames).to.have.lengthOf(11);
        expect(candidateFirstNames[0].firstName).to.equal(candidateGoodFirstName.firstName);
        expect(candidateFirstNames[1].firstName).to.equal(candidateCase1.firstName);
        expect(candidateFirstNames[2].firstName).to.equal(candidateCase2.firstName);
        expect(candidateFirstNames[3].firstName).to.equal(candidateCase3.firstName);
        expect(candidateFirstNames[4].firstName).to.equal(candidateCase4.firstName);
        expect(candidateFirstNames[5].firstName).to.equal(candidateCase5.firstName);
        expect(candidateFirstNames[6].firstName).to.equal(candidateDictonary1.firstName);
        expect(candidateFirstNames[7].firstName).to.equal(candidateDictonary2.firstName);
        expect(candidateFirstNames[8].firstName).to.equal(candidateDictonary3.firstName);
        expect(candidateFirstNames[9].firstName).to.equal(candidateDictonary4.firstName);
        expect(candidateFirstNames[10].firstName).to.equal(candidateMultipleAccentsCase.firstName);

        expect(logger.info).to.have.been.calledWith(`Script execution started with options {"dryRun":false}`);
        expect(logger.info).to.not.have.been.calledWithMatch('Script finished');
        expect(logger.error).to.not.have.been.called;
      });
    });
  });
});
