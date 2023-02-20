import { expect, sinon } from '../../test-helper';
import { ScriptQueryBuilder, AssessmentEraser } from '../../../scripts/delete-assessment';

describe('Delete Assessment Script', function () {
  describe('ScriptQueryBuilder', function () {
    let subject;

    beforeEach(function () {
      subject = new ScriptQueryBuilder();
    });

    describe('#delete_assessment_from_id', function () {
      it('should return the correct query', function () {
        // given
        const assessmentId = 213;

        // when
        const query = subject.delete_assessment_from_id(assessmentId);

        // then
        expect(query).to.equal(`DELETE FROM assessments WHERE id = '${assessmentId}'`);
      });
    });

    describe('#delete_assessment_results_from_assessment_ids', function () {
      it('should return the correct query', function () {
        // given
        const assessment_id = 123;

        // when
        const query = subject.delete_assessment_results_from_assessment_ids(assessment_id);

        // then
        expect(query).to.equal('DELETE FROM "assessment-results" WHERE "assessmentId" = 123');
      });
    });

    describe('#delete_competence_marks_from_assessment_ids', function () {
      it('should return the correct query', function () {
        // given
        const assessment_id = 123;

        // when
        const query = subject.delete_competence_marks_from_assessment_ids(assessment_id);

        // then
        expect(query).to.equal(
          'DELETE FROM "competence-marks" WHERE "assessmentResultId" IN ( SELECT id from "assessment-results" WHERE "assessmentId" = 123 )'
        );
      });
    });

    describe('#delete_feedbacks_from_assessment_ids', function () {
      it('should return the correct query', function () {
        // given
        const assessment_id = 123;

        // when
        const query = subject.delete_feedbacks_from_assessment_ids(assessment_id);

        // then
        expect(query).to.equal('DELETE FROM feedbacks WHERE "assessmentId" = 123');
      });
    });

    describe('#delete_answers_from_assessment_ids', function () {
      it('should return the correct query', function () {
        // given
        const assessment_id = 123;

        // when
        const query = subject.delete_answers_from_assessment_ids(assessment_id);

        // then
        expect(query).to.equal('DELETE FROM answers WHERE "assessmentId" = 123');
      });
    });
  });

  describe('AssessmentEraser', function () {
    let subject;
    let queryBuilder;
    let queryBuilderMock;
    let clientStub;
    const assessment_id = 1345;

    beforeEach(function () {
      queryBuilder = new ScriptQueryBuilder();
      clientStub = { query_and_log: sinon.stub() };

      queryBuilderMock = sinon.mock(queryBuilder);
      subject = new AssessmentEraser(clientStub, queryBuilder, assessment_id);
    });

    describe('#delete_dependent_data_from_assessment_id', function () {
      it('should reject an error when no assessment given', function () {
        // given
        const userEraserWithoutAssessment = new AssessmentEraser(clientStub, queryBuilder, null);

        // when
        const promise = userEraserWithoutAssessment.delete_dependent_data_from_assessment_id();

        // then
        return expect(promise).to.be.rejectedWith(Error, 'Missing argument : an assessment id should be provided');
      });

      it('should delete feedbacks, answers, competence-marks and assessment-results', function () {
        // when
        const promise = subject.delete_dependent_data_from_assessment_id();

        // then
        return promise.then(() => {
          sinon.assert.callCount(clientStub.query_and_log, 4);

          expect(clientStub.query_and_log).to.have.been.calledWith('DELETE FROM feedbacks WHERE "assessmentId" = 1345');
          expect(clientStub.query_and_log).to.have.been.calledWith('DELETE FROM answers WHERE "assessmentId" = 1345');
          expect(clientStub.query_and_log).to.have.been.calledWith(
            'DELETE FROM "competence-marks" WHERE "assessmentResultId" IN ( SELECT id from "assessment-results" WHERE "assessmentId" = 1345 )'
          );
          expect(clientStub.query_and_log).to.have.been.calledWith(
            'DELETE FROM "assessment-results" WHERE "assessmentId" = 1345'
          );
        });
      });
    });

    describe('#delete_assessment_from_id', function () {
      it('should return the correct query', function () {
        // given
        queryBuilderMock.expects('delete_assessment_from_id').once().withArgs(assessment_id);

        // when
        const promise = subject.delete_assessment_from_id();

        // then
        return promise.then(() => {
          queryBuilderMock.verify();
          sinon.assert.calledOnce(clientStub.query_and_log);
        });
      });
    });
  });
});
