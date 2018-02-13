const { expect, describe, afterEach, it, knex } = require('../../../test-helper');

const Session = require('../../../../lib/domain/models/Session');
const SessionRepository = require('../../../../lib/infrastructure/repositories/session-repository');

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
        date: '08/12/2017',
        time: '14:30',
        description: 'Premiere certification EVER !!!'
      });

      // when
      const promise = SessionRepository.save(sessionToBeSaved);

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
        date: '08/12/2017',
        time: '14:30',
        description: 'Premiere certification EVER !!!'
      });

      // when
      const promise = SessionRepository.save(session);

      // then
      return promise.then(savedSession => {
        expect(savedSession).to.be.an.instanceOf(Session);

        expect(savedSession).to.have.property('id').and.not.null;
        expect(savedSession.certificationCenter).to.equal('Université de dressage de loutres');
      });
    });
  });
});

