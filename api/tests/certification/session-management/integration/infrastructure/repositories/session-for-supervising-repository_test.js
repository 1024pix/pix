import _ from 'lodash';

import { NotFoundError } from '../../../../../../lib/domain/errors.js';
import { SessionForSupervising } from '../../../../../../src/certification/session-management/domain/read-models/SessionForSupervising.js';
import * as sessionForSupervisingRepository from '../../../../../../src/certification/session-management/infrastructure/repositories/session-for-supervising-repository.js';
import { CertificationChallengeLiveAlertStatus } from '../../../../../../src/certification/shared/domain/models/CertificationChallengeLiveAlert.js';
import { CERTIFICATION_VERSIONS } from '../../../../../../src/certification/shared/domain/models/CertificationVersion.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { catchErr, databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Repository | SessionForSupervising', function () {
  describe('#get', function () {
    describe('when certification session is v2', function () {
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
        const candidateA = databaseBuilder.factory.buildCertificationCandidate({
          userId: 11111,
          lastName: 'Jackson',
          firstName: 'Michael',
          sessionId: session.id,
          authorizedToStart: true,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidateA.id });

        databaseBuilder.factory.buildUser({ id: 22222 });
        const candidateB = databaseBuilder.factory.buildCertificationCandidate({
          userId: 22222,
          lastName: 'Stardust',
          firstName: 'Ziggy',
          sessionId: session.id,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidateB.id });

        databaseBuilder.factory.buildUser({ id: 33333 });
        const candidateC = databaseBuilder.factory.buildCertificationCandidate({
          userId: 33333,
          lastName: 'Jackson',
          firstName: 'Janet',
          sessionId: session.id,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidateC.id });

        databaseBuilder.factory.buildUser({ id: 12345 });
        const candidateD = databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Joplin',
          firstName: 'Janis',
          sessionId: session.id,
          userId: 12345,
          authorizedToStart: true,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidateD.id });

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
        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          id: 9998,
          sessionId: session.id,
          userId: 11111,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: certificationCandidate.id });

        databaseBuilder.factory.buildUser({ id: 22222 });
        const candidateB = databaseBuilder.factory.buildCertificationCandidate({
          userId: 22222,
          lastName: 'Joplin',
          firstName: 'Janis',
          sessionId: session.id,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidateB.id });

        const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+ Édu 1er degré',
          key: 'EDU_1ER_DEGRE',
          certificationExtraTime: 45,
        });

        databaseBuilder.factory.buildComplementaryCertificationSubscription({
          certificationCandidateId: certificationCandidate.id,
          complementaryCertificationId: complementaryCertification.id,
        });

        databaseBuilder.factory.buildUser({ id: 22222 });
        const candidateB = databaseBuilder.factory.buildCertificationCandidate({
          userId: 22222,
          lastName: 'Joplin',
          firstName: 'Janis',
          sessionId: session.id,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidateB.id });
        databaseBuilder.factory.buildCertificationCourse({
          id: 9999,
          sessionId: session.id,
          userId: 22222,
        });

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
            'enrolledComplementaryCertification',
            'isComplementaryCertificationInProgress',
          ]),
        );

        expect(actualCandidates).to.have.deep.ordered.members([
          {
            userId: 11111,
            lastName: 'Jackson',
            firstName: 'Janet',
            isComplementaryCertificationInProgress: true,
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
            isComplementaryCertificationInProgress: false,
            enrolledComplementaryCertification: null,
          },
        ]);
      });

      it('should return a Not found error when no session was found', async function () {
        // when
        const error = await catchErr(sessionForSupervisingRepository.get)({ id: 123123 });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });

    describe('when certification session is v3', function () {
      it('should return session informations in a SessionForSupervising Object', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({ name: 'Toto', id: 1234 });
        const session = databaseBuilder.factory.buildSession({
          version: CERTIFICATION_VERSIONS.V3,
          address: 'centre de certification 1',
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

      it('should return associated certifications candidates ordered by live alert status, lastname and firstname', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({ name: 'Toto', id: 1234 });
        const session = databaseBuilder.factory.buildSession({
          version: CERTIFICATION_VERSIONS.V3,
          certificationCenter: 'Tour Gamma',
          room: 'Salle A',
          examiner: 'Monsieur Examinateur',
          date: '2018-02-23',
          time: '12:00:00',
          certificationCenterId: 1234,
        });

        databaseBuilder.factory.buildUser({ id: 11111 });
        const candidateA = databaseBuilder.factory.buildCertificationCandidate({
          userId: 11111,
          lastName: 'Jackson',
          firstName: 'Michael',
          sessionId: session.id,
          authorizedToStart: true,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidateA.id });

        databaseBuilder.factory.buildUser({ id: 22222 });
        const candidateB = databaseBuilder.factory.buildCertificationCandidate({
          userId: 22222,
          lastName: 'Stardust',
          firstName: 'Ziggy',
          sessionId: session.id,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidateB.id });

        databaseBuilder.factory.buildUser({ id: 33333 });
        const candidateC = databaseBuilder.factory.buildCertificationCandidate({
          userId: 33333,
          lastName: 'Jackson',
          firstName: 'Janet',
          sessionId: session.id,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidateC.id });

        databaseBuilder.factory.buildUser({ id: 12345 });
        const candidateD = databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Joplin',
          firstName: 'Janis',
          sessionId: session.id,
          userId: 12345,
          authorizedToStart: true,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidateD.id });

        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          version: CERTIFICATION_VERSIONS.V3,
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
            'liveAlert',
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
            liveAlert: {
              hasAttachment: false,
              hasImage: false,
              hasEmbed: false,
              isFocus: false,
              status: CertificationChallengeLiveAlertStatus.ONGOING,
            },
          },
          {
            userId: 33333,
            lastName: 'Jackson',
            firstName: 'Janet',
            authorizedToStart: false,
            assessmentStatus: null,
            startDateTime: null,
            liveAlert: null,
          },
          {
            userId: 11111,
            lastName: 'Jackson',
            firstName: 'Michael',
            authorizedToStart: true,
            assessmentStatus: null,
            startDateTime: null,
            liveAlert: null,
          },
          {
            userId: 22222,
            lastName: 'Stardust',
            firstName: 'Ziggy',
            authorizedToStart: false,
            assessmentStatus: null,
            startDateTime: null,
            liveAlert: null,
          },
        ]);
      });

      it('should return a Not found error when no session was found', async function () {
        // when
        const error = await catchErr(sessionForSupervisingRepository.get)({ id: 123123 });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });
});
