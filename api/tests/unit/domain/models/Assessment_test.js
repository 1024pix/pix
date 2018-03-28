const Assessment = require('../../../../lib/domain/models/Assessment');
const { ObjectValidationError } = require('../../../../lib/domain/errors');
const { expect } = require('../../../test-helper');

describe('Unit | Domain | Models | Assessment', () => {

  describe('#constructor', () => {
    it('should have a list of marks by default', () => {
      // when
      const assessment = new Assessment({});

      // then
      expect(assessment).to.have.property('marks').and.to.be.an('array');
    });
  });

  describe('#isCompleted', () => {

    it('should return true when pix score and estimated level are not null', () => {
      // given
      const assessment = new Assessment({ pixScore: 100, estimatedLevel: 3 });

      // when
      const isCompleted = assessment.isCompleted();

      // then
      expect(isCompleted).to.be.true;
    });

    it('should return false when pix score is null', () => {
      // given
      const assessment = new Assessment({ pixScore: null, estimatedLevel: 3 });

      // when
      const isCompleted = assessment.isCompleted();

      // then
      expect(isCompleted).to.be.false;
    });

    it('should return false when estimated level is null', () => {
      // given
      const assessment = new Assessment({ pixScore: 100, estimatedLevel: null });

      // when
      const isCompleted = assessment.isCompleted();

      // then
      expect(isCompleted).to.be.false;
    });

    it('should return true when estimated level is 0', () => {
      // given
      const assessment = new Assessment({ pixScore: 7, estimatedLevel: 0 });

      // when
      const isCompleted = assessment.isCompleted();

      // then
      expect(isCompleted).to.be.true;
    });

    it('should return true when pixScore is 0', () => {
      // given
      const assessment = new Assessment({ pixScore: 0, estimatedLevel: 1 });

      // when
      const isCompleted = assessment.isCompleted();

      // then
      expect(isCompleted).to.be.true;
    });

  });

  describe('#validate', () => {

    let assessment;
    beforeEach(() => {
      assessment = new Assessment({ id: 1, courseId: 'rec123', userId: 3, type: 'DEMO' });
    });

    it('should return resolved promise when object is valid', () => {
      // when
      const promise = assessment.validate();

      // then
      return expect(promise).to.be.fulfilled;
    });

    context('when assessment is a Placement and has no userId', () => {
      it('should return rejected promise', () => {
        // given
        assessment.userId = null;
        assessment.type = 'PLACEMENT';

        // when
        const promise = assessment.validate();

        // then
        return expect(promise).to.be.rejected;
      });
    });

    context('when assessment is a Placement and has an userId', () => {
      it('should return resolves promise', () => {
        // given
        assessment.type = 'PLACEMENT';

        // when
        const promise = assessment.validate();

        // then
        return expect(promise).to.be.fulfilled;
      });
    });

    context('when assessment is a Certification and has no userId', () => {
      it('should return rejected promise', () => {
        // given
        assessment.userId = null;
        assessment.type = 'CERTIFICATION';

        // when
        const promise = assessment.validate();

        // then
        return expect(promise).to.be.rejectedWith(ObjectValidationError, 'Assessment CERTIFICATION needs an User Id');
      });

    });

    context('when assessment is a Certification and has an userId', () => {
      it('should return resolves promise', () => {
        // given
        assessment.type = 'CERTIFICATION';

        // when
        const promise = assessment.validate();

        // then
        return expect(promise).to.be.fulfilled;
      });
    });

  });
});
