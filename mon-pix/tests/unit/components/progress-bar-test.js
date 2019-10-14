import { expect } from 'chai';
import { describe, it } from 'mocha';
import EmberObject from '@ember/object';
import { setupTest } from 'ember-mocha';
import { htmlSafe } from '@ember/string';

describe('Unit | Component | progress-bar', function() {

  setupTest();

  describe('@didReceiveAttrs', function() {

    it('should set steps', function() {
      // given
      const assessment = EmberObject.create({
        answers: [{ isNew: false }, { isNew: false }],
        hasCheckpoints: false,
        course: {
          nbChallenges: 4
        }
      });
      const component = this.owner.lookup('component:progress-bar');
      component.set('assessment', assessment);
      component.didReceiveAttrs();

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

    it('should set the progressionWidth', function() {
      // given
      const assessment = EmberObject.create({
        answers: [{ isNew: false }, { isNew: false }],
        hasCheckpoints: false,
        course: {
          nbChallenges: 5
        }
      });
      const component = this.owner.lookup('component:progress-bar');
      component.set('assessment', assessment);
      component.didReceiveAttrs();

      // when
      const progressionWidth = component.get('progressionWidth');

      // then
      expect(progressionWidth).to.deep.equal(htmlSafe('width: 50.85%;'));
    });

    it('should set progressionWidth inferior to 100%', function() {
      // given
      const assessment = EmberObject.create({
        answers: [{ isNew: false }, { isNew: false }, { isNew: false }, { isNew: false }, { isNew: false }, { isNew: false }, { isNew: false }],
        hasCheckpoints: false,
        course: {
          nbChallenges: 5
        }
      });
      const component = this.owner.lookup('component:progress-bar');
      component.set('assessment', assessment);
      component.didReceiveAttrs();

      // when
      const progressionWidth = component.get('progressionWidth');

      // then
      expect(progressionWidth).to.deep.equal(htmlSafe('width: 50.85%;'));
    });

    it('should set the initial progressionWidth', function() {
      // given
      const assessment = EmberObject.create({
        answers: [],
        hasCheckpoints: false,
        course: {
          nbChallenges: 5
        }
      });
      const component = this.owner.lookup('component:progress-bar');
      component.set('assessment', assessment);
      component.didReceiveAttrs();

      // when
      const progressionWidth = component.get('progressionWidth');

      // then
      expect(progressionWidth).to.deep.equal(htmlSafe('width: 16px;'));
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

  describe('@currentStepIndex', function() {

    it('should return the answers count modulus maxStepsNumber', function() {
      // given
      const assessment = EmberObject.create({
        answers: [{ isNew: false }, { isNew: false }, { isNew: false }, { isNew: false }, { isNew: false }, { isNew: false }],
        hasCheckpoints: true,
      });
      const component = this.owner.lookup('component:progress-bar');
      component.set('assessment', assessment);

      // when
      const currentStepIndex = component.get('currentStepIndex');

      // then
      expect(currentStepIndex).to.deep.equal(1);
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
});
