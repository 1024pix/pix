import {expect} from 'chai';
import {describe, it} from 'mocha';
import {setupComponentTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const challenge = Ember.Object.create({
  instruction: 'This is the instruction',
  proposals: '' +
  '- 1ere possibilite\n ' +
  '- 2eme possibilite\n ' +
  '- 3eme possibilite\n' +
  '- 4eme possibilite'
});

const answer = Ember.Object.create({
  value: '1,2',
  result: 'ko'
});

const solution = Ember.Object.create({
  value: '2,3'
});

describe('Integration | Component | comparison window', function () {

  setupComponentTest('comparison-window', {
    integration: true
  });

  describe('rendering', function () {

    it('renders', function () {

      this.set('answer', answer);
      this.set('index', '3');
      this.set('challenge', challenge);
      this.set('solution', solution);

      // when
      this.render(hbs`{{comparison-window challenge=challenge answer=answer solution=solution index=index}}`);

      expect(this.$()).to.have.lengthOf(1);
    });

    it('should render challenge result (in the header)', function () {
      this.set('answer', answer);
      this.set('index', '3');
      this.set('challenge', challenge);
      this.set('solution', solution);

      // when
      this.render(hbs`{{comparison-window challenge=challenge answer=answer solution=solution index=index}}`);

      // then
      expect(this.$('.comparison-window__header')).to.have.length(1);
    });

    it('should render challenge instruction', function () {
      // when
      this.set('answer', answer);
      this.set('index', '3');
      this.set('challenge', challenge);
      this.set('solution', solution);

      // when
      this.render(hbs`{{comparison-window challenge=challenge answer=answer solution=solution index=index}}`);
      // then
      expect(this.$('.challenge-statement__instruction')).to.have.length(1);
    });

    it('should render corrected answers when challenge', function () {
      // when
      this.set('answer', answer);
      this.set('index', '3');
      this.set('challenge', challenge);
      this.set('solution', solution);

      // when
      this.render(hbs`{{comparison-window challenge=challenge answer=answer solution=solution index=index}}`);
      // then
      expect(this.$('.comparison-window__corrected-answers')).to.have.length(1);
    });

    it('should render corrected answers when challenge type is QROC', function () {
      // given
      const challenge = Ember.Object.create({type: 'QROC'});
      this.set('challenge', challenge);
      this.set('answer', answer);
      this.set('index', '3');
      this.set('solution', solution);

      // when
      this.render(hbs`{{comparison-window challenge=challenge answer=answer solution=solution index=index}}`);
      // then
      expect(this.$('.comparison-window__corrected-answers--qroc')).to.have.length(1);
    });

    it('should render a feedback panel', function () {
      this.set('challenge', challenge);
      this.set('answer', answer);
      this.set('index', '3');
      this.set('solution', solution);
      //when
      this.render(hbs`{{comparison-window challenge=challenge answer=answer solution=solution index=index}}`);
      //then
      expect(this.$('.comparison-window__feedback-panel')).to.have.length(1);
    });
  });
});
