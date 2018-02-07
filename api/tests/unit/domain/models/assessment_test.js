const Assessment = require('../../../../lib/domain/models/Assessment');
const { describe, it, expect } = require('../../../test-helper');

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
  });
});
