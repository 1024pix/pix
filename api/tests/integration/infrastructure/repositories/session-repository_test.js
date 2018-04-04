const { expect, knex } = require('../../../test-helper');

const Session = require('../../../../lib/domain/models/Session');
const sessionRepository = require('../../../../lib/infrastructure/repositories/session-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');


describe('Integration | Repository | Session', function() {

  describe('#save', () => {

    afterEach(() => knex('sessions').delete());

    it('should persist the session in db', () => {
      // given
      const sessionToBeSaved = new Session({
        certificationCenter: 'Université de dressage de loutres',
        address: 'Nice',
        room: '28D',
        examiner: 'Antoine Toutvenant',
        date: '2017-12-08',
        time: '14:30',
        description: 'Premiere certification EVER !!!'
      });

      // when
      const promise = sessionRepository.save(sessionToBeSaved);

      // then
      return promise.then(() => knex('sessions').select())
        .then((sessionSaved) => {
          expect(sessionSaved).to.have.lengthOf(1);
        });
    });

    it('should return the saved Session', () => {
      // given
      const session = new Session({
        certificationCenter: 'Université de dressage de loutres',
        address: 'Nice',
        room: '28D',
        examiner: 'Antoine Toutvenant',
        date: '2017-12-08',
        time: '14:30',
        description: 'Premiere certification EVER !!!'
      });

      // when
      const promise = sessionRepository.save(session);

      // then
      return promise.then(savedSession => {
        expect(savedSession).to.be.an.instanceOf(Session);

        expect(savedSession).to.have.property('id').and.not.null;
        expect(savedSession.certificationCenter).to.equal('Université de dressage de loutres');
      });
    });
  });

  describe('#isSessionCodeAvailable', () => {
    beforeEach(() => knex('sessions').insert({
      certificationCenter: 'Paris',
      address: 'Paris',
      room: 'The lost room',
      examiner: 'Bernard',
      date: '23/02/2018',
      time: '12:00',
      description: 'The lost examen',
      accessCode: 'ABC123'
    }));

    afterEach(() => knex('sessions').delete());

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
    const session = {
      certificationCenter: 'Paris',
      address: 'Paris',
      room: 'The lost room',
      examiner: 'Bernard',
      date: '23/02/2018',
      time: '12:00',
      description: 'The lost examen',
      accessCode: 'ABC123'
    };

    beforeEach(() => knex('sessions').insert(session));

    afterEach(() => knex('sessions').delete());

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

  describe('#get', function() {

    const certifications = [{
      id: 1,
      userId: 1,
      sessionId: 1
    }, {
      id: 2,
      userId: 2,
      sessionId: 1
    }, {
      id: 3,
      userId: 3,
      sessionId: 2
    }];

    beforeEach(() => {
      return knex('sessions').insert({
        id: 1,
        certificationCenter: 'Parc des Princes',
        address: 'Boulbi',
        room: 'Hall Pauleta',
        examiner: 'Neymar Jr',
        date: '23/02/2018',
        time: '12:00',
        description: 'La Champions League est pour nous cette fois',
        accessCode: 'NJR10'
      }).then(() => {
        return knex('certification-courses').insert(certifications);
      });
    });

    afterEach(() => {
      return knex('sessions').delete()
        .then(() => {
          return knex('certification-courses').delete();
        });
    });

    it('should return session informations in a session Object', function() {
      // given

      // when
      const promise = sessionRepository.get(1);

      // then
      return promise.then((session) => {
        expect(session).to.be.instanceOf(Session);
        expect(session.id).to.be.equal(1);
        expect(session.certificationCenter).to.be.equal('Parc des Princes');
        expect(session.address).to.be.equal('Boulbi');
        expect(session.room).to.be.equal('Hall Pauleta');
        expect(session.examiner).to.be.equal('Neymar Jr');
        expect(session.date).to.be.equal('23/02/2018');
        expect(session.time).to.be.equal('12:00');
        expect(session.description).to.be.equal('La Champions League est pour nous cette fois');
        expect(session.accessCode).to.be.equal('NJR10');
      });
    });


    it('should return associated certifications', function() {
      // when
      const promise = sessionRepository.get(1);

      // then
      return promise.then((session) => {
        expect(session.certificationCourses).to.be.instanceOf(Array);
        expect(session.certificationCourses.length).to.be.equal(2);
        expect(session.certificationCourses[0].id).to.be.equal(1);
        expect(session.certificationCourses[0].userId).to.be.equal(1);
        expect(session.certificationCourses[1].id).to.be.equal(2);
        expect(session.certificationCourses[1].userId).to.be.equal(2);
      });
    });

    it('should return a Not found error when no session was found', function() {
      // when
      const promise = sessionRepository.get(2);

      // then
      return expect(promise).to.be.rejectedWith(NotFoundError);
    });
  });
});

