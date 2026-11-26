import { expect } from 'chai';

import { CERTIFICATION_RESULT_STATUSES } from '../../../../../../src/certification/results/domain/constants.ts';
import { usecases } from '../../../../../../src/certification/session-management/domain/usecases/index.js';
import { PIX_PLUS_EDU_EXTERNAL_LEVELS } from '../../../../../../src/certification/shared/domain/constants/mesh-configuration.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { featureToggles } from '../../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Session Management | Integration | Domain | UseCase | Update Edu v3 External Jury result', function () {
  context('when certification is does not exist', function () {
    it('throws an Error', async function () {
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        isPublished: false,
        framework: Frameworks.EDU_1ER_DEGRE,
        version: AlgorithmEngineVersion.V3,
      }).id;
      databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId,
        reachedMeshIndex: 0,
        eduV3ExternalJuryResult: null,
      });
      await databaseBuilder.commit();

      // when
      const err = await catchErr(usecases.updateEduV3ExternalJuryResult)({
        certificationCourseId: certificationCourseId + 1,
        eduV3ExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.EXPERT,
      });

      expect(err.message).to.equal(`Certification course of id ${certificationCourseId + 1} does not exist.`);
    });
  });

  context('success case', function () {
    it('updates the certification and its certification result, and returns the updated certification', async function () {
      await featureToggles.set('writeNewCertificationResults', true);

      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        isPublished: true,
        framework: Frameworks.EDU_1ER_DEGRE,
        version: AlgorithmEngineVersion.V3,
      });
      const assessmentResult = databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId: certificationCourse.id,
        reachedMeshIndex: 0,
        eduV3ExternalJuryResult: null,
      });
      const certificationResult = databaseBuilder.factory.buildCertificationResult({
        framework: Frameworks.EDU_1ER_DEGRE,
        status: CERTIFICATION_RESULT_STATUSES.VALIDATED,
        v3EduExternalJuryResult: null,
      });
      databaseBuilder.factory.buildUserCertificationResult({
        certificationResultId: certificationResult.id,
        certificationCourseId: certificationCourse.id,
        userId: certificationCourse.userId,
      });
      await databaseBuilder.commit();

      // when
      const juryCertificationUpdated = await usecases.updateEduV3ExternalJuryResult({
        certificationCourseId: certificationCourse.id,
        eduV3ExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.EXPERT,
      });

      expect(juryCertificationUpdated).to.deepEqualInstance(
        domainBuilder.certification.sessionManagement.buildJuryCertification({
          ...assessmentResult,
          ...certificationCourse,
          eduV3ExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.EXPERT,
          certificationCourseId: certificationCourse.id,
          version: AlgorithmEngineVersion.V3,
          certificationFramework: Frameworks.EDU_1ER_DEGRE,
          commentForCandidate: 'Some comment for candidate',
          certificationIssueReports: [],
          commentByJury: null,
          competenceMarks: [],
        }),
      );
      const { v3EduExternalJuryResult } = await knex('certification_results')
        .select('v3EduExternalJuryResult')
        .where({ id: certificationResult.id })
        .first();
      expect(v3EduExternalJuryResult).to.equal(PIX_PLUS_EDU_EXTERNAL_LEVELS.EXPERT);
    });
  });
});
