const { expect, sinon } = require('../../../test-helper');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const BookshelfAssessment = require('../../../../lib/infrastructure/data/assessment');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Unit | Repository | assessmentRepository', () => {

  describe('#getByAssessmentIdAndUserId', () => {

    it('should be a function', () => {
      expect(assessmentRepository.getByAssessmentIdAndUserId).to.be.a('function');
    });

    describe('test collaboration', () => {
      let fetchStub;
      beforeEach(() => {
        fetchStub = sinon.stub().resolves(new BookshelfAssessment());
        sinon.stub(BookshelfAssessment, 'query').returns({
          fetch: fetchStub,
        });
      });

      it('should correctly query Assessment', () => {
        // given
        const fakeUserId = 3;
        const fakeAssessmentId = 2;
        const expectedParams = {
          where: { id: fakeAssessmentId },
          andWhere: { userId: fakeUserId },
        };

        // when
        const promise = assessmentRepository.getByAssessmentIdAndUserId(fakeAssessmentId, fakeUserId);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(BookshelfAssessment.query);
          sinon.assert.calledWith(BookshelfAssessment.query, expectedParams);
          sinon.assert.calledWith(fetchStub, { require: true });
        });
      });
    });

  });

  describe('#save', function() {

    let assessment;

    context('when assessment is valid', () => {
      beforeEach(() => {
        assessment = Assessment.fromAttributes({ id: '1', type: Assessment.types.CERTIFICATION, userId: 2, campaignParticipation: null, isImproving: true });
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
});
