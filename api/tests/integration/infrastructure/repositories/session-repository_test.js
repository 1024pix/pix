const { databaseBuilder, expect, knex, domainBuilder, catchErr } = require('../../../test-helper');
const _ = require('lodash');
const { NotFoundError } = require('../../../../lib/domain/errors');
const Session = require('../../../../lib/domain/models/Session');
const { statuses } = require('../../../../lib/domain/models/Session');
const sessionRepository = require('../../../../lib/infrastructure/repositories/session-repository');

describe('Integration | Repository | Session', function() {

  describe('#save', () => {
    let session, certificationCenter;

    beforeEach(async () => {
      certificationCenter = databaseBuilder.factory.buildCertificationCenter({});
      session = new Session({
        certificationCenter: certificationCenter.name,
        certificationCenterId: certificationCenter.id,
        address: 'Nice',
        room: '28D',
        examiner: 'Michel Essentiel',
        date: '2017-12-08',
        time: '14:30',
        description: 'Première certification EVER !!!'
      });

      await databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('sessions').delete();
    });

    it('should persist the session in db', async () => {
      // when
      await sessionRepository.save(session);

      // then
      const sessionSaved = await knex('sessions').select();
      expect(sessionSaved).to.have.lengthOf(1);
    });

    it('should return the saved Session', async () => {
      // when
      const savedSession = await sessionRepository.save(session);

      // then
      expect(savedSession).to.be.an.instanceOf(Session);
      expect(savedSession).to.have.property('id').and.not.null;
      expect(savedSession.certificationCenter).to.equal(certificationCenter.name);
    });

  });

  describe('#isSessionCodeAvailable', () => {

    beforeEach(() => {
      databaseBuilder.factory.buildSession({
        certificationCenter: 'Paris',
        address: 'Paris',
        room: 'The lost room',
        examiner: 'Bernard',
        date: '2018-02-23',
        time: '12:00',
        description: 'The lost examen',
        accessCode: 'ABC123'
      });

      return databaseBuilder.commit();
    });

    it('should return true if the accessCode is not in database', async () => {
      // given
      const accessCode = 'DEF123';

      // when
      const isAvailable = await sessionRepository.isSessionCodeAvailable(accessCode);

      // then
      expect(isAvailable).to.be.equal(true);
    });

    it('should return false if the accessCode is in database', async () => {
      // given
      const accessCode = 'ABC123';

      // when
      const isAvailable = await sessionRepository.isSessionCodeAvailable(accessCode);

      // then
      expect(isAvailable).to.be.equal(false);

    });
  });

  describe('#isFinalized', () => {
    let finalizedSessionId;
    let notFinalizedSessionId;

    beforeEach(() => {
      finalizedSessionId = databaseBuilder.factory.buildSession({ finalizedAt: new Date() }).id;
      notFinalizedSessionId = databaseBuilder.factory.buildSession({ finalizedAt: null }).id;

      return databaseBuilder.commit();
    });

    it('should return true if the session status is finalized', async () => {
      // when
      const isFinalized = await sessionRepository.isFinalized(finalizedSessionId);

      // then
      expect(isFinalized).to.be.equal(true);
    });

    it('should return false if the session status is not finalized', async () => {
      // when
      const isFinalized = await sessionRepository.isFinalized(notFinalizedSessionId);

      // then
      expect(isFinalized).to.be.equal(false);
    });
  });

  describe('#get', () => {
    let session;
    let expectedSessionValues;

    beforeEach(async () => {
      // given
      session = databaseBuilder.factory.buildSession({
        certificationCenter: 'Tour Gamma',
        address: 'rue de Bercy',
        room: 'Salle A',
        examiner: 'Monsieur Examinateur',
        date: '2018-02-23',
        time: '12:00:00',
        description: 'CertificationPix pour les jeunes',
        accessCode: 'NJR10'
      });
      expectedSessionValues = {
        'id': session.id,
        'certificationCenter': session.certificationCenter,
        'address': session.address,
        'room': session.room,
        'examiner': session.examiner,
        'date': session.date,
        'time': session.time,
        'description': session.description,
        'accessCode': session.accessCode,
      };
      await databaseBuilder.commit();
    });

    it('should return session informations in a session Object', async () => {
      // when
      const actualSession = await sessionRepository.get(session.id);

      // then
      expect(actualSession).to.be.instanceOf(Session);
      expect(actualSession, 'date').to.deep.includes(expectedSessionValues);
    });

    it('should return a Not found error when no session was found', async () => {
      // when
      const error = await catchErr(sessionRepository.get)(2);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#getWithCertificationCandidates', () => {
    let session;
    let expectedSessionValues;

    beforeEach(async () => {
      // given
      session = databaseBuilder.factory.buildSession({
        certificationCenter: 'Tour Gamma',
        address: 'rue de Bercy',
        room: 'Salle A',
        examiner: 'Monsieur Examinateur',
        date: '2018-02-23',
        time: '12:00:00',
        description: 'CertificationPix pour les jeunes',
        accessCode: 'NJR10'
      });
      expectedSessionValues = {
        'id': session.id,
        'certificationCenter': session.certificationCenter,
        'address': session.address,
        'room': session.room,
        'examiner': session.examiner,
        'date': session.date,
        'time': session.time,
        'description': session.description,
        'accessCode': session.accessCode,
      };
      databaseBuilder.factory.buildCertificationCandidate({ lastName: 'Jackson', firstName: 'Michael', sessionId: session.id });
      databaseBuilder.factory.buildCertificationCandidate({ lastName: 'Stardust', firstName: 'Ziggy', sessionId: session.id });
      databaseBuilder.factory.buildCertificationCandidate({ lastName: 'Jackson', firstName: 'Janet', sessionId: session.id });
      _.times(5, () => databaseBuilder.factory.buildCertificationCandidate());
      await databaseBuilder.commit();
    });

    it('should return session informations in a session Object', async () => {
      // when
      const actualSession = await sessionRepository.getWithCertificationCandidates(session.id);

      // then
      expect(actualSession).to.be.instanceOf(Session);
      expect(actualSession, 'date').to.deep.includes(expectedSessionValues);
    });

    it('should return associated certifications candidates ordered by lastname and firstname', async () => {
      // when
      const actualSession = await sessionRepository.getWithCertificationCandidates(session.id);

      // then
      const actualCandidates = _.map(actualSession.certificationCandidates, (item) => _.pick(item, ['sessionId', 'lastName', 'firstName']));
      expect(actualCandidates).to.have.deep.ordered.members([
        { sessionId: session.id, lastName: 'Jackson', firstName: 'Janet' },
        { sessionId: session.id, lastName: 'Jackson', firstName: 'Michael' },
        { sessionId: session.id, lastName: 'Stardust', firstName: 'Ziggy' },
      ]);
    });

    it('should return a Not found error when no session was found', async () => {
      // when
      const error = await catchErr(sessionRepository.get)(session.id + 1);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#updateSessionInfo', () => {
    let session;

    beforeEach(() => {
      const savedSession = databaseBuilder.factory.buildSession();
      session = domainBuilder.buildSession(savedSession);
      session.room = 'New room';
      session.examiner = 'New examiner';
      session.address = 'New address';
      session.accessCode = 'BABAAURHUM';
      session.date = '2010-01-01';
      session.time = '12:00:00';
      session.description = 'New description';

      return databaseBuilder.commit();
    });

    it('should return a Session domain object', async () => {
      // when
      const sessionSaved = await sessionRepository.updateSessionInfo(session);

      // then
      expect(sessionSaved).to.be.an.instanceof(Session);
    });

    it('should update model in database', async () => {
      // given

      // when
      const sessionSaved = await sessionRepository.updateSessionInfo(session);

      // then
      expect(sessionSaved.id).to.equal(session.id);
      expect(sessionSaved.room).to.equal(session.room);
      expect(sessionSaved.examiner).to.equal(session.examiner);
      expect(sessionSaved.address).to.equal(session.address);
      expect(sessionSaved.accessCode).to.equal(session.accessCode);
      expect(sessionSaved.date).to.equal(session.date);
      expect(sessionSaved.time).to.equal(session.time);
      expect(sessionSaved.description).to.equal(session.description);
    });
  });

  describe('#findByCertificationCenterId', () => {

    context('when there are some sessions', function() {
      let certificationCenterId;

      beforeEach(() => {
        const certificationCenter1 = databaseBuilder.factory.buildCertificationCenter();
        certificationCenterId = certificationCenter1.id;
        const certificationCenter2 = databaseBuilder.factory.buildCertificationCenter();
        databaseBuilder.factory.buildSession({
          id: 1,
          date: '2017-12-08',
          time: '14:00',
          certificationCenterId
        });
        databaseBuilder.factory.buildSession({
          id: 2,
          date: '2017-12-08',
          time: '16:00',
          certificationCenterId
        });
        databaseBuilder.factory.buildSession({
          id: 3,
          date: '2017-12-09',
          time: '09:00',
          certificationCenterId
        });
        databaseBuilder.factory.buildSession({
          id: 4,
          date: '2017-12-07',
          time: '10:00',
          certificationCenterId
        });
        databaseBuilder.factory.buildSession({
          id: 5,
          date: '2017-12-07',
          certificationCenterId: undefined
        });
        databaseBuilder.factory.buildSession({
          id: 6,
          date: '2017-12-07',
          certificationCenterId: certificationCenter2.id
        });

        return databaseBuilder.commit();
      });

      it('should return all sessions of the certification Center ordered by date', async () => {
        // when
        const foundSessions = await sessionRepository.findByCertificationCenterId(certificationCenterId);

        // then
        expect(foundSessions).to.be.an('array');
        expect(foundSessions).to.have.lengthOf(4);
        expect(foundSessions.map((session) => session.id)).to.deep.equal([3, 2, 1, 4]);
      });
    });

    context('when there is no session', function() {

      it('should return an empty array', async () => {
        // when
        const foundSessions = await sessionRepository.findByCertificationCenterId(1);

        // then
        expect(foundSessions).to.be.an('array');
        expect(foundSessions).to.have.lengthOf(0);
      });

    });

  });

  describe('#doesUserHaveCertificationCenterMembershipForSession', () => {
    let userId, userIdNotAllowed, sessionId, certificationCenterId, certificationCenterNotAllowedId;

    beforeEach(async () => {
      // given
      userId = 1;
      userIdNotAllowed = 2;
      databaseBuilder.factory.buildUser({ id: userId });
      databaseBuilder.factory.buildUser({ id: userIdNotAllowed });
      certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      certificationCenterNotAllowedId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      databaseBuilder.factory.buildCertificationCenterMembership({ userId: userIdNotAllowed, certificationCenterId: certificationCenterNotAllowedId });

      // when
      sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;

      await databaseBuilder.commit();
    });

    it('should return true if user has membership in the certification center that originated the session', async () => {
      // when
      const hasMembership = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession(userId, sessionId);

      // then
      expect(hasMembership).to.be.true;
    });

    it('should return false if user has no membership in the certification center that originated the session', async () => {
      // when
      const hasMembership = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession(userIdNotAllowed, sessionId);

      // then
      expect(hasMembership).to.be.false;
    });

  });

  describe('#finalize', () => {
    let id;
    const examinerGlobalComment = '';
    const finalizedAt = new Date('2017-09-01T12:14:33Z');

    beforeEach(() => {
      id = databaseBuilder.factory.buildSession({ finalizedAt: null }).id;

      return databaseBuilder.commit();
    });

    it('should return an updated Session domain object', async () => {
      // when
      const sessionSaved = await sessionRepository.finalize({ id, examinerGlobalComment, finalizedAt });

      // then
      expect(sessionSaved).to.be.an.instanceof(Session);
      expect(sessionSaved.id).to.deep.equal(id);
      expect(sessionSaved.examinerGlobalComment).to.deep.equal(examinerGlobalComment);
      expect(sessionSaved.status).to.deep.equal(statuses.FINALIZED);
    });
  });

  describe('#flagResultsAsSentToPrescriber', () => {
    let id;
    const resultsSentToPrescriberAt = new Date('2017-09-01T12:14:33Z');

    beforeEach(() => {
      id = databaseBuilder.factory.buildSession({ resultsSentToPrescriberAt: null }).id;

      return databaseBuilder.commit();
    });

    it('should return a flagged Session domain object', async () => {
      // when
      const sessionFlagged = await sessionRepository.flagResultsAsSentToPrescriber({ id, resultsSentToPrescriberAt });

      // then
      expect(sessionFlagged).to.be.an.instanceof(Session);
      expect(sessionFlagged.id).to.deep.equal(id);
      expect(sessionFlagged.resultsSentToPrescriberAt).to.deep.equal(resultsSentToPrescriberAt);
    });
  });

  describe('#updatePublishedAt', () => {
    let id;
    const publishedAt = new Date('2017-09-01T12:14:33Z');

    beforeEach(() => {
      id = databaseBuilder.factory.buildSession({ publishedAt: null }).id;

      return databaseBuilder.commit();
    });

    it('should return a updated Session domain object', async () => {
      // when
      const sessionFlagged = await sessionRepository.updatePublishedAt({ id, publishedAt });

      // then
      expect(sessionFlagged).to.be.an.instanceof(Session);
      expect(sessionFlagged.id).to.deep.equal(id);
      expect(sessionFlagged.publishedAt).to.deep.equal(publishedAt);
    });
  });

  describe('#findPaginatedFiltered', () => {

    context('when there are Sessions in the database', () => {

      beforeEach(() => {
        _.times(3, databaseBuilder.factory.buildSession);

        return databaseBuilder.commit();
      });

      it('should return an Array of Sessions', async () => {
        // given
        const filters = {};
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };

        // when
        const { sessions: matchingSessions, pagination } = await sessionRepository.findPaginatedFiltered({ filters, page });

        // then
        expect(matchingSessions).to.exist;
        expect(matchingSessions).to.have.lengthOf(3);
        expect(matchingSessions[0]).to.be.an.instanceOf(Session);
        expect(pagination).to.deep.equal(expectedPagination);
      });

    });

    context('when there are lots of Sessions (> 10) in the database', () => {

      beforeEach(() => {
        _.times(12, databaseBuilder.factory.buildSession);
        return databaseBuilder.commit();
      });

      it('should return paginated matching Sessions', async () => {
        // given
        const filters = {};
        const page = { number: 1, size: 3 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 4, rowCount: 12 };

        // when
        const { sessions: matchingSessions, pagination } = await sessionRepository.findPaginatedFiltered({ filters, page });

        // then
        expect(matchingSessions).to.have.lengthOf(3);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('filters', () => {

      context('when there are ignored filters', () => {

        beforeEach(() => {
          databaseBuilder.factory.buildSession();
          databaseBuilder.factory.buildSession();

          return databaseBuilder.commit();
        });

        it('should ignore the filters and retrieve all certificationCenters', async () => {
          // given
          const filters = { foo: 1 };
          const page = { number: 1, size: 10 };
          const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

          // when
          const { sessions, pagination } = await sessionRepository.findPaginatedFiltered({ filters, page });

          // then
          expect(pagination).to.deep.equal(expectedPagination);
          expect(sessions).to.have.length(2);
        });
      });

      context('when there is a filter on the ID', () => {
        let expectedSession;

        beforeEach(() => {
          expectedSession = databaseBuilder.factory.buildSession({ id: 121 });
          databaseBuilder.factory.buildSession({ id: 333 });

          return databaseBuilder.commit();
        });

        it('should apply the filter and return the appropriate results', async () => {
          // given
          const filters = { id: 2 };
          const page = { number: 1, size: 10 };
          const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 1 };

          // when
          const { sessions, pagination } = await sessionRepository.findPaginatedFiltered({ filters, page });

          // then
          expect(pagination).to.deep.equal(expectedPagination);
          expect(sessions[0].id).to.equal(expectedSession.id);
        });
      });
    });
  });

  describe('#assignUser', () => {
    let id;
    let assignedUserId;

    beforeEach(() => {
      id = databaseBuilder.factory.buildSession({ assignedUserId: null }).id;
      assignedUserId = databaseBuilder.factory.buildUser().id;

      return databaseBuilder.commit();
    });

    it('should return an updated Session domain object', async () => {
      // when
      const updatedSession = await sessionRepository.assignUser({ id, assignedUserId });

      // then
      expect(updatedSession).to.be.an.instanceof(Session);
      expect(updatedSession.id).to.deep.equal(id);
      expect(updatedSession.assignedUserId).to.deep.equal(assignedUserId);
      expect(updatedSession.status).to.deep.equal(statuses.ONGOING);
    });
  });
});
