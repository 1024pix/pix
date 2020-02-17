const { databaseBuilder, expect, knex, domainBuilder, catchErr } = require('../../../test-helper');
const _ = require('lodash');
const { NotFoundError } = require('../../../../lib/domain/errors');
const Session = require('../../../../lib/domain/models/Session');
const { statuses } = require('../../../../lib/domain/models/Session');
const BookshelfSession = require('../../../../lib/infrastructure/data/campaign');
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
      finalizedSessionId = databaseBuilder.factory.buildSession({ status: statuses.FINALIZED }).id;
      notFinalizedSessionId = databaseBuilder.factory.buildSession({ status: statuses.CREATED }).id;

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

  describe('#getByAccessCode', () => {
    let session;

    beforeEach(() => {
      session = {
        certificationCenter: 'Paris',
        address: 'Paris',
        room: 'The lost room',
        examiner: 'Bernard',
        date: '2018-02-23',
        time: '12:00',
        description: 'The lost examen',
        accessCode: 'ABC123'
      };
      databaseBuilder.factory.buildSession(session);

      return databaseBuilder.commit();
    });

    it('should return the object by accessCode', async () => {
      // given
      const accessCode = 'ABC123';

      // when
      const actualSession = await sessionRepository.getByAccessCode(accessCode);

      // then
      expect(actualSession.description).to.be.equal(session.description);
      expect(actualSession.accessCode).to.be.equal(session.accessCode);
    });

    it('should return a Not found error when no session was found', async () => {
      // given
      const accessCode = 'DEE123';

      // when
      const error = await catchErr(sessionRepository.getByAccessCode)(accessCode);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
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

  describe('#update', () => {
    let session;

    beforeEach(() => {
      const bookshelfSession = databaseBuilder.factory.buildSession({
        id: 1,
        room: '28D',
        examiner: 'Roger',
        status: statuses.CREATED,
      });
      session = domainBuilder.buildSession(bookshelfSession);

      return databaseBuilder.commit();
    });

    it('should return a Session domain object', async () => {
      // when
      const sessionSaved = await sessionRepository.update(session);

      // then
      expect(sessionSaved).to.be.an.instanceof(Session);
    });

    it('should update model in database', async () => {
      // given
      session.room = 'New room';
      session.examiner = 'New examiner';
      session.examinerGlobalComment = 'It was a fine session my dear';
      session.status = statuses.FINALIZED;

      // when
      const sessionSaved = await sessionRepository.update(session);

      // then
      expect(sessionSaved.id).to.equal(session.id);
      expect(sessionSaved.room).to.equal('New room');
      expect(sessionSaved.examiner).to.equal('New examiner');
      expect(sessionSaved.examinerGlobalComment).to.equal('It was a fine session my dear');
      expect(sessionSaved.status).to.equal(statuses.FINALIZED);
    });

    it('should not add row in table "sessions"', async () => {
      // given
      const rowCount = await BookshelfSession.count();

      // when
      await sessionRepository.update(session);

      // then
      const rowCountAfterUpdate = await BookshelfSession.count();
      expect(rowCountAfterUpdate).to.equal(rowCount);
    });
  });

  describe('#find', () => {

    context('when there are some sessions', function() {

      beforeEach(() => {
        databaseBuilder.factory.buildSession({
          id: 1,
          createdAt: new Date('2017-12-08T05:06:00Z')
        });
        databaseBuilder.factory.buildSession({
          id: 2,
          createdAt: new Date('2017-12-09T07:08:09Z')
        });

        return databaseBuilder.commit();
      });

      it('should return all sessions', async () => {
        // when
        const foundSessions = await sessionRepository.find();

        // then
        expect(foundSessions).to.be.an('array');
        expect(foundSessions).to.have.lengthOf(2);
      });

      it('should sort sessions with more recent created ones at first', async () => {
        // when
        const foundSessions = await sessionRepository.find();

        // then
        expect(foundSessions[0].id).to.equal(2);
        expect(foundSessions[1].id).to.equal(1);
      });

    });

    context('when there is no session', function() {

      it('should return an empty array', async () => {
        // when
        const foundSessions = await sessionRepository.find();

        // then
        expect(foundSessions).to.be.an('array');
        expect(foundSessions).to.have.lengthOf(0);
      });

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
    let status = statuses.CREATED;
    let examinerGlobalComment = '';
    const finalizedAt = new Date('2017-09-01T12:14:33Z');

    beforeEach(() => {
      id = databaseBuilder.factory.buildSession({ status: statuses.CREATED }).id;

      return databaseBuilder.commit();
    });

    it('should return a Session domain object', async () => {
      // when
      const sessionSaved = await sessionRepository.finalize({ id, status, examinerGlobalComment, finalizedAt });

      // then
      expect(sessionSaved).to.be.an.instanceof(Session);
      expect(sessionSaved.id).to.deep.equal(id);
      expect(sessionSaved.examinerGlobalComment).to.deep.equal(examinerGlobalComment);
      expect(sessionSaved.status).to.deep.equal(status);
    });

    it('should update model in database', async () => {
      // given
      examinerGlobalComment = 'It was a fine session my dear';
      status = statuses.FINALIZED;

      // when
      await sessionRepository.finalize({ id, status, examinerGlobalComment, finalizedAt });

      // then
      const sessions = await knex('sessions').where({ id });
      expect(sessions[0].status).to.equal(status);
      expect(sessions[0].examinerGlobalComment).to.equal(examinerGlobalComment);
      expect(sessions[0].finalizedAt).to.deep.equal(finalizedAt);
    });
  });
});
