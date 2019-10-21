import { expect } from 'chai';
import { describe, it } from 'mocha';
import EmberObject from '@ember/object';
import { setupTest } from 'ember-mocha';
import { htmlSafe } from '@ember/string';

describe('Unit | Component | progress-bar', function() {

  setupTest();

  describe('@currentStepIndex', function() {
    let component, assessment;

    beforeEach(function() {
      assessment = EmberObject.create({
        answers: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }],
        hasMany(relationship) {
          return { ids: () => { return this[relationship].mapBy('id'); } };
        },
      });
      component = this.owner.lookup('component:progress-bar');
      component.set('assessment', assessment);
      component.set('maxStepsNumber', 5);
    });

    it('should return the current step index modulus maxStepsNumber', function() {
      // when
      const currentStepIndex = component.get('currentStepIndex');

      // then
      expect(currentStepIndex).to.deep.equal(1);
    });

    it('should return the current step index for already answered challenge', function() {
      // given
      component.set('answerId', 3);

      // when
      const currentStepIndex = component.get('currentStepIndex');

      // then
      expect(currentStepIndex).to.deep.equal(2);
    });

    it('should recompute when challenge changes but not when answer is persisted', function() {
      // given
      const newAnswer = EmberObject.create({ id: null });
      assessment.get('answers').push(newAnswer);

      // when
      let currentStepIndex = component.get('currentStepIndex');

      // then
      expect(currentStepIndex).to.deep.equal(1);

      //when
      newAnswer.set('id', 7);
      newAnswer.set('isNew', false);
      currentStepIndex = component.get('currentStepIndex');

      // then
      expect(currentStepIndex).to.deep.equal(1);

      //when
      component.set('challengeId', 'newId');
      currentStepIndex = component.get('currentStepIndex');

      //then
      expect(currentStepIndex).to.deep.equal(2);
    });
  });

  describe('@maxStepsNumber', function() {

    it('should return 5 if assessment has checkpoint', function() {
      // given
      const assessment = EmberObject.create({
        hasCheckpoints: true,
      });
      const component = this.owner.lookup('component:progress-bar');
      component.set('assessment', assessment);

      // when
      const maxStepsNumber = component.get('maxStepsNumber');

      // then
      expect(maxStepsNumber).to.deep.equal(5);
    });

    it('should return challenges number otherwise', function() {
      // given
      const assessment = EmberObject.create({
        hasCheckpoints: false,
        course: { nbChallenges: 7 },
      });
      const component = this.owner.lookup('component:progress-bar');
      component.set('assessment', assessment);

      // when
      const maxStepsNumber = component.get('maxStepsNumber');

      // then
      expect(maxStepsNumber).to.deep.equal(7);
    });
  });

  describe('@currentStepNumber', function() {

    it('should return the current step number', function() {
      // given
      const component = this.owner.lookup('component:progress-bar');
      component.set('currentStepIndex', 2);

      // when
      const currentStepNumber = component.get('currentStepNumber');

      // then
      expect(currentStepNumber).to.deep.equal(3);
    });
  });

  describe('@steps', function() {

    it('should return the steps specifics', function() {
      // given
      const component = this.owner.lookup('component:progress-bar');
      component.set('currentStepIndex', 2);
      component.set('maxStepsNumber', 4);

      // when
      const steps = component.get('steps');

      // then
      expect(steps).to.deep.equal([
        { stepnum: 1, status: 'active', background: htmlSafe('background: #507fff;') },
        { stepnum: 2, status: 'active', background: htmlSafe('background: #6874ff;') },
        { stepnum: 3, status: 'active', background: htmlSafe('background: #8069ff;') },
        { stepnum: 4, status: '', background: htmlSafe('background: #985fff;') },
      ]);
    });
  });

  describe('@progressionWidth', function() {

    it('should return the progressionWidth', function() {
      // given
      const component = this.owner.lookup('component:progress-bar');
      component.set('currentStepIndex', 2);
      component.set('maxStepsNumber', 5);

      // when
      const progressionWidth = component.get('progressionWidth');

      // then
      expect(progressionWidth).to.deep.equal(htmlSafe('width: 50.85%;'));
    });

    it('should return the initial progressionWidth', function() {
      // given
      const component = this.owner.lookup('component:progress-bar');
      component.set('currentStepIndex', 0);
      component.set('maxStepsNumber', 5);

      // when
      const progressionWidth = component.get('progressionWidth');

      // then
      expect(progressionWidth).to.deep.equal(htmlSafe('width: 16px;'));
    });
  });
});
