import { expect } from 'chai';
import sinon from 'sinon';

import { CertificationDurationExceededError } from '../../../../../../src/certification/evaluation/domain/errors.js';
import { retrieveLastOrCreateCertificationCourse } from '../../../../../../src/certification/evaluation/domain/usecases/retrieve-last-or-create-certification-course.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import {
  LanguageNotSupportedError,
  NotFoundError,
  UnexpectedUserAccountError,
} from '../../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr, preventStubsToBeCalledUnexpectedly } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Evaluation | Unit | UseCase | retrieve-last-or-create-certification-course', function () {
  let assessmentRepository,
    candidateRepository,
    certificationCourseRepository,
    assessmentSheetRepository,
    candidateAuthorizationAdapter,
    sessionAdapter,
    versionApi,
    certificationBadgesService,
    verifyCertificateCodeService,
    dependencies,
    clock;
  const now = new Date('2026-01-01');
  const clientTimezone = 'Europe/London';

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    assessmentRepository = {
      save: sinon.stub(),
    };
    candidateRepository = {
      findByUserIdAndSessionId: sinon.stub(),
    };
    certificationCourseRepository = {
      findOneCertificationCourseByUserIdAndSessionId: sinon.stub(),
      save: sinon.stub(),
    };
    versionApi = {
      getByFrameworkAndDate: sinon.stub(),
    };
    assessmentSheetRepository = {
      findByCertificationCourseId: sinon.stub(),
      update: sinon.stub(),
    };
    candidateAuthorizationAdapter = {
      find: sinon.stub(),
    };
    sessionAdapter = {
      onCertificationStartedOrResumed: sinon.stub(),
    };
    verifyCertificateCodeService = {
      generateCertificateVerificationCode: sinon.fake.returns('FAKECODE'),
    };
    certificationBadgesService = { findStillValidBadgeAcquisitions: sinon.stub() };
    preventStubsToBeCalledUnexpectedly([
      assessmentRepository.save,
      candidateRepository.findByUserIdAndSessionId,
      certificationCourseRepository.save,
      certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId,
      assessmentSheetRepository.findByCertificationCourseId,
      assessmentSheetRepository.update,
      candidateAuthorizationAdapter.find,
      sessionAdapter.onCertificationStartedOrResumed,
      versionApi.getByFrameworkAndDate,
      certificationBadgesService.findStillValidBadgeAcquisitions,
    ]);
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback();
    });
    dependencies = {
      assessmentRepository,
      candidateRepository,
      certificationCourseRepository,
      assessmentSheetRepository,
      candidateAuthorizationAdapter,
      sessionAdapter,
      versionApi,
      certificationBadgesService,
      verifyCertificateCodeService,
    };
  });

  afterEach(function () {
    clock.restore();
    sinon.restore();
  });

  context('when no candidate found for given user and session', function () {
    it('should throw a UnexpectedUserAccountError', async function () {
      // given
      candidateAuthorizationAdapter.find.withArgs({ userId: 2, sessionId: 1 }).resolves(null);

      // when
      const error = await catchErr(retrieveLastOrCreateCertificationCourse)({
        accessCode: 'RIGHTCODE',
        sessionId: 1,
        userId: 2,
        clientTimezone,
        ...dependencies,
      });

      // then
      expect(error).to.be.instanceOf(UnexpectedUserAccountError);
    });
  });

  context('when candidate exists but is not authorized to start or resume the test', function () {
    it('should throw a UnexpectedUserAccountError', async function () {
      // given
      const candidateAuthorization = domainBuilder.certification.evaluation
        .candidateAuthorizationBuilder()
        .reconciled({ userId: 2 })
        .withSession({ sessionId: 1, accessCode: 'WRONG' })
        .asAuthorizedToStart()
        .subscribedTo({ framework: Frameworks.CORE, isCenterHabilitated: true })
        .build();
      candidateAuthorizationAdapter.find.withArgs({ userId: 2, sessionId: 1 }).resolves(candidateAuthorization);

      // when
      const error = await catchErr(retrieveLastOrCreateCertificationCourse)({
        accessCode: 'RIGHTCODE',
        sessionId: 1,
        userId: 2,
        clientTimezone,
        ...dependencies,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when candidate is authorized but has exceeded test duration for their ongoing test', function () {
    it('throws a CertificationDurationExceededError and force finishes the ongoing test', async function () {
      // given
      const candidateAuthorization = domainBuilder.certification.evaluation
        .candidateAuthorizationBuilder()
        .reconciled({ userId: 2 })
        .withSession({ sessionId: 1, accessCode: 'RIGHTCODE' })
        .asAuthorizedToStart()
        .subscribedTo({ framework: Frameworks.CORE, isCenterHabilitated: true })
        .hasACertification({ certificationId: 3, hasExceededCertificationDuration: true })
        .build();
      const assessmentSheetBeforeUpdate = domainBuilder.certification.evaluation.buildAssessmentSheet({
        certificationCourseId: 3,
        assessmentId: 4,
        userId: 2,
        state: Assessment.states.STARTED,
        assessmentUpdatedAt: new Date('2021-01-01'),
      });
      candidateAuthorizationAdapter.find.withArgs({ userId: 2, sessionId: 1 }).resolves(candidateAuthorization);
      assessmentSheetRepository.findByCertificationCourseId.withArgs(3).resolves(assessmentSheetBeforeUpdate);
      assessmentSheetRepository.update.resolves();

      // when
      const error = await catchErr(retrieveLastOrCreateCertificationCourse)({
        accessCode: 'RIGHTCODE',
        sessionId: 1,
        userId: 2,
        clientTimezone,
        ...dependencies,
      });

      // then
      expect(error).to.be.instanceOf(CertificationDurationExceededError);
      sinon.assert.calledWith(
        assessmentSheetRepository.update,
        domainBuilder.certification.evaluation.buildAssessmentSheet({
          certificationCourseId: 3,
          assessmentId: 4,
          userId: 2,
          state: Assessment.states.ENDED_DUE_TO_DURATION_EXCEEDED,
          assessmentUpdatedAt: now,
        }),
      );
    });
  });

  context('when candidate has already a test started', function () {
    it('returns the existing test and tells the session API that candidate resumed', async function () {
      // given
      const candidateAuthorization = domainBuilder.certification.evaluation
        .candidateAuthorizationBuilder()
        .reconciled({ userId: 2, at: new Date('2022-02-02') })
        .withSession({ sessionId: 1, accessCode: 'RIGHTCODE' })
        .asAuthorizedToStart()
        .subscribedTo({ framework: Frameworks.CORE, isCenterHabilitated: true })
        .hasACertification({ certificationId: 3, hasExceededCertificationDuration: false })
        .build();
      candidateAuthorizationAdapter.find.withArgs({ userId: 2, sessionId: 1 }).resolves(candidateAuthorization);
      const candidate = domainBuilder.certification.evaluation.buildCandidate({
        id: 4,
        accessibilityAdjustmentNeeded: true,
      });
      candidateRepository.findByUserIdAndSessionId.withArgs({ userId: 2, sessionId: 1 }).resolves(candidate);
      versionApi.getByFrameworkAndDate
        .withArgs({ framework: Frameworks.CORE, date: new Date('2022-02-02') })
        .resolves({ id: 5, challengesConfiguration: { maximumAssessmentLength: 99 } });
      const certificationCourse = domainBuilder.buildCertificationCourse({ id: 3 });
      certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
        .withArgs({
          userId: 2,
          sessionId: 1,
        })
        .resolves(certificationCourse);
      sessionAdapter.onCertificationStartedOrResumed.resolves();

      // when
      const result = await retrieveLastOrCreateCertificationCourse({
        accessCode: 'RIGHTCODE',
        sessionId: 1,
        userId: 2,
        clientTimezone,
        ...dependencies,
      });

      // then
      const expectedCertificationCourse = domainBuilder.buildCertificationCourse({ id: 3 });
      expectedCertificationCourse._isAdjustedForAccessibility = true;
      expectedCertificationCourse._numberOfChallenges = 99;
      expect(result.created).to.be.false;
      expect(result.certificationCourse).to.deep.equal(expectedCertificationCourse);
      sinon.assert.calledWith(sessionAdapter.onCertificationStartedOrResumed, {
        candidateId: 4,
        certificationId: 3,
        sessionId: 1,
        timezone: clientTimezone,
      });
    });
  });

  context('when candidate is about to start a test chosing a locale not supported', function () {
    it('throws a LanguageNotSupportedError', async function () {
      // given
      const candidateAuthorization = domainBuilder.certification.evaluation
        .candidateAuthorizationBuilder()
        .reconciled({ userId: 2, at: new Date('2022-02-02') })
        .withSession({ sessionId: 1, accessCode: 'RIGHTCODE' })
        .asAuthorizedToStart()
        .subscribedTo({ framework: Frameworks.CORE, isCenterHabilitated: true })
        .build();
      candidateAuthorizationAdapter.find.withArgs({ userId: 2, sessionId: 1 }).resolves(candidateAuthorization);
      versionApi.getByFrameworkAndDate
        .withArgs({ framework: Frameworks.CORE, date: new Date('2022-02-02') })
        .resolves({ id: 5, challengesConfiguration: { maximumAssessmentLength: 99 } });
      certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
        .withArgs({
          userId: 2,
          sessionId: 1,
        })
        .resolves(null);

      // when
      const err = await catchErr(retrieveLastOrCreateCertificationCourse)({
        accessCode: 'RIGHTCODE',
        sessionId: 1,
        userId: 2,
        locale: 'es-ES',
        clientTimezone,
        ...dependencies,
      });

      // then
      expect(err).to.be.instanceOf(LanguageNotSupportedError);
    });
  });

  context('when candidate starts the test successfully', function () {
    it('returns the created test', async function () {
      // given
      const candidateAuthorization = domainBuilder.certification.evaluation
        .candidateAuthorizationBuilder()
        .reconciled({ userId: 2, at: new Date('2022-02-02') })
        .withSession({ sessionId: 1, accessCode: 'RIGHTCODE' })
        .asAuthorizedToStart()
        .subscribedTo({ framework: Frameworks.CORE, isCenterHabilitated: true })
        .build();
      candidateAuthorizationAdapter.find.withArgs({ userId: 2, sessionId: 1 }).resolves(candidateAuthorization);
      const candidate = domainBuilder.certification.evaluation.buildCandidate({
        id: 4,
        firstName: 'Lolo',
        accessibilityAdjustmentNeeded: true,
      });
      candidateRepository.findByUserIdAndSessionId.withArgs({ userId: 2, sessionId: 1 }).resolves(candidate);
      versionApi.getByFrameworkAndDate
        .withArgs({ framework: Frameworks.CORE, date: new Date('2022-02-02') })
        .resolves({ id: 5, challengesConfiguration: { maximumAssessmentLength: 99 } });
      certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
        .withArgs({
          userId: 2,
          sessionId: 1,
        })
        .resolves(null);
      const savedCertificationCourse = domainBuilder.buildCertificationCourse({
        id: 10,
        isAdjustedForAccessibility: true,
      });
      certificationCourseRepository.save.resolves(savedCertificationCourse);
      const savedAssessment = domainBuilder.buildAssessment({ id: 11 });
      assessmentRepository.save.resolves(savedAssessment);
      sessionAdapter.onCertificationStartedOrResumed.resolves();

      // when
      const result = await retrieveLastOrCreateCertificationCourse({
        accessCode: 'RIGHTCODE',
        sessionId: 1,
        userId: 2,
        clientTimezone,
        ...dependencies,
      });

      // then
      expect(result.created).to.be.true;
      sinon.assert.match(result.certificationCourse, {
        _id: 10,
        _numberOfChallenges: 99,
        _assessment: savedAssessment,
      });
      sinon.assert.calledWith(sessionAdapter.onCertificationStartedOrResumed, {
        candidateId: 4,
        certificationId: 10,
        sessionId: 1,
        timezone: clientTimezone,
      });
      sinon.assert.calledWith(
        certificationCourseRepository.save,
        sinon.match({
          certificationCourse: sinon.match({
            _isAdjustedForAccessibility: true,
            _firstName: 'Lolo',
            versionId: 5,
            _version: AlgorithmEngineVersion.V3,
            framework: Frameworks.CORE,
            _lang: 'fr-fr',
            _verificationCode: 'FAKECODE',
          }),
        }),
      );
    });
  });

  context('CLEA', function () {
    context('when candidate starts CLEA test but was not eligible', function () {
      it('returns the created test on CORE framework', async function () {
        // given
        const candidateAuthorization = domainBuilder.certification.evaluation
          .candidateAuthorizationBuilder()
          .reconciled({ userId: 2, at: new Date('2022-02-02') })
          .withSession({ sessionId: 1, accessCode: 'RIGHTCODE' })
          .asAuthorizedToStart()
          .subscribedTo({ framework: Frameworks.CLEA, isCenterHabilitated: true })
          .build();
        candidateAuthorizationAdapter.find.withArgs({ userId: 2, sessionId: 1 }).resolves(candidateAuthorization);
        const candidate = domainBuilder.certification.evaluation.buildCandidate({
          id: 4,
          firstName: 'Lolo',
          accessibilityAdjustmentNeeded: true,
        });
        candidateRepository.findByUserIdAndSessionId.withArgs({ userId: 2, sessionId: 1 }).resolves(candidate);
        versionApi.getByFrameworkAndDate
          .withArgs({ framework: Frameworks.CLEA, date: new Date('2022-02-02') })
          .resolves({ id: 5, challengesConfiguration: { maximumAssessmentLength: 99 } });
        certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
          .withArgs({
            userId: 2,
            sessionId: 1,
          })
          .resolves(null);
        const savedCertificationCourse = domainBuilder.buildCertificationCourse({
          id: 10,
          isAdjustedForAccessibility: true,
        });
        certificationCourseRepository.save.resolves(savedCertificationCourse);
        const savedAssessment = domainBuilder.buildAssessment({ id: 11 });
        assessmentRepository.save.resolves(savedAssessment);
        sessionAdapter.onCertificationStartedOrResumed.resolves();
        certificationBadgesService.findStillValidBadgeAcquisitions.withArgs({ userId: 2 }).resolves([]);

        // when
        const result = await retrieveLastOrCreateCertificationCourse({
          accessCode: 'RIGHTCODE',
          sessionId: 1,
          userId: 2,
          clientTimezone,
          ...dependencies,
        });

        // then
        expect(result.created).to.be.true;
        sinon.assert.match(result.certificationCourse, {
          _id: 10,
          _numberOfChallenges: 99,
          _assessment: savedAssessment,
        });
        sinon.assert.calledWith(sessionAdapter.onCertificationStartedOrResumed, {
          candidateId: 4,
          certificationId: 10,
          sessionId: 1,
          timezone: clientTimezone,
        });
        sinon.assert.calledWith(
          certificationCourseRepository.save,
          sinon.match({
            certificationCourse: sinon.match({
              _isAdjustedForAccessibility: true,
              _firstName: 'Lolo',
              versionId: 5,
              _version: AlgorithmEngineVersion.V3,
              framework: Frameworks.CORE,
              _lang: 'fr-fr',
              _verificationCode: 'FAKECODE',
            }),
          }),
        );
      });
    });

    context('when candidate starts CLEA test and is eligible', function () {
      it('returns the created test on CLEA framework', async function () {
        // given
        const candidateAuthorization = domainBuilder.certification.evaluation
          .candidateAuthorizationBuilder()
          .reconciled({ userId: 2, at: new Date('2022-02-02') })
          .withSession({ sessionId: 1, accessCode: 'RIGHTCODE' })
          .asAuthorizedToStart()
          .subscribedTo({ framework: Frameworks.CLEA, isCenterHabilitated: true })
          .build();
        candidateAuthorizationAdapter.find.withArgs({ userId: 2, sessionId: 1 }).resolves(candidateAuthorization);
        const candidate = domainBuilder.certification.evaluation.buildCandidate({
          id: 4,
          firstName: 'Lolo',
          accessibilityAdjustmentNeeded: true,
        });
        candidateRepository.findByUserIdAndSessionId.withArgs({ userId: 2, sessionId: 1 }).resolves(candidate);
        versionApi.getByFrameworkAndDate
          .withArgs({ framework: Frameworks.CLEA, date: new Date('2022-02-02') })
          .resolves({ id: 5, challengesConfiguration: { maximumAssessmentLength: 99 } });
        certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
          .withArgs({
            userId: 2,
            sessionId: 1,
          })
          .resolves(null);
        const savedCertificationCourse = domainBuilder.buildCertificationCourse({
          id: 10,
          isAdjustedForAccessibility: true,
        });
        certificationCourseRepository.save.resolves(savedCertificationCourse);
        const savedAssessment = domainBuilder.buildAssessment({ id: 11 });
        assessmentRepository.save.resolves(savedAssessment);
        sessionAdapter.onCertificationStartedOrResumed.resolves();
        certificationBadgesService.findStillValidBadgeAcquisitions.withArgs({ userId: 2 }).resolves([
          {
            complementaryCertificationId: 'CLEA CERTIF ID',
            complementaryCertificationBadgeId: 'CLEA BADGE ID',
            complementaryCertificationKey: Frameworks.CLEA,
          },
        ]);

        // when
        const result = await retrieveLastOrCreateCertificationCourse({
          accessCode: 'RIGHTCODE',
          sessionId: 1,
          userId: 2,
          clientTimezone,
          ...dependencies,
        });

        // then
        expect(result.created).to.be.true;
        sinon.assert.match(result.certificationCourse, {
          _id: 10,
          _numberOfChallenges: 99,
          _assessment: savedAssessment,
        });
        sinon.assert.calledWith(sessionAdapter.onCertificationStartedOrResumed, {
          candidateId: 4,
          certificationId: 10,
          sessionId: 1,
          timezone: clientTimezone,
        });
        sinon.assert.calledWith(
          certificationCourseRepository.save,
          sinon.match({
            certificationCourse: sinon.match({
              _isAdjustedForAccessibility: true,
              _firstName: 'Lolo',
              versionId: 5,
              _version: AlgorithmEngineVersion.V3,
              framework: Frameworks.CLEA,
              _lang: 'fr-fr',
              _verificationCode: 'FAKECODE',
              _complementaryCertificationCourse: sinon.match({
                complementaryCertificationId: 'CLEA CERTIF ID',
                complementaryCertificationBadgeId: 'CLEA BADGE ID',
              }),
            }),
          }),
        );
      });
    });
  });
});
