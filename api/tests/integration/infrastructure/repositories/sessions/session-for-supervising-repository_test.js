import { databaseBuilder, expect, catchErr } from '../../../../test-helper';
import _ from 'lodash';
import { NotFoundError } from '../../../../../lib/domain/errors';
import SessionForSupervising from '../../../../../lib/domain/read-models/SessionForSupervising';
import sessionForSupervisingRepository from '../../../../../lib/infrastructure/repositories/sessions/session-for-supervising-repository';
import Assessment from '../../../../../lib/domain/models/Assessment';

describe('Integration | Repository | SessionForSupervising', function () {
  describe('#get', function () {
    it('should return session informations in a SessionForSupervising Object', async function () {
      // given
      databaseBuilder.factory.buildCertificationCenter({ name: 'Toto', id: 1234 });
      const session = databaseBuilder.factory.buildSession({
        certificationCenter: 'Tour Gamma',
        room: 'Salle A',
        examiner: 'Monsieur Examinateur',
        accessCode: 'CODE12',
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
          accessCode: 'CODE12',
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
      databaseBuilder.factory.buildUser({ id: 12345 });
      databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Joplin',
        firstName: 'Janis',
        sessionId: session.id,
        userId: 12345,
        authorizedToStart: true,
      });

      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        userId: 12345,
        sessionId: session.id,
        createdAt: new Date('2022-10-19T13:37:00Z'),
      });

      databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourse.id,
        state: Assessment.states.STARTED,
      });
      databaseBuilder.factory.buildCertificationCandidate();
      await databaseBuilder.commit();

      // when
      const actualSession = await sessionForSupervisingRepository.get(session.id);

      // then
      const actualCandidates = _.map(actualSession.certificationCandidates, (item) =>
        _.pick(item, ['sessionId', 'lastName', 'firstName', 'authorizedToStart', 'assessmentStatus', 'startDateTime'])
      );
      expect(actualCandidates).to.have.deep.ordered.members([
        {
          lastName: 'Jackson',
          firstName: 'Janet',
          authorizedToStart: false,
          assessmentStatus: null,
          startDateTime: null,
        },
        {
          lastName: 'Jackson',
          firstName: 'Michael',
          authorizedToStart: true,
          assessmentStatus: null,
          startDateTime: null,
        },
        {
          lastName: 'Joplin',
          firstName: 'Janis',
          authorizedToStart: true,
          assessmentStatus: Assessment.states.STARTED,
          startDateTime: '2022-10-19T13:37:00+00:00',
        },
        {
          lastName: 'Stardust',
          firstName: 'Ziggy',
          authorizedToStart: false,
          assessmentStatus: null,
          startDateTime: null,
        },
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
