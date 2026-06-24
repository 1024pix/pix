import _ from 'lodash';

import { SessionForSupervising } from '../../../../../../src/certification/session-management/domain/read-models/SessionForSupervising.js';
import * as sessionForSupervisingRepository from '../../../../../../src/certification/session-management/infrastructure/repositories/session-for-supervising-repository.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { CertificationChallengeLiveAlertStatus } from '../../../../../../src/certification/shared/domain/models/CertificationChallengeLiveAlert.js';
import { CertificationCompanionLiveAlertStatus } from '../../../../../../src/certification/shared/domain/models/CertificationCompanionLiveAlert.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Repository | SessionForSupervising', function () {
  describe('#get', function () {
    it('should return session informations in a SessionForSupervising Object', async function () {
      // given
      databaseBuilder.factory.buildCertificationCenter({ name: 'Toto', id: 1234 });
      const session = databaseBuilder.factory.buildSession({
        certificationCenter: 'Tour Gamma',
        address: 'centre de certification 1',
        room: 'Salle A',
        examiner: 'Monsieur Examinateur',
        accessCode: 'CODE12',
        date: '2018-02-23',
        time: '12:00:00',
        certificationCenterId: 1234,
      });

      await databaseBuilder.commit();

      // when
      const actualSession = await sessionForSupervisingRepository.get({ id: session.id });

      // then
      expect(actualSession).to.be.deepEqualInstance(
        new SessionForSupervising({
          id: session.id,
          address: 'centre de certification 1',
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
      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Joplin',
        firstName: 'Janis',
        sessionId: session.id,
        userId: 12345,
        authorizedToStart: true,
      }).id;

      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        userId: 12345,
        sessionId: session.id,
        createdAt: new Date('2022-10-19T13:37:00Z'),
        candidateId,
      });

      databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourse.id,
        state: Assessment.states.STARTED,
      });

      databaseBuilder.factory.buildCertificationCandidate();
      await databaseBuilder.commit();

      // when
      const actualSession = await sessionForSupervisingRepository.get({ id: session.id });

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

    it('should return certifications candidates with their subscription key', async function () {
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
        firstName: 'Janet',
        sessionId: session.id,
        subscription: ComplementaryCertificationKeys.CLEA,
      });

      databaseBuilder.factory.buildUser({ id: 22222 });
      databaseBuilder.factory.buildCertificationCandidate({
        userId: 22222,
        lastName: 'Joplin',
        firstName: 'Janis',
        sessionId: session.id,
        subscription: ComplementaryCertificationKeys.PIX_PLUS_EDU_1ER_DEGRE,
      });

      await databaseBuilder.commit();

      // when
      const actualSession = await sessionForSupervisingRepository.get({ id: session.id });

      // then
      const actualCandidates = _.map(actualSession.certificationCandidates, (item) =>
        _.pick(item, ['userId', 'lastName', 'firstName', 'subscription']),
      );

      expect(actualCandidates).to.have.deep.ordered.members([
        { userId: 11111, lastName: 'Jackson', firstName: 'Janet', subscription: ComplementaryCertificationKeys.CLEA },
        {
          userId: 22222,
          lastName: 'Joplin',
          firstName: 'Janis',
          subscription: ComplementaryCertificationKeys.PIX_PLUS_EDU_1ER_DEGRE,
        },
      ]);
    });

    it('should return a Not found error when no session was found', async function () {
      // when
      const error = await catchErr(sessionForSupervisingRepository.get)({ id: 123123 });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });

    context('when some candidates have live alerts', function () {
      it('should return candidates ordered by live alert types, lastname and firstname', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({ name: 'Toto', id: 1234 });
        const session = databaseBuilder.factory.buildSession({
          version: AlgorithmEngineVersion.V3,
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
        const ziggyCandidateId = databaseBuilder.factory.buildCertificationCandidate({
          userId: 22222,
          lastName: 'Stardust',
          firstName: 'Ziggy',
          sessionId: session.id,
        }).id;

        databaseBuilder.factory.buildUser({ id: 33333 });
        databaseBuilder.factory.buildCertificationCandidate({
          userId: 33333,
          lastName: 'Jackson',
          firstName: 'Janet',
          sessionId: session.id,
        });

        databaseBuilder.factory.buildUser({ id: 12345 });
        const janisCandidateId = databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Joplin',
          firstName: 'Janis',
          sessionId: session.id,
          userId: 12345,
          authorizedToStart: true,
        }).id;

        const certificationCourseWithBothLiveAlerts = databaseBuilder.factory.buildCertificationCourse({
          version: AlgorithmEngineVersion.V3,
          userId: 12345,
          sessionId: session.id,
          createdAt: new Date('2022-10-19T13:37:00Z'),
          candidateId: janisCandidateId,
        });

        const assessmentWithBothLiveAlerts = databaseBuilder.factory.buildAssessment({
          certificationCourseId: certificationCourseWithBothLiveAlerts.id,
          state: Assessment.states.STARTED,
        });

        databaseBuilder.factory.buildCertificationChallengeLiveAlert({
          assessmentId: assessmentWithBothLiveAlerts.id,
        });
        databaseBuilder.factory.buildCertificationCompanionLiveAlert({
          assessmentId: assessmentWithBothLiveAlerts.id,
        });

        const certificationCourseWithChallengeLiveAlert = databaseBuilder.factory.buildCertificationCourse({
          version: AlgorithmEngineVersion.V3,
          userId: 22222,
          sessionId: session.id,
          createdAt: new Date('2022-10-19T13:37:00Z'),
          candidateId: ziggyCandidateId,
        });

        const assessmentWithChallengeLiveAlert = databaseBuilder.factory.buildAssessment({
          certificationCourseId: certificationCourseWithChallengeLiveAlert.id,
          state: Assessment.states.STARTED,
        });

        databaseBuilder.factory.buildCertificationChallengeLiveAlert({
          assessmentId: assessmentWithChallengeLiveAlert.id,
        });

        const candidate = databaseBuilder.factory.buildCertificationCandidate();
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
        await databaseBuilder.commit();

        // when
        const actualSession = await sessionForSupervisingRepository.get({ id: session.id });

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
            'challengeLiveAlert',
            'companionLiveAlert',
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
            challengeLiveAlert: {
              type: 'challenge',
              hasAttachment: false,
              hasImage: false,
              hasEmbed: false,
              isFocus: false,
              status: CertificationChallengeLiveAlertStatus.ONGOING,
            },
            companionLiveAlert: {
              type: 'companion',
              status: CertificationCompanionLiveAlertStatus.ONGOING,
            },
          },
          {
            userId: 22222,
            lastName: 'Stardust',
            firstName: 'Ziggy',
            authorizedToStart: false,
            assessmentStatus: Assessment.states.STARTED,
            startDateTime: '2022-10-19T13:37:00+00:00',
            challengeLiveAlert: {
              type: 'challenge',
              hasAttachment: false,
              hasImage: false,
              hasEmbed: false,
              isFocus: false,
              status: CertificationChallengeLiveAlertStatus.ONGOING,
            },
            companionLiveAlert: null,
          },
          {
            userId: 33333,
            lastName: 'Jackson',
            firstName: 'Janet',
            authorizedToStart: false,
            assessmentStatus: null,
            startDateTime: null,
            challengeLiveAlert: null,
            companionLiveAlert: null,
          },
          {
            userId: 11111,
            lastName: 'Jackson',
            firstName: 'Michael',
            authorizedToStart: true,
            assessmentStatus: null,
            startDateTime: null,
            challengeLiveAlert: null,
            companionLiveAlert: null,
          },
        ]);
      });
    });
  });
});
