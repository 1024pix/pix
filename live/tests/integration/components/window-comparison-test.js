import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

describe('int938 Integration | Component | WindowComparison', function () {

  setupComponentTest('comparison-window', {
    integration: true
  });

  /* Rendering
  ----------------------------------------------------- */

  describe('Rendering', function () {

    let answer;
    let challenge;
    let solution;

    beforeEach(function () {

      challenge = Ember.Object.create({
        instruction: 'This is the instruction',
        proposals: '' +
                    '- 1ere possibilite\n ' +
                    '- 2eme possibilite\n ' +
                    '- 3eme possibilite\n' +
                    '- 4eme possibilite'
      });

      answer = Ember.Object.create({
        value: '1,2',
        result: 'ko'
      });

      solution = Ember.Object.create({
        value: '2,3'
      });

    });

    // Inspired from:
    // - Ember-mocha: https://github.com/emberjs/ember-mocha#setup-component-tests
    // - Ember: https://guides.emberjs.com/v2.10.0/testing/testing-components
    // -        https://guides.emberjs.com/v2.10.0/tutorial/autocomplete-component/
    it('should render', function () {
      // given
      this.set('answer', answer);
      this.set('index', '3');
      this.set('challenge', challenge);
      this.set('solution', solution);

      // when
      this.render(hbs`{{comparison-window challenge=challenge answer=answer solution=solution index=index}}`);

      // then
      expect(this.$()).to.have.length(1);
      expect(this.$('.comparison-window--body .challenge-statement__instruction').text()).to.equal('This is the instruction');
      expect(this.$('.assessment-results-result-index').text().trim()).to.equal('3');
    });
  });
});
