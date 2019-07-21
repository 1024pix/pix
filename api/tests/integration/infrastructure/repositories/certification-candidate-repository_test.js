const { databaseBuilder, expect, knex } = require('../../../test-helper');
const _ = require('lodash');
const CertificationCandidate = require('../../../../lib/domain/models/CertificationCandidate');
const BookshelfCertificationCandidate = require('../../../../lib/infrastructure/data/certification-candidate');
const certificationCandidateRepository = require('../../../../lib/infrastructure/repositories/certification-candidate-repository');
const { CertificationCandidateDeletionError, CertificationCandidateCreationOrUpdateError, NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | CertificationCandidate', function() {

  describe('#get', () => {
    let certificationCandidate;

    beforeEach(async () => {
      // given
      certificationCandidate = databaseBuilder.factory.buildCertificationCandidate();
      _.times(5, () => databaseBuilder.factory.buildCertificationCandidate());
      await databaseBuilder.commit();
    });

    afterEach(() => databaseBuilder.clean());

    it('should return certification candidate informations in a domain Object', async () => {
      // when
      const retrievedCertificationCandidate = await certificationCandidateRepository.get(certificationCandidate.id);
      // then
      expect(retrievedCertificationCandidate).to.be.instanceOf(CertificationCandidate);
      expect(retrievedCertificationCandidate.firstName).to.be.equal(certificationCandidate.firstName);
      expect(retrievedCertificationCandidate.lastName).to.be.equal(certificationCandidate.lastName);
      expect(retrievedCertificationCandidate.birthCity).to.be.equal(certificationCandidate.birthCity);
      expect(retrievedCertificationCandidate.birthProvince).to.be.equal(certificationCandidate.birthProvince);
      expect(retrievedCertificationCandidate.birthCountry).to.be.equal(certificationCandidate.birthCountry);
      expect(retrievedCertificationCandidate.externalId).to.be.equal(certificationCandidate.externalId);
      expect(retrievedCertificationCandidate.extraTimePercentage).to.be.equal(certificationCandidate.extraTimePercentage);
      expect(retrievedCertificationCandidate.sessionId).to.be.equal(certificationCandidate.sessionId);
    });

    it('should return a Not found error when no certification candidate was found', function() {
      // when
      const promise = certificationCandidateRepository.get(1);

      // then
      return expect(promise).to.be.rejectedWith(NotFoundError);
    });

  });

  describe('#save', () => {
    let sessionId;
    let certificationCandidate;

    beforeEach(async () => {
      await databaseBuilder.clean();
      // given
      sessionId = databaseBuilder.factory.buildSession({ id: 10 }).id;
      certificationCandidate = new CertificationCandidate({
        firstName: 'Pix',
        lastName: 'Lover',
        birthCountry: 'France',
        birthProvince: '75',
        birthCity: 'HaussmanPolis',
        externalId: 'ABCDEF123',
        birthdate: '12/07/1990',
        extraTimePercentage: '25.5',
        sessionId,
      });

      return databaseBuilder.commit();
    });

    afterEach(async() => {
      await knex('certification-candidates').delete();
      await databaseBuilder.clean();
    });

    it('should throw a CertificationCandidateCreationOrUpdateError', () => {
      // given
      certificationCandidate.chose = 'truc';

      // when
      const promise = certificationCandidateRepository.save(certificationCandidate);

      // then
      return expect(promise).to.have.been.rejectedWith(CertificationCandidateCreationOrUpdateError);
    });

    it('should return the saved Certification candidate', async () => {
      // when
      const certificationCandidateSaved = await certificationCandidateRepository.save(certificationCandidate);

      // then
      expect(certificationCandidateSaved).to.be.an.instanceOf(CertificationCandidate);
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

      it('should return the deleted certification candidate with all its attributes undefined or with their default value', async () => {
        // when
        const certificationCandidateDeleted = await certificationCandidateRepository.delete(certificationCandidateToDeleteId);

        // then
        expect(certificationCandidateDeleted).to.be.an.instanceOf(CertificationCandidate);
        _.each(certificationCandidateDeleted, async (attributeValue) => {
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
      let nonExistantCertificationCandidateId;

      beforeEach(async () => {
        // given
        nonExistantCertificationCandidateId = databaseBuilder.factory.buildCertificationCandidate().id + 1;
        await databaseBuilder.commit();
      });

      afterEach(() => databaseBuilder.clean());

      it('should throw a CertificationCandidateDeletionError',() => {
        // when
        const promise = certificationCandidateRepository.delete(nonExistantCertificationCandidateId);

        // then
        return expect(promise).to.have.been.rejectedWith(CertificationCandidateDeletionError);
      });
    });
  });

  describe('#findBySessionId', () => {

    context('when there are some certification candidates with the given session id', function() {

      beforeEach(async () => {
        // given
        await databaseBuilder.clean();
        _.each([
          { id: 1 },
          { id: 2 },
        ], (session) => {
          databaseBuilder.factory.buildSession(session);
        });
        _.each([
          { id: 1, lastName: 'Jackson', firstName: 'Michael', sessionId: 1 },
          { id: 2, lastName: 'Jackson', firstName: 'Janet', sessionId: 1 },
          { id: 3, lastName: 'Mercury', firstName: 'Freddy', sessionId: 1 },
          { id: 4, lastName: 'Gallagher', firstName: 'Noel', sessionId: 2 },
          { id: 5, lastName: 'Gallagher', firstName: 'Liam', sessionId: 2 },
          { id: 6, lastName: 'Brown', firstName: 'James', sessionId: 2 },
        ], (candidate) => {
          databaseBuilder.factory.buildCertificationCandidate(candidate);
        });

        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should fetch, alphabetically sorted, the certification candidates with with a specific session ID', async () => {
        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionId(2);

        // then
        expect(actualCandidates[0].id).to.equal(6);
        expect(actualCandidates[1].id).to.equal(5);
        expect(actualCandidates[2].id).to.equal(4);
        expect(actualCandidates).to.have.lengthOf(3);
      });

    });

    context('when there is no certification candidates with the given session ID', function() {

      beforeEach(async () => {
        await databaseBuilder.clean();
        // given
        databaseBuilder.factory.buildSession({ id: 1 });
        _.each([
          { id: 1, lastName: 'Jackson', firstName: 'Michael', sessionId: 1 },
          { id: 2, lastName: 'Jackson', firstName: 'Janet', sessionId: 1 },
          { id: 3, lastName: 'Mercury', firstName: 'Freddy', sessionId: 1 },
        ], (candidate) => {
          databaseBuilder.factory.buildCertificationCandidate(candidate);
        });

        return databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return an empty array', async () => {
        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionId(2);

        // then
        expect(actualCandidates).to.deep.equal([]);
      });

    });

  });

  describe('checkIfUserCertificationCenterMembershipHasAccessToCertificationCandidate', () => {
    let userId, forbiddenUserId, certificationCandidateId;

    beforeEach(async () => {
      // given
      userId = databaseBuilder.factory.buildUser().id;
      forbiddenUserId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const forbiddenCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      databaseBuilder.factory.buildCertificationCenterMembership({ userId: forbiddenUserId, certificationCenterId: forbiddenCertificationCenterId });
      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
      const forbiddenSessionId = databaseBuilder.factory.buildSession({ certificationCenterId: forbiddenCertificationCenterId }).id;
      certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({ sessionId }).id;
      databaseBuilder.factory.buildCertificationCandidate({ sessionId: forbiddenSessionId });

      await databaseBuilder.commit();
    });

    afterEach(() => databaseBuilder.clean());

    it('should return true when the user has a certification center membership linked to the session to which belong the certification candidate', async () => {
      //when
      const access = await certificationCandidateRepository.checkIfUserCertificationCenterMembershipHasAccessToCertificationCandidate(certificationCandidateId, userId);

      //then
      expect(access).to.be.true;
    });

    it('should return false when the user has no certification center membership linked to the session to which belong the certification candidate', async () => {
      //when
      const access = await certificationCandidateRepository.checkIfUserCertificationCenterMembershipHasAccessToCertificationCandidate(certificationCandidateId, forbiddenUserId);

      //then
      expect(access).to.be.false;
    });

  });

  describe('checkIfCertificationCandidateIsSafeForDeletion', () => {
    let certificationCandidateId, notSafeCertificationCandidateId;

    beforeEach(async () => {
      // given
      const sessionId = databaseBuilder.factory.buildSession({ date: new Date('2000-01-01') }).id;
      const notSafeSessionId = databaseBuilder.factory.buildSession({ date: new Date() }).id;
      certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({ sessionId }).id;
      notSafeCertificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({ sessionId: notSafeSessionId });

      await databaseBuilder.commit();
    });

    afterEach(() => databaseBuilder.clean());

    it('should return true when the certification candidate is safe for deletion', async () => {
      //when
      const access = await certificationCandidateRepository.checkIfCertificationCandidateIsSafeForDeletion(certificationCandidateId);

      //then
      expect(access).to.be.true;
    });

    it('should throw a CertificationCandidateDeletionError when the certification candidate is safe for deletion', async () => {
      //when
      try {
        await certificationCandidateRepository.checkIfCertificationCandidateIsSafeForDeletion(notSafeCertificationCandidateId);
      } catch (error) {
        //then
        expect(error).to.be.an.instanceOf(CertificationCandidateDeletionError);
      }
    });

  });

});
