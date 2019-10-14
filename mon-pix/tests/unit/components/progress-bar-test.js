import { expect } from 'chai';
import { describe, it } from 'mocha';
import EmberObject from '@ember/object';
import { setupTest } from 'ember-mocha';
import { htmlSafe } from '@ember/string';

describe('Unit | Component | progress-bar', function() {

  setupTest();

  describe('@didReceiveAttrs', function() {

    it('should set the current step index', function() {
      // given
      const assessment = EmberObject.create({
        answers: [{ isNew: false }, { isNew: false }, { isNew: false }, { isNew: false }, { isNew: false }, { isNew: false }],
        hasCheckpoints: true,
      });
      const component = this.owner.lookup('component:progress-bar');
      component.set('assessment', assessment);
      component.didReceiveAttrs();

      // when
      const currentStepIndex = component.get('currentStepIndex');

      // then
      expect(currentStepIndex).to.deep.equal(1);
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
    it('should return the steps', function() {
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
