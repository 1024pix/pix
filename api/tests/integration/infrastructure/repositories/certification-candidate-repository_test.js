const { databaseBuilder, expect, knex, domainBuilder, catchErr } = require('../../../test-helper');
const BookshelfCertificationCandidate = require('../../../../lib/infrastructure/data/certification-candidate');
const certificationCandidateRepository = require('../../../../lib/infrastructure/repositories/certification-candidate-repository');
const { CertificationCandidateDeletionError, CertificationCandidateCreationOrUpdateError } = require('../../../../lib/domain/errors');
const _ = require('lodash');

describe('Integration | Repository | CertificationCandidate', function() {

  describe('#save', () => {
    let certificationCandidate;
    let sessionId;

    beforeEach(async () => {
      await databaseBuilder.clean();
      // given
      sessionId = databaseBuilder.factory.buildSession().id;
      certificationCandidate = domainBuilder.buildCertificationCandidate({
        firstName: 'Pix',
        lastName: 'Lover',
        birthCity: 'HaussmanPolis',
        externalId: 'ABCDEF123',
        birthdate: '1990-07-12',
        extraTimePercentage: '0.05',
        sessionId,
      });
      certificationCandidate.id = undefined;

      return databaseBuilder.commit();
    });

    afterEach(async() => {
      await knex('certification-candidates').delete();
      return databaseBuilder.clean();
    });

    it('should throw a CertificationCandidateCreationOrUpdateError', async () => {
      // given
      certificationCandidate.chose = 'truc';

      // when
      const result = await catchErr(certificationCandidateRepository.save)(certificationCandidate);

      // then
      expect(result).to.be.instanceOf(CertificationCandidateCreationOrUpdateError);
    });

    it('should return the saved Certification candidate', async () => {
      // when
      const certificationCandidateSaved = await certificationCandidateRepository.save(certificationCandidate);

      // then
      expect(certificationCandidateSaved).to.have.property('id').and.not.null;
      expect(certificationCandidateSaved.sessionId).to.equal(sessionId);
    });

    it('should add a single row in the table', async () => {
      const nbCertifCandidatesBeforeSave = await BookshelfCertificationCandidate.count();
      // when
      await certificationCandidateRepository.save(certificationCandidate);
      const nbCertifCandidatesAfterSave = await BookshelfCertificationCandidate.count();

      // then
      expect(nbCertifCandidatesAfterSave).to.equal(nbCertifCandidatesBeforeSave + 1);
    });

  });

  describe('#delete', () => {

    context('when the record to delete is in the table', () => {
      let certificationCandidateToDeleteId;

      beforeEach(async () => {
        // given
        certificationCandidateToDeleteId = databaseBuilder.factory.buildCertificationCandidate().id;
        _.times(5, databaseBuilder.factory.buildCertificationCandidate);
        await databaseBuilder.commit();
      });

      afterEach(() => databaseBuilder.clean());

      it('should return the deleted certification candidate with all its attributes undefined', async () => {
        // when
        const certificationCandidateDeleted = await certificationCandidateRepository.delete(certificationCandidateToDeleteId);

        // then
        _.each(certificationCandidateDeleted, (attributeValue) => {
          expect(attributeValue).to.equal(undefined);
        });
      });

      it('should delete a single row in the table', async () => {
        const nbCertifCandidatesBeforeDeletion = await BookshelfCertificationCandidate.count();
        // when
        await certificationCandidateRepository.delete(certificationCandidateToDeleteId);
        const nbCertifCandidatesAfterDeletion = await BookshelfCertificationCandidate.count();

        // then
        expect(nbCertifCandidatesAfterDeletion).to.equal(nbCertifCandidatesBeforeDeletion - 1);
      });

    });

    context('when the record to delete is not in the table', () => {

      it('should throw a CertificationCandidateDeletionError', async () => {
        // when
        const result = await catchErr(certificationCandidateRepository.delete)(-1);

        // then
        expect(result).to.be.instanceOf(CertificationCandidateDeletionError);
      });

    });

  });

  describe('#findBySessionId', () => {
    let sessionId;

    beforeEach(async () => {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;
      const anotherSessionId = databaseBuilder.factory.buildSession().id;
      _.each([
        { lastName: 'Jackson', firstName: 'Michael', sessionId },
        { lastName: 'Jackson', firstName: 'Janet', sessionId },
        { lastName: 'Mercury', firstName: 'Freddy', sessionId },
        { lastName: 'Gallagher', firstName: 'Noel', sessionId: anotherSessionId },
        { lastName: 'Gallagher', firstName: 'Liam', sessionId: anotherSessionId },
        { lastName: 'Brown', firstName: 'James', sessionId },
      ], (candidate) => {
        databaseBuilder.factory.buildCertificationCandidate(candidate);
      });

      await databaseBuilder.commit();
    });

    afterEach(() => databaseBuilder.clean());

    context('when there are some certification candidates with the given session id', function() {

      it('should fetch, alphabetically sorted, the certification candidates with a specific session ID', async () => {
        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionId(sessionId);

        // then
        expect(actualCandidates[0].firstName).to.equal('James');
        expect(actualCandidates[1].firstName).to.equal('Janet');
        expect(actualCandidates[2].firstName).to.equal('Michael');
        expect(actualCandidates[3].firstName).to.equal('Freddy');
        expect(actualCandidates).to.have.lengthOf(4);
      });

    });

    context('when there is no certification candidates with the given session ID', function() {

      it('should return an empty array', async () => {
        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionId(-1);

        // then
        expect(actualCandidates).to.deep.equal([]);
      });

    });

  });

  describe('#findBySessionIdAndPersonalInfo', () => {
    let sessionId;

    beforeEach(() => {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;
      return databaseBuilder.commit();
    });

    afterEach(() => databaseBuilder.clean());

    context('when there is one certification candidate with the given info in the session', function() {

      let expectedCandidate;

      beforeEach(async () => {
        expectedCandidate = {
          lastName: 'Bideau',
          firstName: 'charlie',
          birthdate: '1999-10-17',
          sessionId,
        };
        databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Bideau',
          firstName: 'Charlie',
          birthdate: '1999-10-17',
          sessionId,
        });

        return databaseBuilder.commit();
      });

      it('should fetch the candidate ignoring case', async () => {
        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionIdAndPersonalInfo(expectedCandidate);

        // then
        expect(actualCandidates).to.have.lengthOf(1);
        expect(actualCandidates[0].firstName.toLowerCase()).to.equal(expectedCandidate.firstName.toLowerCase());
        expect(actualCandidates[0].lastName).to.equal(expectedCandidate.lastName);
        expect(actualCandidates[0].birthdate).to.equal(expectedCandidate.birthdate);
      });

    });

    context('when there is no certification candidates with the given info in the session', function() {

      let onlyCandidateInBDD;
      let notMatchingCandidateInfo;

      beforeEach(() => {
        onlyCandidateInBDD = {
          lastName: 'Bideau',
          firstName: 'Charlie',
          birthdate: '1999-10-17',
          sessionId,
        };
        databaseBuilder.factory.buildCertificationCandidate(onlyCandidateInBDD);

        notMatchingCandidateInfo = {
          lastName: 'Jean',
          firstName: 'Michel',
          birthdate: '2018-01-01',
          sessionId,
        };

        return databaseBuilder.commit();
      });

      it('should not find any candidate', async () => {
        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionIdAndPersonalInfo(notMatchingCandidateInfo);

        // then
        expect(actualCandidates).to.be.empty;
      });

    });

    context('when there are more than one certification candidate with the given info in the session', function() {

      let commonCandidateInfo;

      beforeEach(() => {
        commonCandidateInfo = {
          lastName: 'Bideau',
          firstName: 'Charlie',
          birthdate: '1999-10-17',
          sessionId,
        };
        databaseBuilder.factory.buildCertificationCandidate(commonCandidateInfo);
        databaseBuilder.factory.buildCertificationCandidate(commonCandidateInfo);

        return databaseBuilder.commit();
      });

      it('should find two candidates', async () => {
        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionIdAndPersonalInfo(commonCandidateInfo);

        // then
        expect(actualCandidates).to.have.lengthOf(2);
        expect(actualCandidates[0].lastName).to.equal(commonCandidateInfo.lastName);
        expect(actualCandidates[1].lastName).to.equal(commonCandidateInfo.lastName);
        expect(actualCandidates[0].id).to.not.equal(actualCandidates[1].id);
      });
    });

  });

  describe('#setSessionCandidates', () => {
    let sessionId;
    let existingCertificationCandidateIds;
    let newCertificationCandidates;

    beforeEach(() => {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;
      existingCertificationCandidateIds = _.times(10, () => databaseBuilder.factory.buildCertificationCandidate({ sessionId }).id);
      newCertificationCandidates = _.times(5, () => {
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId });
        certificationCandidate.id = undefined;
        return certificationCandidate;
      });

      return databaseBuilder.commit();
    });

    afterEach(async() => {
      await knex('certification-candidates').delete();
      return databaseBuilder.clean();
    });

    context('when there are some certification candidates to delete', function() {

      it('should delete existing certification candidates in session', async () => {
        // when
        await certificationCandidateRepository.setSessionCandidates(sessionId, newCertificationCandidates);

        // then
        const actualCertificationCandidates = await knex('certification-candidates').where({ sessionId });
        const actualIds = _.map(actualCertificationCandidates, 'id');

        expect(_.intersection(existingCertificationCandidateIds, actualIds)).to.be.empty;
      });

      it('should save the new certification candidates', async () => {
        // when
        await certificationCandidateRepository.setSessionCandidates(sessionId, newCertificationCandidates);

        // then
        const actualCertificationCandidates = await knex('certification-candidates').select('firstName').where({ sessionId });
        const actualFirstNames = _.map(actualCertificationCandidates, 'firstName');
        expect(_.map(newCertificationCandidates, 'firstName')).to.have.members(actualFirstNames);
        expect(newCertificationCandidates.length).to.equal(actualFirstNames.length);
      });

    });

    context('when delete succeeds and save fails', () => {

      it('should rollback after save fails', async () => {
        // given
        newCertificationCandidates[0].sessionId = newCertificationCandidates[0].sessionId + 1;

        // when
        const error = await catchErr(certificationCandidateRepository.setSessionCandidates)(sessionId, newCertificationCandidates);

        // then
        const actualCertificationCandidates = await knex('certification-candidates').where({ sessionId });
        const actualIds = _.map(actualCertificationCandidates, 'id');

        expect(error).to.be.an.instanceOf(CertificationCandidateCreationOrUpdateError);
        expect(actualIds).to.have.members(existingCertificationCandidateIds);
        expect(actualIds.length).to.equal(existingCertificationCandidateIds.length);
      });

    });

  });

});
