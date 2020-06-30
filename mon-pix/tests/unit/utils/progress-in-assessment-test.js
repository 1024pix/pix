import { expect } from 'chai';
import { describe, it } from 'mocha';
import EmberObject from '@ember/object';
import ENV from 'mon-pix/config/environment';
import progressInAssessment from 'mon-pix/utils/progress-in-assessment';

describe('Unit | Utility | progress-in-assessment', function() {

  describe('#getCurrentStepIndex', function() {
    let assessment;

    beforeEach(function() {
      ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS = 5;
      assessment = EmberObject.create({
        answers: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }],
        hasCheckpoints: true,
        hasMany(relationship) {
          return { ids: () => { return this[relationship].mapBy('id'); } };
        },
      });
    });

    it('should return the current step index modulus maxStepsNumber', async function() {
      // given
      const answerId = null;
      // when
      const currentStepIndex = progressInAssessment.getCurrentStepIndex(assessment, answerId);

      // then
      expect(currentStepIndex).to.equal(1);
    });

    it('should return the current step index for already answered challenge', async function() {
      // given
      const answerId = 3;

      // when
      const currentStepIndex = progressInAssessment.getCurrentStepIndex(assessment, answerId);

      // then
      expect(currentStepIndex).to.equal(2);
    });
  });

  describe('#getMaxStepsNumber', function() {

    it('when assessment has checkpoint, should return the number of challenges in checkpoint', async function() {
      // given
      const assessment = EmberObject.create({ hasCheckpoints: true });

      // when
      const maxStepNumber = progressInAssessment.getMaxStepsNumber(assessment);

      // then
      expect(maxStepNumber).to.equal(ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS);
    });

    it('when assessment is certification, should return the number of challenges in certification', async function() {
      // given
      const nbChallenges = 23;
      const assessment = EmberObject.create({ isCertification: true, certificationCourse : EmberObject.create({ nbChallenges }) });

      // when
      const maxStepNumber = progressInAssessment.getMaxStepsNumber(assessment);

      // then
      expect(maxStepNumber).to.equal(nbChallenges);
    });

    it('should return the number of challenge in course', async function() {
      // given
      const nbChallenges = 21;
      const assessment = EmberObject.create({ course : EmberObject.create({ nbChallenges }) });

      // when
      const maxStepNumber = progressInAssessment.getMaxStepsNumber(assessment);

      // then
      expect(maxStepNumber).to.equal(nbChallenges);
    });

  });

  describe('#getCurrentStepNumber', function() {

    let assessment;
    beforeEach(function() {
      ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS = 5;
      assessment = EmberObject.create({
        answers: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }],
        hasCheckpoints: true,
        hasMany(relationship) {
          return { ids: () => { return this[relationship].mapBy('id'); } };
        },
      });
    });

    it('should return the current step number modulus maxStepsNumber', async function() {
      // given
      const answerId = null;

      // when
      const currentStepIndex = progressInAssessment.getCurrentStepNumber(assessment, answerId);

      // then
      expect(currentStepIndex).to.equal(2);
    });

    it('should return the current step number for already answered challenge', async function() {
      // given
      const answerId = 3;

      // when
      const currentStepIndex = progressInAssessment.getCurrentStepNumber(assessment, answerId);

      // then
      expect(currentStepIndex).to.equal(3);
    });
  });
});
