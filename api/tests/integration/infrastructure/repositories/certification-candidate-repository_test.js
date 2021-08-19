const { databaseBuilder, expect, knex, domainBuilder, catchErr } = require('../../../test-helper');
const BookshelfCertificationCandidate = require('../../../../lib/infrastructure/orm-models/CertificationCandidate');
const certificationCandidateRepository = require('../../../../lib/infrastructure/repositories/certification-candidate-repository');
const {
  NotFoundError,
  CertificationCandidateCreationOrUpdateError,
  CertificationCandidateDeletionError,
  CertificationCandidateMultipleUserLinksWithinSessionError,
} = require('../../../../lib/domain/errors');
const _ = require('lodash');

describe('Integration | Repository | CertificationCandidate', function() {

  describe('#saveInSession', function() {
    let certificationCandidate;
    let sessionId;

    beforeEach(function() {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;

      return databaseBuilder.commit();
    });

    afterEach(function() {
      return knex('certification-candidates').delete();
    });

    context('when a proper candidate is being saved', function() {

      beforeEach(async function() {
        certificationCandidate = domainBuilder.buildCertificationCandidate({
          firstName: 'Pix',
          lastName: 'Lover',
          sex: 'F',
          birthPostalCode: '75000',
          birthINSEECode: '75000',
          birthCity: 'HaussmanPolis',
          externalId: 'ABCDEF123',
          birthdate: '1990-07-12',
          extraTimePercentage: '0.05',
          schoolingRegistrationId: null,
        });

        delete certificationCandidate.id;
      });

      it('should save the Certification candidate in session', async function() {
        // when
        await certificationCandidateRepository.saveInSession({ certificationCandidate, sessionId });

        // then
        const [firstCertificationCandidatesInSession] = await certificationCandidateRepository.findBySessionId(sessionId);
        const attributesToOmit = ['createdAt', 'sessionId', 'userId', 'id'];
        expect(_.omit(firstCertificationCandidatesInSession, attributesToOmit)).to.deep.equal(_.omit(certificationCandidate, attributesToOmit));
        expect(firstCertificationCandidatesInSession.sessionId).to.equal(sessionId);
      });

      context('when adding a new candidate', function() {
        it('should add a single row in the table', async function() {
          // given
          const nbCertifCandidatesBeforeSave = await BookshelfCertificationCandidate.count();

          // when
          await certificationCandidateRepository.saveInSession({ certificationCandidate, sessionId });

          // then
          const nbCertifCandidatesAfterSave = await BookshelfCertificationCandidate.count();

          expect(nbCertifCandidatesAfterSave).to.equal(nbCertifCandidatesBeforeSave + 1);
        });
      });

      context('when updating the candidate', function() {

        beforeEach(function() {
          certificationCandidate.id = databaseBuilder.factory.buildCertificationCandidate().id;
          return databaseBuilder.commit();
        });

        it('should not add a row in the table', async function() {
          // given
          const nbCertifCandidatesBeforeSave = await BookshelfCertificationCandidate.count();

          // when
          await certificationCandidateRepository.saveInSession({ certificationCandidate, sessionId });

          // then
          const nbCertifCandidatesAfterSave = await BookshelfCertificationCandidate.count();

          expect(nbCertifCandidatesAfterSave).to.equal(nbCertifCandidatesBeforeSave);
        });
      });

    });

  });

  describe('linkToUser', function() {
    let certificationCandidate;
    let userId;

    beforeEach(function() {
      // given
      certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({ userId: null });
      userId = databaseBuilder.factory.buildUser().id;

      return databaseBuilder.commit();
    });

    context('when the user is not linked to any candidate in the same session', function() {

      it('should successfully link the candidate to the user', async function() {
        // when
        await certificationCandidateRepository.linkToUser({ id: certificationCandidate.id, userId });

        // then
        const linkedCertificationCandidate = await knex('certification-candidates')
          .where({ id: certificationCandidate.id }).select('userId');
        expect(linkedCertificationCandidate[0].userId).to.equal(userId);
      });
    });

    context('when the user is already linked to a candidate in the same session', function() {

      beforeEach(function() {
        databaseBuilder.factory.buildCertificationCandidate({ userId, sessionId: certificationCandidate.sessionId });
        return databaseBuilder.commit();
      });

      it('should throw a CertificationCandidateMultipleUserLinksWithinSessionError', async function() {
        // when
        const result = await catchErr(certificationCandidateRepository.linkToUser)({ id: certificationCandidate.id, userId });

        // then
        expect(result).to.be.instanceOf(CertificationCandidateMultipleUserLinksWithinSessionError);
      });

    });

  });

  describe('#delete', function() {

    context('when the record to delete is in the table', function() {
      let certificationCandidateToDeleteId;

      beforeEach(function() {
        // given
        certificationCandidateToDeleteId = databaseBuilder.factory.buildCertificationCandidate().id;
        _.times(5, databaseBuilder.factory.buildCertificationCandidate);
        return databaseBuilder.commit();
      });

      it('should return true when deletion goes well', async function() {
        // when
        const isDeleted = await certificationCandidateRepository.delete(certificationCandidateToDeleteId);

        // then
        expect(isDeleted).to.be.true;
      });

      it('should delete a single row in the table', async function() {
        const nbCertifCandidatesBeforeDeletion = await BookshelfCertificationCandidate.count();
        // when
        await certificationCandidateRepository.delete(certificationCandidateToDeleteId);
        const nbCertifCandidatesAfterDeletion = await BookshelfCertificationCandidate.count();

        // then
        expect(nbCertifCandidatesAfterDeletion).to.equal(nbCertifCandidatesBeforeDeletion - 1);
      });

    });

    context('when the record to delete is not in the table', function() {

      it('should throw a CertificationCandidateDeletionError', async function() {
        // when
        const result = await catchErr(certificationCandidateRepository.delete)(-1);

        // then
        expect(result).to.be.instanceOf(CertificationCandidateDeletionError);
      });

    });

  });

  describe('#isNotLinked', function() {

    context('when the candidate is linked', function() {
      let certificationCandidateId;

      beforeEach(function() {
        // given
        certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate().id;
        return databaseBuilder.commit();
      });

      it('should return false', async function() {
        // when
        const isNotLinked = await certificationCandidateRepository.isNotLinked(certificationCandidateId);

        // then
        expect(isNotLinked).to.be.false;
      });

    });

    context('when the candidate is not linked', function() {
      let certificationCandidateToDeleteId;

      beforeEach(function() {
        // given
        certificationCandidateToDeleteId = databaseBuilder.factory.buildCertificationCandidate({ userId: null }).id;
        return databaseBuilder.commit();
      });

      it('should return true', async function() {
        // when
        const isNotLinked = await certificationCandidateRepository.isNotLinked(certificationCandidateToDeleteId);

        // then
        expect(isNotLinked).to.be.true;
      });

    });

  });

  describe('#findBySessionIdWithCertificationCourse', function() {
    let sessionId;

    beforeEach(async function() {
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

    context('when there are some certification candidates with the given session id', function() {

      it('should fetch, alphabetically sorted, the certification candidates with a specific session ID', async function() {
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

      it('should return an empty array', async function() {
        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionId(-1);

        // then
        expect(actualCandidates).to.deep.equal([]);
      });

    });

  });

  describe('#findBySessionIdAndPersonalInfo', function() {
    let sessionId;

    beforeEach(function() {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;
      return databaseBuilder.commit();
    });

    context('when there is one certification candidate with the given info in the session', function() {

      it('should fetch the candidate ignoring case', async function() {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({
          id: 123,
          lastName: 'Bideau',
          firstName: 'Charlie',
          birthdate: '1999-10-17',
          sex: 'M',
          birthPostalCode: null,
          birthINSEECode: '66212',
          birthCity: 'Torreilles',
          birthProvinceCode: '66',
          birthCountry: 'France',
          email: 'charlie@example.net',
          resultRecipientEmail: null,
          sessionId,
          externalId: null,
          createdAt: new Date('2020-01-01'),
          extraTimePercentage: null,
          userId: null,
          schoolingRegistrationId: null,
        });
        databaseBuilder.factory.buildCertificationCandidate(certificationCandidate);
        await databaseBuilder.commit();
        const personalInfoAndId = {
          lastName: 'Bideau',
          firstName: 'CHARLIE',
          birthdate: '1999-10-17',
          sessionId,
        };

        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionIdAndPersonalInfo(personalInfoAndId);

        // then
        expect(actualCandidates).to.have.lengthOf(1);
        expect(actualCandidates[0]).to.deep.equal(certificationCandidate);
      });

      it('should fetch the candidate ignoring special characters, non canonical characters and zero-width spaces', async function() {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({
          id: 123,
          lastName: 'Bideau',
          firstName: 'Charlie',
          birthdate: '1999-10-17',
          sex: 'M',
          birthPostalCode: null,
          birthINSEECode: '66212',
          birthCity: 'Torreilles',
          birthProvinceCode: '66',
          birthCountry: 'France',
          email: 'charlie@example.net',
          resultRecipientEmail: null,
          sessionId,
          externalId: null,
          createdAt: new Date('2020-01-01'),
          extraTimePercentage: null,
          userId: null,
          schoolingRegistrationId: null,
        });
        databaseBuilder.factory.buildCertificationCandidate(certificationCandidate);
        await databaseBuilder.commit();
        const zeroWidthSpaceChar = '​';
        const personalInfoAndId = {
          lastName: 'Bïdéà u',
          firstName: `c' ha-rli${zeroWidthSpaceChar}e`,
          birthdate: '1999-10-17',
          sessionId,
        };

        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionIdAndPersonalInfo(personalInfoAndId);

        // then
        expect(actualCandidates).to.have.lengthOf(1);
        expect(actualCandidates[0]).to.deep.equal(certificationCandidate);
      });

    });

    context('when there is no certification candidates with the given info in the session', function() {

      let onlyCandidateInBDD;
      let notMatchingCandidateInfo;

      beforeEach(function() {
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

      it('should not find any candidate', async function() {
        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionIdAndPersonalInfo(notMatchingCandidateInfo);

        // then
        expect(actualCandidates).to.be.empty;
      });

    });

    context('when there are more than one certification candidate with the given info in the session', function() {

      let commonCandidateInfo;

      beforeEach(function() {
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

      it('should find two candidates', async function() {
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

  describe('#setSessionCandidates', function() {
    let sessionId;
    let existingCertificationCandidateIds;
    let newCertificationCandidates;

    beforeEach(function() {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;
      existingCertificationCandidateIds = _.times(10, () => databaseBuilder.factory.buildCertificationCandidate({ sessionId }).id);
      newCertificationCandidates = _.times(5, () => {
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId, userId: null });
        certificationCandidate.id = undefined;
        return certificationCandidate;
      });

      return databaseBuilder.commit();
    });

    afterEach(function() {
      return knex('certification-candidates').delete();
    });

    context('when there are some certification candidates to delete', function() {

      it('should delete existing certification candidates in session', async function() {
        // when
        await certificationCandidateRepository.setSessionCandidates(sessionId, newCertificationCandidates);

        // then
        const actualCertificationCandidates = await knex('certification-candidates').where({ sessionId });
        const actualIds = _.map(actualCertificationCandidates, 'id');

        expect(_.intersection(existingCertificationCandidateIds, actualIds)).to.be.empty;
      });

      it('should save the new certification candidates', async function() {
        // when
        await certificationCandidateRepository.setSessionCandidates(sessionId, newCertificationCandidates);

        // then
        const actualCertificationCandidates = await knex('certification-candidates').select('firstName').where({ sessionId });
        const actualFirstNames = _.map(actualCertificationCandidates, 'firstName');
        expect(_.map(newCertificationCandidates, 'firstName')).to.have.members(actualFirstNames);
        expect(newCertificationCandidates.length).to.equal(actualFirstNames.length);
      });

    });

    context('when delete succeeds and save fails', function() {

      it('should rollback after save fails', async function() {
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

  describe('#getBySessionIdAndUserId', function() {
    let sessionId;
    let userId;

    beforeEach(function() {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;
      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId });
      return databaseBuilder.commit();
    });

    context('when there is one certification candidate with the given session id and user id', function() {

      it('should fetch the candidate', async function() {
        // when
        const actualCandidates = await certificationCandidateRepository.getBySessionIdAndUserId({ sessionId, userId });

        // then
        expect(actualCandidates.sessionId).to.equal(sessionId);
        expect(actualCandidates.userId).to.equal(userId);
      });

    });

    context('when there is no certification candidate with the given session id and user id', function() {

      it('should throw an error', async function() {
        // when
        const result = await catchErr(certificationCandidateRepository.getBySessionIdAndUserId)({ sessionId: (sessionId + 1), userId: (userId + 1) });

        // then
        expect(result).to.be.instanceOf(NotFoundError);
      });

    });

  });

  describe('#findOneBySessionIdAndUserId', function() {
    let sessionId;
    let userId;

    beforeEach(function() {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;
      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCandidate({ sessionId: sessionId, userId: userId });
      return databaseBuilder.commit();
    });

    context('when there is one certification candidate with the given session id and user id', function() {

      it('should fetch the candidate', async function() {
        // when
        const actualCandidates = await certificationCandidateRepository.findOneBySessionIdAndUserId({ sessionId, userId });

        // then
        expect(actualCandidates.sessionId).to.equal(sessionId);
        expect(actualCandidates.userId).to.equal(userId);
      });

    });

    context('when there is no certification candidate with the given session id and user id', function() {

      it('should not find any candidate', async function() {
        // when
        const actualCandidates = await certificationCandidateRepository.findOneBySessionIdAndUserId({ sessionId: (sessionId + 1), userId: (userId + 1) });

        // then
        expect(actualCandidates).to.be.undefined;
      });

    });

  });

  describe('#doesLinkedCertificationCandidateInSessionExist', function() {
    let sessionId;

    beforeEach(function() {
      sessionId = databaseBuilder.factory.buildSession().id;
      return databaseBuilder.commit();
    });

    context('when there are candidates in the session that are already linked to a user', function() {

      beforeEach(function() {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId });
        databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId: null });
        return databaseBuilder.commit();
      });

      it('should return true', async function() {
        // when
        const linkedCandidateExists = await certificationCandidateRepository.doesLinkedCertificationCandidateInSessionExist({ sessionId });

        // then
        expect(linkedCandidateExists).to.be.true;
      });
    });

    context('when there are no candidate in the session that are linked to any user', function() {

      beforeEach(function() {
        // given
        databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId: null });
        databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId: null });
        return databaseBuilder.commit();
      });

      it('should return false', async function() {
        // when
        const linkedCandidateExists = await certificationCandidateRepository.doesLinkedCertificationCandidateInSessionExist({ sessionId });

        // then
        expect(linkedCandidateExists).to.be.false;
      });
    });

  });

});
