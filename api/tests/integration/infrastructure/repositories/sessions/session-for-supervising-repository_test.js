import { databaseBuilder, expect, catchErr } from '../../../../test-helper.js';
import _ from 'lodash';
import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { SessionForSupervising } from '../../../../../lib/domain/read-models/SessionForSupervising.js';
import * as sessionForSupervisingRepository from '../../../../../lib/infrastructure/repositories/sessions/session-for-supervising-repository.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { CertificationVersion } from '../../../../../src/shared/domain/models/CertificationVersion.js';
import { CertificationChallengeLiveAlertStatus } from '../../../../../src/certification/session/domain/models/CertificationChallengeLiveAlert.js';

describe('Integration | Repository | SessionForSupervising', function () {
  describe('#get', function () {
    describe('when certification session is v2', function () {
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
          }),
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

        databaseBuilder.factory.buildUser({ id: 11111 });
        databaseBuilder.factory.buildCertificationCandidate({
          userId: 11111,
          lastName: 'Jackson',
          firstName: 'Michael',
          sessionId: session.id,
          authorizedToStart: true,
        });
        databaseBuilder.factory.buildUser({ id: 22222 });
        databaseBuilder.factory.buildCertificationCandidate({
          userId: 22222,
          lastName: 'Stardust',
          firstName: 'Ziggy',
          sessionId: session.id,
        });
        databaseBuilder.factory.buildUser({ id: 33333 });
        databaseBuilder.factory.buildCertificationCandidate({
          userId: 33333,
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
          _.pick(item, [
            'userId',
            'sessionId',
            'lastName',
            'firstName',
            'authorizedToStart',
            'assessmentStatus',
            'startDateTime',
          ]),
        );
        expect(actualCandidates).to.have.deep.ordered.members([
          {
            userId: 33333,
            lastName: 'Jackson',
            firstName: 'Janet',
            authorizedToStart: false,
            assessmentStatus: null,
            startDateTime: null,
          },
          {
            userId: 11111,
            lastName: 'Jackson',
            firstName: 'Michael',
            authorizedToStart: true,
            assessmentStatus: null,
            startDateTime: null,
          },
          {
            userId: 12345,
            lastName: 'Joplin',
            firstName: 'Janis',
            authorizedToStart: true,
            assessmentStatus: Assessment.states.STARTED,
            startDateTime: '2022-10-19T13:37:00+00:00',
          },
          {
            userId: 22222,
            lastName: 'Stardust',
            firstName: 'Ziggy',
            authorizedToStart: false,
            assessmentStatus: null,
            startDateTime: null,
          },
        ]);
      });

      it('should return certifications candidates with subscribed complementary certifications', async function () {
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

        databaseBuilder.factory.buildUser({ id: 11111 });
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
          userId: 11111,
          lastName: 'Jackson',
          firstName: 'Janet',
          sessionId: session.id,
        });

        databaseBuilder.factory.buildUser({ id: 22222 });
        databaseBuilder.factory.buildCertificationCandidate({
          userId: 22222,
          lastName: 'Joplin',
          firstName: 'Janis',
          sessionId: session.id,
        });

        const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+ Édu 1er degré',
          key: 'EDU_1ER_DEGRE',
          certificationExtraTime: 45,
        });

        databaseBuilder.factory.buildComplementaryCertificationSubscription({
          certificationCandidateId: certificationCandidate.id,
          complementaryCertificationId: complementaryCertification.id,
        });

        await databaseBuilder.commit();

        // when
        const actualSession = await sessionForSupervisingRepository.get(session.id);

        // then
        const actualCandidates = _.map(actualSession.certificationCandidates, (item) =>
          _.pick(item, ['userId', 'sessionId', 'lastName', 'firstName', 'enrolledComplementaryCertification']),
        );

        expect(actualCandidates).to.have.deep.ordered.members([
          {
            userId: 11111,
            lastName: 'Jackson',
            firstName: 'Janet',
            enrolledComplementaryCertification: {
              key: complementaryCertification.key,
              label: complementaryCertification.label,
              certificationExtraTime: complementaryCertification.certificationExtraTime,
            },
          },
          {
            userId: 22222,
            lastName: 'Joplin',
            firstName: 'Janis',
            enrolledComplementaryCertification: null,
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
    describe('when certification session is v3', function () {
      it('should return session informations in a SessionForSupervising Object', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({ name: 'Toto', id: 1234 });
        const session = databaseBuilder.factory.buildSession({
          version: CertificationVersion.V3,
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
          }),
        );
      });

      it('should return associated certifications candidates ordered by live alert status, lastname and firstname', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({ name: 'Toto', id: 1234 });
        const session = databaseBuilder.factory.buildSession({
          version: CertificationVersion.V3,
          certificationCenter: 'Tour Gamma',
          room: 'Salle A',
          examiner: 'Monsieur Examinateur',
          date: '2018-02-23',
          time: '12:00:00',
          certificationCenterId: 1234,
        });

        databaseBuilder.factory.buildUser({ id: 11111 });
        databaseBuilder.factory.buildCertificationCandidate({
          userId: 11111,
          lastName: 'Jackson',
          firstName: 'Michael',
          sessionId: session.id,
          authorizedToStart: true,
        });
        databaseBuilder.factory.buildUser({ id: 22222 });
        databaseBuilder.factory.buildCertificationCandidate({
          userId: 22222,
          lastName: 'Stardust',
          firstName: 'Ziggy',
          sessionId: session.id,
        });
        databaseBuilder.factory.buildUser({ id: 33333 });
        databaseBuilder.factory.buildCertificationCandidate({
          userId: 33333,
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
          version: CertificationVersion.V3,
          userId: 12345,
          sessionId: session.id,
          createdAt: new Date('2022-10-19T13:37:00Z'),
        });

        const assessmentWithLiveAlert = databaseBuilder.factory.buildAssessment({
          certificationCourseId: certificationCourse.id,
          state: Assessment.states.STARTED,
        });

        databaseBuilder.factory.buildCertificationChallengeLiveAlert({
          assessmentId: assessmentWithLiveAlert.id,
        });

        databaseBuilder.factory.buildCertificationCandidate();
        await databaseBuilder.commit();

        // when
        const actualSession = await sessionForSupervisingRepository.get(session.id);

        // then
        const actualCandidates = _.map(actualSession.certificationCandidates, (item) =>
          _.pick(item, [
            'userId',
            'sessionId',
            'lastName',
            'firstName',
            'authorizedToStart',
            'assessmentStatus',
            'startDateTime',
            'liveAlertStatus',
          ]),
        );
        expect(actualCandidates).to.have.deep.ordered.members([
          {
            userId: 12345,
            lastName: 'Joplin',
            firstName: 'Janis',
            authorizedToStart: true,
            assessmentStatus: Assessment.states.STARTED,
            startDateTime: '2022-10-19T13:37:00+00:00',
            liveAlertStatus: CertificationChallengeLiveAlertStatus.ONGOING,
          },
          {
            userId: 33333,
            lastName: 'Jackson',
            firstName: 'Janet',
            authorizedToStart: false,
            assessmentStatus: null,
            startDateTime: null,
            liveAlertStatus: null,
          },
          {
            userId: 11111,
            lastName: 'Jackson',
            firstName: 'Michael',
            authorizedToStart: true,
            assessmentStatus: null,
            startDateTime: null,
            liveAlertStatus: null,
          },
          {
            userId: 22222,
            lastName: 'Stardust',
            firstName: 'Ziggy',
            authorizedToStart: false,
            assessmentStatus: null,
            startDateTime: null,
            liveAlertStatus: null,
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
});
