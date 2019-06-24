const { databaseBuilder, expect, knex, domainBuilder } = require('../../../test-helper');

const { NotFoundError } = require('../../../../lib/domain/errors');
const Session = require('../../../../lib/domain/models/Session');

const BookshelfSession = require('../../../../lib/infrastructure/data/campaign');
const sessionRepository = require('../../../../lib/infrastructure/repositories/session-repository');

describe('Integration | Repository | Session', function() {

  beforeEach(async () => {
    await databaseBuilder.clean();
  });

  afterEach(async () => {
    await databaseBuilder.clean();
  });

  describe('#save', () => {
    let session;

    beforeEach(() => {
      session = new Session({
        certificationCenter: 'Université de dressage de loutres',
        certificationCenterId: 42,
        address: 'Nice',
        room: '28D',
        examiner: 'Michel Essentiel',
        date: '2017-12-08',
        time: '14:30',
        description: 'Première certification EVER !!!'
      });
    });

    it('should persist the session in db', () => {
      // when
      const promise = sessionRepository.save(session);

      // then
      return promise.then(() => knex('sessions').select())
        .then((sessionSaved) => {
          expect(sessionSaved).to.have.lengthOf(1);
        });
    });

    it('should return the saved Session', () => {
      // when
      const promise = sessionRepository.save(session);

      // then
      return promise.then((savedSession) => {
        expect(savedSession).to.be.an.instanceOf(Session);

        expect(savedSession).to.have.property('id').and.not.null;
        expect(savedSession.certificationCenter).to.equal('Université de dressage de loutres');
      });
    });
    afterEach(async () => {
      await knex('sessions').delete();
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

    it('should return true if the accessCode is not in database', () => {
      // given
      const accessCode = 'DEF123';

      // when
      const promise = sessionRepository.isSessionCodeAvailable(accessCode);

      // then
      return promise.then((result) => {
        expect(result).to.be.equal(true);
      });
    });

    it('should return false if the accessCode is in database', () => {
      // given
      const accessCode = 'ABC123';

      // when
      const promise = sessionRepository.isSessionCodeAvailable(accessCode);

      // then
      return promise.then((result) => {
        expect(result).to.be.equal(false);
      });

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

    it('should return the object by accessCode', () => {
      // given
      const accessCode = 'ABC123';

      // when
      const promise = sessionRepository.getByAccessCode(accessCode);

      // then
      return promise.then((result) => {
        expect(result.description).to.be.equal(session.description);
        expect(result.accessCode).to.be.equal(session.accessCode);
      });
    });

    it('should return null when the accessCode do not correspond to a session', () => {
      // given
      const accessCode = 'DEE123';

      // when
      const promise = sessionRepository.getByAccessCode(accessCode);

      // then
      return promise.then((result) => {
        expect(result).to.be.equal(null);
      });

    });
  });

  describe('#getWithCertificationCourses', () => {

    beforeEach(() => {
      databaseBuilder.factory.buildSession({
        id: 1,
      });

      databaseBuilder.factory.buildCertificationCourse({
        id: 1,
        userId: 1,
        sessionId: 1
      });
      databaseBuilder.factory.buildCertificationCourse({
        id: 2,
        userId: 2,
        sessionId: 1
      });
      databaseBuilder.factory.buildCertificationCourse({
        id: 3,
        userId: 3,
        sessionId: 2
      });
      return databaseBuilder.commit();
    });

    it('should return associated certifications', function() {
      // when
      const promise = sessionRepository.getWithCertificationCourses(1);

      // then
      return promise.then((session) => {
        expect(session.certifications).to.be.instanceOf(Array);
        expect(session.certifications.length).to.be.equal(2);
        expect(session.certifications[0].attributes.id).to.be.equal(1);
        expect(session.certifications[0].attributes.userId).to.be.equal(1);
        expect(session.certifications[1].attributes.id).to.be.equal(2);
        expect(session.certifications[1].attributes.userId).to.be.equal(2);
      });
    });

    it('should return a Not found error when no session was found', function() {
      // when
      const promise = sessionRepository.getWithCertificationCourses(2);

      // then
      return expect(promise).to.be.rejectedWith(NotFoundError);
    });
  });

  describe('#get', () => {

    beforeEach(() => {
      databaseBuilder.factory.buildSession({
        id: 1,
        certificationCenter: 'Tour Gamma',
        address: 'rue de Bercy',
        room: 'Salle A',
        examiner: 'Monsieur Examinateur',
        date: '2018-02-23',
        time: '12:00',
        description: 'CertificationPix pour les jeunes',
        accessCode: 'NJR10'
      });
      return databaseBuilder.commit();
    });

    it('should return session informations in a session Object', function() {
      // given

      // when
      const promise = sessionRepository.get(1);

      // then
      return promise.then((session) => {
        expect(session).to.be.instanceOf(Session);
        expect(session.id).to.be.equal(1);
        expect(session.certificationCenter).to.be.equal('Tour Gamma');
        expect(session.address).to.be.equal('rue de Bercy');
        expect(session.room).to.be.equal('Salle A');
        expect(session.examiner).to.be.equal('Monsieur Examinateur');
        expect(session.date).to.be.equal('2018-02-23');
        expect(session.time).to.be.equal('12:00');
        expect(session.description).to.be.equal('CertificationPix pour les jeunes');
        expect(session.accessCode).to.be.equal('NJR10');
      });
    });

    it('should return a Not found error when no session was found', function() {
      // when
      const promise = sessionRepository.get(2);

      // then
      return expect(promise).to.be.rejectedWith(NotFoundError);
    });
  });

  describe('#update', () => {
    let session;

    beforeEach(() => {
      const bookshelfSession = databaseBuilder.factory.buildSession({
        id: 1,
        room: '28D',
        examiner: 'Roger'
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

      // when
      const sessionSaved = await sessionRepository.update(session);

      // then
      expect(sessionSaved.id).to.equal(session.id);
      expect(sessionSaved.room).to.equal('New room');
      expect(sessionSaved.examiner).to.equal('New examiner');
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

      it('should return all sessions', function() {
        // when
        const promise = sessionRepository.find();

        // then
        return promise.then((result) => {
          expect(result).to.be.an('array');
          expect(result).to.have.lengthOf(2);
        });
      });

      it('should sort sessions with more recent created ones at first', function() {
        // when
        const promise = sessionRepository.find();

        // then
        return promise.then((result) => {
          expect(result[0].id).to.equal(2);
          expect(result[1].id).to.equal(1);
        });
      });
    });

    context('when there is no session', function() {

      it('should return an empty array', function() {
        // when
        const promise = sessionRepository.find();

        // then
        return promise.then((result) => {
          expect(result).to.be.an('array');
          expect(result).to.have.lengthOf(0);
        });
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

      it('should return all sessions of the certification Center ordered by date', function() {
        // when
        const promise = sessionRepository.findByCertificationCenterId(certificationCenterId);

        // then
        return promise.then((result) => {
          expect(result).to.be.an('array');
          expect(result).to.have.lengthOf(4);
          expect(result.map((session) => session.id)).to.deep.equal([3, 2, 1, 4]);
        });
      });
    });

    context('when there is no session', function() {

      it('should return an empty array', function() {
        // when
        const promise = sessionRepository.findByCertificationCenterId(1);

        // then
        return promise.then((result) => {
          expect(result).to.be.an('array');
          expect(result).to.have.lengthOf(0);
        });
      });
    });
  });

  describe('ensureUserHasAccessToSession', () => {
    let requestErr, userId, userIdNotAllowed, sessionId, certificationCenterId, certificationCenterNotAllowedId;
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
    it('should not throw an error if the user has access to the session', async () => {
      try {
        await sessionRepository.ensureUserHasAccessToSession(userId, sessionId);
      } catch (err) {
        requestErr = err;
      }
      expect(requestErr).to.be.undefined;
    });
    it('should throw an error if the user does not have access to the session', async () => {
      try {
        await sessionRepository.ensureUserHasAccessToSession(userIdNotAllowed, sessionId);
      } catch (err) {
        requestErr = err;
      }
      expect(requestErr).to.be.instanceOf(Error);
    });
  });

});
