import { expect } from 'chai';
import { run } from '@ember/runloop';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import times from 'lodash/times';

describe('Unit | Model | Assessment', function () {
  setupTest();

  let store;

  beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  describe('@answersSinceLastCheckpoints', function () {
    function newAnswers(store, nbAnswers) {
      return run(() => {
        return times(nbAnswers, () => store.createRecord('answer'));
      });
    }

    it('should return an empty array when no answers has been given', function () {
      // given
      const assessment = store.createRecord('assessment');
      assessment.answers = [];

      // when
      const answersSinceLastCheckpoints = assessment.answersSinceLastCheckpoints;

      // then
      expect(answersSinceLastCheckpoints).to.deep.equal([]);
    });

    it('should return the one answer when only one answer has been given', function () {
      // given
      const answer = run(() => store.createRecord('answer'));
      const assessment = store.createRecord('assessment');
      const answers = [answer];
      run(() => (assessment.answers = answers));

      // when
      const answersSinceLastCheckpoints = assessment.answersSinceLastCheckpoints;

      // then
      expect(answersSinceLastCheckpoints).to.deep.equal(answers);
    });

    it('should return the last 2 answers when there is 7 answers', function () {
      // given
      const answers = newAnswers(store, 7);
      const [answer6, answer7] = answers.slice(5);
      const assessment = store.createRecord('assessment');
      run(() => (assessment.answers = answers));

      // when
      const answersSinceLastCheckpoints = assessment.answersSinceLastCheckpoints;

      // then
      expect(answersSinceLastCheckpoints).to.deep.equal([answer6, answer7]);
    });

    it('should return the last 5 answers when there is 10 answers', function () {
      // given
      const answers = newAnswers(store, 10);
      const [answer6, answer7, answer8, answer9, answer10] = answers.slice(5);
      const assessment = store.createRecord('assessment');
      run(() => (assessment.answers = answers));

      // when
      const answersSinceLastCheckpoints = assessment.answersSinceLastCheckpoints;

      // then
      expect(answersSinceLastCheckpoints).to.deep.equal([answer6, answer7, answer8, answer9, answer10]);
    });

    it('should return the last 1 answer when there is 11 answers', function () {
      // given
      const answers = newAnswers(store, 11);
      const answer11 = answers[10];
      const assessment = store.createRecord('assessment');
      run(() => (assessment.answers = answers));

      // when
      const answersSinceLastCheckpoints = assessment.answersSinceLastCheckpoints;

      // then
      expect(answersSinceLastCheckpoints).to.deep.equal([answer11]);
    });
  });

  describe('#isForCampaign', function () {
    it('should return true when the assessment type is a campaign assessment', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'CAMPAIGN';

      //then
      expect(model.isForCampaign).to.be.true;
    });
    it('should return false when the assessment type is not a campaign assessment', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = '_';

      //then
      expect(model.isForCampaign).to.be.false;
    });
  });

  describe('#isCertification', function () {
    it('should return true when the assessment type is a certification', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'CERTIFICATION';

      //then
      expect(model.isCertification).to.be.true;
    });
    it('should return false when the assessment type is not a certification', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = '_';

      //then
      expect(model.isCertification).to.be.false;
    });
  });

  describe('#isDemo', function () {
    it('should return true when the assessment type is demo', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'DEMO';

      //then
      expect(model.isDemo).to.be.true;
    });
    it('should return false when the assessment type is not demo', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = '_';

      //then
      expect(model.isDemo).to.be.false;
    });
  });

  describe('#isPreview', function () {
    it('should return true when the assessment type is placement', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'PREVIEW';

      //then
      expect(model.isPreview).to.be.true;
    });
    it('should return false when the assessment type is not placement', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = '_';

      //then
      expect(model.isPreview).to.be.false;
    });
  });

  describe('#isFlash', function () {
    it('should return true when the assessment method is FLASH', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.method = 'FLASH';

      //then
      expect(model.isFlash).to.be.true;
    });

    it('should return false when the assessment method is not FLASH', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.method = '_';

      //then
      expect(model.isFlash).to.be.false;
    });
  });

  describe('#hasCheckpoints', function () {
    it('should return false when the assessment type is CERTIFICATION', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'CERTIFICATION';

      //then
      expect(model.hasCheckpoints).to.be.false;
    });

    it('should return false when the assessment type is PREVIEW', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'PREVIEW';

      //then
      expect(model.hasCheckpoints).to.be.false;
    });

    it('should return true when the assessment type is COMPETENCE_EVALUATION', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'COMPETENCE_EVALUATION';

      //then
      expect(model.hasCheckpoints).to.be.true;
    });

    it('should return true when the assessment type is CAMPAIGN and method is not FLASH', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'CAMPAIGN';

      //then
      expect(model.hasCheckpoints).to.be.true;
    });

    it('should return false when the assessment type is CAMPAIGN and method is FLASH', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'CAMPAIGN';
      model.method = 'FLASH';

      //then
      expect(model.hasCheckpoints).to.be.false;
    });
  });

  describe('#showLevelup', function () {
    it('should return false when the assessment type is CERTIFICATION', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'CERTIFICATION';

      //then
      expect(model.showLevelup).to.be.false;
    });

    it('should return false when the assessment type is PREVIEW', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'PREVIEW';

      //then
      expect(model.showLevelup).to.be.false;
    });

    it('should return true when the assessment type is COMPETENCE_EVALUATION', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'COMPETENCE_EVALUATION';

      //then
      expect(model.showLevelup).to.be.true;
    });

    it('should return true when the assessment type is CAMPAIGN and method is not FLASH', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'CAMPAIGN';

      //then
      expect(model.showLevelup).to.be.true;
    });

    it('should return false when the assessment type is CAMPAIGN and method is FLASH', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'CAMPAIGN';
      model.method = 'FLASH';

      //then
      expect(model.showLevelup).to.be.false;
    });
  });

  describe('#showProgressBar', function () {
    it('should return false when the assessment type is CERTIFICATION', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'CERTIFICATION';

      //then
      expect(model.showProgressBar).to.be.false;
    });

    it('should return false when the assessment type is PREVIEW', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'PREVIEW';

      //then
      expect(model.showProgressBar).to.be.false;
    });

    it('should return true when the assessment type is COMPETENCE_EVALUATION', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'COMPETENCE_EVALUATION';

      //then
      expect(model.showProgressBar).to.be.true;
    });

    it('should return true when the assessment type is CAMPAIGN and method is not FLASH', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'CAMPAIGN';

      //then
      expect(model.showProgressBar).to.be.true;
    });

    it('should return false when the assessment type is CAMPAIGN and method is FLASH', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'CAMPAIGN';
      model.method = 'FLASH';

      //then
      expect(model.showProgressBar).to.be.false;
    });

    it('should return true when the assessment type is DEMO', function () {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'DEMO';

      //then
      expect(model.showProgressBar).to.be.true;
    });
  });
});
