import { expect } from 'chai';
import { describe, it } from 'mocha';
import EmberObject from '@ember/object';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | progress-bar', function() {

  setupTest('component:progress-bar', {});

  describe('@progression', function() {

    it('should return a progression object', function() {
      // given
      const assessment = EmberObject.create({
        type: 'DEMO',
        answers: [{}, {}, {}],
        course: {
          nbChallenges: 10
        }
      });
      const component = this.subject({ assessment });
      component.setProgression();

      // when
      const progression = component.get('progression');

      // then
      expect(progression.get('assessmentType')).to.equal('DEMO');
      expect(progression.get('nbAnswers')).to.equal(3);
      expect(progression.get('nbChallenges')).to.equal(10);
    });
  });

  describe('@barStyle', function() {

    it('should return the good CSS style value according to progression', function() {
      // given
      const assessment = EmberObject.create({
        type: 'DEMO',
        answers: [{}, {}, {}, {}, {}],
        course: {
          nbChallenges: 10
        }
      });
      const component = this.subject({ assessment });
      component.setProgression();

      // when
      const barStyle = component.get('barStyle');

      // then
      expect(barStyle.toString()).to.equal('width: 60%');
    });
  });

});
