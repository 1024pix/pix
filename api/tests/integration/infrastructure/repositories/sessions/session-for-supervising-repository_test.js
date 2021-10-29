const { databaseBuilder, expect, catchErr } = require('../../../../test-helper');
const _ = require('lodash');
const { NotFoundError } = require('../../../../../lib/domain/errors');
const SessionForSupervising = require('../../../../../lib/domain/read-models/SessionForSupervising');
const sessionForSupervisingRepository = require('../../../../../lib/infrastructure/repositories/sessions/session-for-supervising-repository');

describe('Integration | Repository | SessionForSupervising', function () {
  describe('#get', function () {
    it('should return session informations in a SessionForSupervising Object', async function () {
      // given
      databaseBuilder.factory.buildCertificationCenter({ name: 'Toto', id: 1234 });
      const session = databaseBuilder.factory.buildSession({
        certificationCenter: 'Tour Gamma',
        room: 'Salle A',
        examiner: 'Monsieur Examinateur',
        date: '2018-02-23',
        time: '12:00:00',
        certificationCenterId: 1234,
      });

      await databaseBuilder.commit();

      // when
      const actualSession = await sessionForSupervisingRepository.get(session.id);

      // then
      expect(actualSession).to.be.deepEqualInstance(
        new SessionForSupervising({
          id: session.id,
          certificationCenterName: 'Toto',
          room: 'Salle A',
          examiner: 'Monsieur Examinateur',
          date: '2018-02-23',
          time: '12:00:00',
          certificationCandidates: [],
        })
      );
    });

    it('should return associated certifications candidates ordered by lastname and firstname', async function () {
      // given
      databaseBuilder.factory.buildCertificationCenter({ name: 'Toto', id: 1234 });
      const session = databaseBuilder.factory.buildSession({
        certificationCenter: 'Tour Gamma',
        room: 'Salle A',
        examiner: 'Monsieur Examinateur',
        date: '2018-02-23',
        time: '12:00:00',
        certificationCenterId: 1234,
      });

      databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Jackson',
        firstName: 'Michael',
        sessionId: session.id,
        authorizedToStart: true,
      });
      databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Stardust',
        firstName: 'Ziggy',
        sessionId: session.id,
      });
      databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Jackson',
        firstName: 'Janet',
        sessionId: session.id,
      });
      databaseBuilder.factory.buildCertificationCandidate();
      await databaseBuilder.commit();

      // when
      const actualSession = await sessionForSupervisingRepository.get(session.id);

      // then
      const actualCandidates = _.map(actualSession.certificationCandidates, (item) =>
        _.pick(item, ['sessionId', 'lastName', 'firstName', 'authorizedToStart'])
      );
      expect(actualCandidates).to.have.deep.ordered.members([
        { lastName: 'Jackson', firstName: 'Janet', authorizedToStart: false },
        { lastName: 'Jackson', firstName: 'Michael', authorizedToStart: true },
        { lastName: 'Stardust', firstName: 'Ziggy', authorizedToStart: false },
      ]);
    });

    it('should return a Not found error when no session was found', async function () {
      // when
      const error = await catchErr(sessionForSupervisingRepository.get)(123123);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
