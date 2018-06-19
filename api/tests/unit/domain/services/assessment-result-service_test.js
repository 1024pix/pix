const { expect, sinon } = require('../../../test-helper');

const service = require('../../../../lib/domain/services/assessment-result-service');

const assessmentResultRepository = require('../../../../lib/infrastructure/repositories/assessment-result-repository');
const competenceMarkRepository = require('../../../../lib/infrastructure/repositories/competence-mark-repository');

const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const CompetenceMark = require('../../../../lib/domain/models/CompetenceMark');

const { ObjectValidationError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Services | assessment-results', () => {

  describe('#save', () => {

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

    const sandbox = sinon.sandbox.create();

    beforeEach(() => {
      sandbox.stub(assessmentResultRepository, 'save').resolves({ id: 1 });
      sandbox.stub(competenceMarkRepository, 'save').resolves();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should save the assessment results', () => {
      // when
      const promise = service.save(assessmentResult, competenceMarks);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(assessmentResultRepository.save);
        sinon.assert.calledWith(assessmentResultRepository.save, assessmentResult);
      });
    });

    it('should save all competenceMarks', () => {
      // when
      const promise = service.save(assessmentResult, competenceMarks);

      // then
      return promise.then(() => {
        sinon.assert.calledTwice(competenceMarkRepository.save);
        sinon.assert.calledWith(competenceMarkRepository.save, new CompetenceMark({
          assessmentResultId: 1,
          level: 2,
          score: 18,
          area_code: 2,
          competence_code: 2.1,
        }));
        sinon.assert.calledWith(competenceMarkRepository.save, new CompetenceMark({
          assessmentResultId: 1,
          level: 3,
          score: 27,
          area_code: 3,
          competence_code: 3.2,
        }));
      });
    });

    context('when one competence is not valided', () => {

      const competenceMarksWithOneInvalid = [
        new CompetenceMark({
          level: 20,
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

      it('should not saved assessmentResult and competenceMarks', () => {
        // when
        const promise = service.save(assessmentResult, competenceMarksWithOneInvalid);

        // then
        return promise.catch(() => {
          expect(competenceMarkRepository.save).to.have.been.not.called;
          expect(assessmentResultRepository.save).to.have.been.not.called;
        });
      });

      it('should return a ObjectValidationError', () => {
        // when
        const promise = service.save(assessmentResult, competenceMarksWithOneInvalid);

        // then
        return promise.catch((error) => {
          expect(error).to.be.instanceOf(ObjectValidationError);
        });
      });
    });
  });
});
