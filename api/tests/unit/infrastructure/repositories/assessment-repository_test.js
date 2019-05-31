const { expect, sinon } = require('../../../test-helper');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const BookshelfAssessment = require('../../../../lib/infrastructure/data/assessment');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Unit | Repository | assessmentRepository', () => {

  describe('#save', function() {

    let assessment;

    context('when assessment is valid', () => {
      beforeEach(() => {
        assessment = Assessment.fromAttributes({ id: '1', type: Assessment.types.CERTIFICATION, userId: 2, campaignParticipation: null });
        const assessmentBookshelf = new BookshelfAssessment(assessment);
        sinon.stub(BookshelfAssessment.prototype, 'save').resolves(assessmentBookshelf);
      });

      it('should save a new assessment', function() {
        // when
        const promise = assessmentRepository.save(assessment);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(BookshelfAssessment.prototype.save);
        });
      });

      it('should return the Assessment', function() {
        // when
        const promise = assessmentRepository.save(assessment);

        // then
        return promise.then((savedAssessment) => {
          expect(savedAssessment).to.be.an.instanceOf(Assessment);
          expect(savedAssessment).to.deep.equal(assessment);
        });
      });
    });

    context('when assessment is not valid', () => {
      beforeEach(() => {
        assessment = Assessment.fromAttributes({ id: '1', type: Assessment.types.CERTIFICATION, userId: undefined });
        const assessmentBookshelf = new BookshelfAssessment(assessment);
        sinon.stub(BookshelfAssessment.prototype, 'save').resolves(assessmentBookshelf);
      });

      it('should not save a new assessment', function() {
        // when
        const promise = assessmentRepository.save(assessment);

        // then
        return promise.catch(() => {
          sinon.assert.notCalled(BookshelfAssessment.prototype.save);
        });
      });

      it('should reject', function() {
        // when
        const promise = assessmentRepository.save(assessment);

        // then
        return expect(promise).to.be.rejected;
      });

    });

  });

  describe('#getByCertificationCourseId', () => {

    let fetchStub;

    beforeEach(() => {
      fetchStub = sinon.stub().resolves(new BookshelfAssessment());
      sinon.stub(BookshelfAssessment, 'where').returns({
        fetch: fetchStub,
      });
    });

    it('should correctly query Assessment', () => {
      // given
      const fakeCertificationCourseId = 10;
      const expectedParams = { courseId: fakeCertificationCourseId, type: 'CERTIFICATION' };

      // when
      const promise = assessmentRepository.getByCertificationCourseId(fakeCertificationCourseId);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(BookshelfAssessment.where);
        sinon.assert.calledWith(BookshelfAssessment.where, expectedParams);
      });
    });
  });
});
