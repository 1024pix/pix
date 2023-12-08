import { expect, sinon } from '../../../test-helper.js';

import * as service from '../../../../lib/domain/services/assessment-result-service.js';
import { AssessmentResult } from '../../../../src/shared/domain/models/AssessmentResult.js';
import { CompetenceMark } from '../../../../lib/domain/models/CompetenceMark.js';

describe('Unit | Domain | Services | assessment-results', function () {
  describe('#save', function () {
    const assessmentResult = new AssessmentResult({
      assessmentId: 1,
      level: 3,
      pixScore: 27,
      status: 'validated',
      emitter: 'Jury',
      commentForJury: 'Parce que',
      commentForCandidate: 'Voilà',
      commentForOrganization: 'Truc',
    });
    const competenceMarks = [
      new CompetenceMark({
        level: 2,
        score: 18,
        area_code: 2,
        competence_code: 2.1,
      }),
      new CompetenceMark({
        level: 3,
        score: 27,
        area_code: 3,
        competence_code: 3.2,
      }),
    ];
    let assessmentResultRepositoryStub;
    let competenceMarkRepositoryStub;

    beforeEach(function () {
      assessmentResultRepositoryStub = {
        save: sinon.stub().resolves({ id: 1 }),
      };
      competenceMarkRepositoryStub = {
        save: sinon.stub().resolves(),
      };
    });

    it('should save the assessment results', async function () {
      // when
      await service.save({
        certificationCourseId: 99,
        assessmentResult,
        competenceMarks,
        dependencies: {
          assessmentResultRepository: assessmentResultRepositoryStub,
          competenceMarkRepository: competenceMarkRepositoryStub,
        },
      });

      // then
      expect(assessmentResultRepositoryStub.save).to.have.been.calledOnce;
      expect(assessmentResultRepositoryStub.save).to.have.been.calledOnceWith({
        certificationCourseId: 99,
        assessmentResult,
      });
    });

    it('should save all competenceMarks', async function () {
      // when
      await service.save({
        certificationCourseId: 99,
        assessmentResult,
        competenceMarks,
        dependencies: {
          assessmentResultRepository: assessmentResultRepositoryStub,
          competenceMarkRepository: competenceMarkRepositoryStub,
        },
      });

      // then
      expect(competenceMarkRepositoryStub.save).to.have.been.calledTwice;
      expect(competenceMarkRepositoryStub.save).to.have.been.calledWithMatch(
        new CompetenceMark({
          assessmentResultId: 1,
          level: 2,
          score: 18,
          area_code: 2,
          competence_code: 2.1,
        }),
      );
      expect(competenceMarkRepositoryStub.save).to.have.been.calledWithMatch(
        new CompetenceMark({
          assessmentResultId: 1,
          level: 3,
          score: 27,
          area_code: 3,
          competence_code: 3.2,
        }),
      );
    });
  });
});
