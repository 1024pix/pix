const { databaseBuilder, expect, knex, domainBuilder, catchErr } = require('../../../test-helper');
const BookshelfCertificationCandidate = require('../../../../lib/infrastructure/data/certification-candidate');
const certificationCandidateRepository = require('../../../../lib/infrastructure/repositories/certification-candidate-repository');
const {
  NotFoundError,
  CertificationCandidateCreationOrUpdateError,
  CertificationCandidateDeletionError,
  CertificationCandidateMultipleUserLinksWithinSessionError,
} = require('../../../../lib/domain/errors');
const _ = require('lodash');

describe('Integration | Repository | CertificationCandidate', function() {

  describe('#saveInSession', () => {
    let certificationCandidate;
    let sessionId;

    beforeEach(() => {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;

      return databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('certification-candidates').delete();
    });

    context('when a proper candidate is being saved', () => {

      beforeEach(async () => {
        certificationCandidate = domainBuilder.buildCertificationCandidate({
          firstName: 'Pix',
          lastName: 'Lover',
          birthCity: 'HaussmanPolis',
          externalId: 'ABCDEF123',
          birthdate: '1990-07-12',
          extraTimePercentage: '0.05',
        });

        delete certificationCandidate.id;
      });

      it('should save the Certification candidate in session', async () => {
        // when
        await certificationCandidateRepository.saveInSession({ certificationCandidate, sessionId });

        // then
        const certificationCandidatesInSession = await knex('certification-candidates')
          .where({ sessionId }).select('firstName');
        expect(certificationCandidatesInSession[0].firstName).to.equal(certificationCandidate.firstName);
      });

      context('when adding a new candidate', () => {
        it('should add a single row in the table', async () => {
          // given
          const nbCertifCandidatesBeforeSave = await BookshelfCertificationCandidate.count();

          // when
          await certificationCandidateRepository.saveInSession({ certificationCandidate, sessionId });

          // then
          const nbCertifCandidatesAfterSave = await BookshelfCertificationCandidate.count();

          expect(nbCertifCandidatesAfterSave).to.equal(nbCertifCandidatesBeforeSave + 1);
        });
      });

      context('when updating the candidate', () => {

        beforeEach(() => {
          certificationCandidate.id = databaseBuilder.factory.buildCertificationCandidate().id;
          return databaseBuilder.commit();
        });

        it('should not add a row in the table', async () => {
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

  describe('linkToUser', () => {
    let certificationCandidate;
    let userId;

    beforeEach(() => {
      // given
      certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({ userId: null });
      userId = databaseBuilder.factory.buildUser().id;

      return databaseBuilder.commit();
    });

    context('when the user is not linked to any candidate in the same session', () => {

      it('should successfully link the candidate to the user', async () => {
        // when
        await certificationCandidateRepository.linkToUser({ id: certificationCandidate.id, userId });

        // then
        const linkedCertificationCandidate = await knex('certification-candidates')
          .where({ id: certificationCandidate.id }).select('userId');
        expect(linkedCertificationCandidate[0].userId).to.equal(userId);
      });
    });

    context('when the user is already linked to a candidate in the same session', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildCertificationCandidate({ userId, sessionId: certificationCandidate.sessionId });
        return databaseBuilder.commit();
      });

      it('should throw a CertificationCandidateMultipleUserLinksWithinSessionError', async () => {
        // when
        const result = await catchErr(certificationCandidateRepository.linkToUser)({ id: certificationCandidate.id, userId });

        // then
        expect(result).to.be.instanceOf(CertificationCandidateMultipleUserLinksWithinSessionError);
      });

    });

  });

  describe('#finalize', () => {
    let certificationCandidate;
    let sessionId;

    beforeEach(() => {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;

      return databaseBuilder.commit();
    });

    beforeEach(async () => {
      certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
        hasSeenEndTestScreen: false,
        examinerComment: null,
        sessionId,
      });

      return databaseBuilder.commit();
    });

    it('should return the finalized certification candidates', async () => {
      // given
      certificationCandidate.hasSeenEndTestScreen = true;
      certificationCandidate.examinerComment = 'J\'aime les fruits et les poulets';

      // when
      await certificationCandidateRepository.finalize({ certificationCandidate });

      // then
      const actualCertificationCandidates = await knex('certification-candidates').where({ sessionId });
      expect(actualCertificationCandidates[0].hasSeenEndTestScreen).to.equal(certificationCandidate.hasSeenEndTestScreen);
      expect(actualCertificationCandidates[0].examinerComment).to.equal(certificationCandidate.examinerComment);
    });

  });

  describe('#finalizeAll', () => {
    let certificationCandidate1;
    let certificationCandidate2;
    let sessionId;

    beforeEach(() => {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;

      return databaseBuilder.commit();
    });

    context('when candidates are being successfully finalized', () => {

      beforeEach(async () => {
        certificationCandidate1 = databaseBuilder.factory.buildCertificationCandidate({
          hasSeenEndTestScreen: false,
          examinerComment: null,
          sessionId,
        });

        certificationCandidate2 = databaseBuilder.factory.buildCertificationCandidate({
          hasSeenEndTestScreen: false,
          examinerComment: null,
          sessionId,
        });

        return databaseBuilder.commit();
      });

      it('should return the finalized certification candidates', async () => {
        // given
        certificationCandidate1.hasSeenEndTestScreen = true;
        certificationCandidate2.examinerComment = 'J\'aime les fruits et les poulets';

        // when
        await certificationCandidateRepository.finalizeAll([certificationCandidate1, certificationCandidate2]);

        // then
        const actualCertificationCandidates = await knex('certification-candidates').where({ sessionId });
        const actualCandidate1 = _.find(actualCertificationCandidates, { id: certificationCandidate1.id });
        const actualCandidate2 = _.find(actualCertificationCandidates, { id: certificationCandidate2.id });
        expect(actualCandidate1.hasSeenEndTestScreen).to.equal(certificationCandidate1.hasSeenEndTestScreen);
        expect(actualCandidate2.examinerComment).to.equal(certificationCandidate2.examinerComment);
      });

    });

    context('when finalization fails', () => {

      beforeEach(async () => {
        certificationCandidate1 = databaseBuilder.factory.buildCertificationCandidate({
          hasSeenEndTestScreen: false,
          examinerComment: null,
          sessionId,
        });

        certificationCandidate2 = databaseBuilder.factory.buildCertificationCandidate({
          hasSeenEndTestScreen: false,
          examinerComment: null,
          sessionId,
        });

        return databaseBuilder.commit();
      });

      it('should have left the candidates as they were and rollback updates if any', async () => {
        // given
        certificationCandidate1.examinerComment = 'J\'aime les fruits et les poulets';
        certificationCandidate2.hasSeenEndTestScreen = 'je suis supposé être un booléen';

        // when
        const error = await catchErr(certificationCandidateRepository.finalizeAll)([certificationCandidate1, certificationCandidate2]);

        // then
        const actualCertificationCandidates = await knex('certification-candidates').where({ sessionId });
        const actualCandidate1 = _.find(actualCertificationCandidates, { id: certificationCandidate1.id });
        const actualCandidate2 = _.find(actualCertificationCandidates, { id: certificationCandidate2.id });
        expect(actualCandidate2.examinerComment).to.equal(null);
        expect(actualCandidate1.hasSeenEndTestScreen).to.equal(false);
        expect(error).to.be.an.instanceOf(CertificationCandidateCreationOrUpdateError);
      });

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

  describe('#findBySessionIdWithCertificationCourse', () => {
    let sessionId;
    let existingCertificationCourseId;

    beforeEach(async () => {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;
      const anotherSessionId = databaseBuilder.factory.buildSession().id;
      const userId = databaseBuilder.factory.buildUser().id;
      // In session with certificationCourse
      databaseBuilder.factory.buildCertificationCandidate({ lastName: 'Jackson', firstName: 'Michaele', sessionId, userId });
      existingCertificationCourseId = databaseBuilder.factory.buildCertificationCourse({ sessionId, userId }).id;
      // In session without certificationCourse
      databaseBuilder.factory.buildCertificationCandidate({ lastName: 'Jackson', firstName: 'Janet', sessionId, certificationCourse: null });
      databaseBuilder.factory.buildCertificationCandidate({ lastName: 'Letto', firstName: 'Roger', sessionId, userId: null, certificationCourse: null });
      // In other session
      databaseBuilder.factory.buildCertificationCandidate({ lastName: 'Jackson', firstName: 'Michael', sessionId: anotherSessionId, userId });

      await databaseBuilder.commit();
    });

    context('when there are some certification candidates with the given session id', function() {

      it('should fetch, alphabetically sorted, the certification candidates with a specific session ID', async () => {
        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionIdWithCertificationCourse(sessionId);

        // then
        expect(actualCandidates[0].firstName).to.equal('Janet');
        expect(actualCandidates[1].firstName).to.equal('Michaele');
        expect(actualCandidates[2].firstName).to.equal('Roger');
        expect(actualCandidates).to.have.lengthOf(3);
      });

      it('should fetch their certificationCourse if any', async () => {
        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionIdWithCertificationCourse(sessionId);

        // then
        expect(actualCandidates[0].certificationCourse).to.be.undefined;
        expect(actualCandidates[1].certificationCourse.id).to.equal(existingCertificationCourseId);
        expect(actualCandidates[2].certificationCourse).to.be.undefined;
      });

    });

    context('when there is no certification candidates with the given session ID', function() {

      it('should return an empty array', async () => {
        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionIdWithCertificationCourse(-1);

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
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId, userId: null });
        certificationCandidate.id = undefined;
        return certificationCandidate;
      });

      return databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('certification-candidates').delete();
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

  describe('#getBySessionIdAndUserId', () => {
    let sessionId;
    let userId;

    beforeEach(() => {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;
      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId });
      return databaseBuilder.commit();
    });

    context('when there is one certification candidate with the given session id and user id', function() {

      it('should fetch the candidate', async () => {
        // when
        const actualCandidates = await certificationCandidateRepository.getBySessionIdAndUserId({ sessionId, userId });

        // then
        expect(actualCandidates.sessionId).to.equal(sessionId);
        expect(actualCandidates.userId).to.equal(userId);
      });

    });

    context('when there is no certification candidate with the given session id and user id', function() {

      it('should throw an error', async () => {
        // when
        const result = await catchErr(certificationCandidateRepository.getBySessionIdAndUserId)({ sessionId: (sessionId + 1), userId: (userId + 1) });

        // then
        expect(result).to.be.instanceOf(NotFoundError);
      });

    });

  });

  describe('#findOneBySessionIdAndUserId', () => {
    let sessionId;
    let userId;

    beforeEach(() => {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;
      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCandidate({ sessionId: sessionId, userId: userId });
      return databaseBuilder.commit();
    });

    context('when there is one certification candidate with the given session id and user id', function() {

      it('should fetch the candidate', async () => {
        // when
        const actualCandidates = await certificationCandidateRepository.findOneBySessionIdAndUserId({ sessionId, userId });

        // then
        expect(actualCandidates.sessionId).to.equal(sessionId);
        expect(actualCandidates.userId).to.equal(userId);
      });

    });

    context('when there is no certification candidate with the given session id and user id', function() {

      it('should not find any candidate', async () => {
        // when
        const actualCandidates = await certificationCandidateRepository.findOneBySessionIdAndUserId({ sessionId: (sessionId + 1), userId: (userId + 1) });

        // then
        expect(actualCandidates).to.be.undefined;
      });

    });

  });

  describe('#doesLinkedCertificationCandidateInSessionExist', () => {
    let sessionId;

    beforeEach(() => {
      sessionId = databaseBuilder.factory.buildSession().id;
      return databaseBuilder.commit();
    });

    context('when there are candidates in the session that are already linked to a user', () => {

      beforeEach(() => {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId });
        databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId: null });
        return databaseBuilder.commit();
      });

      it('should return true', async () => {
        // when
        const linkedCandidateExists = await certificationCandidateRepository.doesLinkedCertificationCandidateInSessionExist({ sessionId });

        // then
        expect(linkedCandidateExists).to.be.true;
      });
    });

    context('when there are no candidate in the session that are linked to any user', () => {

      beforeEach(() => {
        // given
        databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId: null });
        databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId: null });
        return databaseBuilder.commit();
      });

      it('should return false', async () => {
        // when
        const linkedCandidateExists = await certificationCandidateRepository.doesLinkedCertificationCandidateInSessionExist({ sessionId });

        // then
        expect(linkedCandidateExists).to.be.false;
      });
    });

  });

});
