import sinon from 'sinon';

import { CertificationJuryDone } from '../../../../../../src/certification/session-management/domain/events/CertificationJuryDone.js';
import { usecases } from '../../../../../../src/certification/session-management/domain/usecases/index.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { preventStubsToBeCalledUnexpectedly } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Session Management | Integration | Domain | UseCase | process-auto-jury_test ', function () {
  context('when it is a V3 certification', function () {
    let certificationEvaluationRepository_rescoreV3CertificationStub;
    let certificationEvaluationRepository;
    const now = new Date('2025-06-15');

    beforeEach(function () {
      sinon.useFakeTimers({ now, toFake: ['Date'] });
      certificationEvaluationRepository_rescoreV3CertificationStub = sinon.stub().named('rescoreV3Certification');
      preventStubsToBeCalledUnexpectedly([certificationEvaluationRepository_rescoreV3CertificationStub]);

      certificationEvaluationRepository = {
        rescoreV3Certification: certificationEvaluationRepository_rescoreV3CertificationStub,
      };
    });

    context('when certification is started', function () {
      it('should trigger a scoring and update by finalization certification course and assessment accordingly', async function () {
        // given
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          updatedAt: new Date('2021-01-01'),
        }).id;
        const assessmentId = databaseBuilder.factory.buildAssessment({
          updatedAt: new Date('2022-01-01'),
          state: Assessment.states.STARTED,
        }).id;
        await databaseBuilder.commit();

        const certificationCourse = domainBuilder.certification.sessionManagement.buildCertificationCourse({
          id: certificationCourseId,
          version: 3,
          updatedAt: new Date('2021-01-01'),
          assessmentId,
          assessmentState: Assessment.states.STARTED,
        });
        const session = domainBuilder.certification.sessionManagement.buildSession({
          certificationCourses: [certificationCourse],
        });
        certificationEvaluationRepository_rescoreV3CertificationStub.resolves();

        // when
        await usecases.processAutoJury({ session, certificationEvaluationRepository });

        // then
        const certificationCourseData = await knex('certification-courses')
          .select('updatedAt')
          .where({ id: certificationCourseId })
          .first();
        const assessmentData = await knex('assessments').select(['state']).where({ id: assessmentId }).first();
        expect(certificationCourseData).to.deep.equal({
          updatedAt: now,
        });
        expect(assessmentData).to.deep.equal({
          state: Assessment.states.ENDED_DUE_TO_FINALIZATION,
        });
        expect(certificationEvaluationRepository_rescoreV3CertificationStub).to.have.been.calledOnceWithExactly({
          event: new CertificationJuryDone({
            certificationCourseId: certificationCourse.id,
          }),
        });
      });
    });

    context('when certification was ended by invigilator', function () {
      it('should trigger a scoring but not update by finalization certification course nor assessment', async function () {
        // given
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          updatedAt: new Date('2021-01-01'),
        }).id;
        const assessmentId = databaseBuilder.factory.buildAssessment({
          updatedAt: new Date('2022-01-01'),
          state: Assessment.states.ENDED_BY_INVIGILATOR,
        }).id;
        await databaseBuilder.commit();

        const certificationCourse = domainBuilder.certification.sessionManagement.buildCertificationCourse({
          id: certificationCourseId,
          version: 3,
          updatedAt: new Date('2021-01-01'),
          assessmentId,
          assessmentState: Assessment.states.ENDED_BY_INVIGILATOR,
        });
        const session = domainBuilder.certification.sessionManagement.buildSession({
          certificationCourses: [certificationCourse],
        });
        certificationEvaluationRepository_rescoreV3CertificationStub.resolves();

        // when
        await usecases.processAutoJury({ session, certificationEvaluationRepository });

        // then
        const certificationCourseData = await knex('certification-courses')
          .select('updatedAt')
          .where({ id: certificationCourseId })
          .first();
        const assessmentData = await knex('assessments').select(['state']).where({ id: assessmentId }).first();
        expect(certificationCourseData).to.deep.equal({
          updatedAt: new Date('2021-01-01'),
        });
        expect(assessmentData).to.deep.equal({
          state: Assessment.states.ENDED_BY_INVIGILATOR,
        });
        expect(certificationEvaluationRepository_rescoreV3CertificationStub).to.have.been.calledOnceWithExactly({
          event: new CertificationJuryDone({
            certificationCourseId: certificationCourse.id,
          }),
        });
      });
    });

    context('when certification is completed', function () {
      it('should not trigger a scoring', async function () {
        // given
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          updatedAt: new Date('2021-01-01'),
        }).id;
        const assessmentId = databaseBuilder.factory.buildAssessment({
          updatedAt: new Date('2022-01-01'),
          state: Assessment.states.COMPLETED,
        }).id;
        await databaseBuilder.commit();

        const certificationCourse = domainBuilder.certification.sessionManagement.buildCertificationCourse({
          id: certificationCourseId,
          version: 3,
          updatedAt: new Date('2021-01-01'),
          assessmentId,
          assessmentState: Assessment.states.COMPLETED,
        });
        const session = domainBuilder.certification.sessionManagement.buildSession({
          certificationCourses: [certificationCourse],
        });

        // when
        await usecases.processAutoJury({ session, certificationEvaluationRepository });

        // then
        const certificationCourseData = await knex('certification-courses')
          .select('updatedAt')
          .where({ id: certificationCourseId })
          .first();
        const assessmentData = await knex('assessments').select(['state']).where({ id: assessmentId }).first();
        expect(certificationCourseData).to.deep.equal({
          updatedAt: new Date('2021-01-01'),
        });
        expect(assessmentData).to.deep.equal({
          state: Assessment.states.COMPLETED,
        });
        expect(certificationEvaluationRepository_rescoreV3CertificationStub).not.to.have.been.called;
      });
    });
  });
});
