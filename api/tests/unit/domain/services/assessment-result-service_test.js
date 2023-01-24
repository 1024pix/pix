const { expect, sinon } = require('../../../test-helper');

const service = require('../../../../lib/domain/services/assessment-result-service');

const assessmentResultRepository = require('../../../../lib/infrastructure/repositories/assessment-result-repository');
const competenceMarkRepository = require('../../../../lib/infrastructure/repositories/competence-mark-repository');
const certificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');

const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const CompetenceMark = require('../../../../lib/domain/models/CompetenceMark');

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

    beforeEach(function () {
      sinon.stub(assessmentResultRepository, 'save').resolves({ id: 1 });
      sinon.stub(competenceMarkRepository, 'save').resolves();
      sinon.stub(certificationCourseRepository, 'saveLastAssessmentResultId').resolves();
    });

    it('should save the assessment results', async function () {
      // when
      await service.save({ certificationCourseId: 99, assessmentResult, competenceMarks });

      // then
      expect(assessmentResultRepository.save).to.have.been.calledOnce;
      expect(assessmentResultRepository.save).to.have.been.calledWithMatch(assessmentResult);
      expect(certificationCourseRepository.saveLastAssessmentResultId).to.have.been.calledWith({
        certificationCourseId: 99,
        lastAssessmentResultId: 1,
      });
    });

    it('should save all competenceMarks', async function () {
      // when
      await service.save({ certificationCourseId: 99, assessmentResult, competenceMarks });

      // then
      expect(competenceMarkRepository.save).to.have.been.calledTwice;
      expect(competenceMarkRepository.save).to.have.been.calledWithMatch(
        new CompetenceMark({
          assessmentResultId: 1,
          level: 2,
          score: 18,
          area_code: 2,
          competence_code: 2.1,
        })
      );
      expect(competenceMarkRepository.save).to.have.been.calledWithMatch(
        new CompetenceMark({
          assessmentResultId: 1,
          level: 3,
          score: 27,
          area_code: 3,
          competence_code: 3.2,
        })
      );
    });
  });
});
