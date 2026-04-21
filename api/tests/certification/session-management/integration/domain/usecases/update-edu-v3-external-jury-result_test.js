import { usecases } from '../../../../../../src/certification/session-management/domain/usecases/index.js';
import { PIX_PLUS_EDU_EXTERNAL_LEVELS } from '../../../../../../src/certification/shared/domain/constants/mesh-configuration.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';

import { databaseBuilder } from '../../../../../tooling/databases.js';
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
    it('updates the certification and returns the update certification', async function () {
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
    });
  });
});
