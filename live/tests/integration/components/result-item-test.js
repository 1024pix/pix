import { expect } from 'chai';
import Ember from 'ember';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | result item', function() {

  setupComponentTest('result-item', {
    integration: true
  });

  describe('Component rendering ', function() {

    const providedChallengeInstruction = 'Un QCM propose plusieurs choix, l\'utilisateur peut en choisir [plusieurs](http://link.plusieurs.url)';

    const emberChallengeObject = Ember.Object.create({
      type: 'QCM',
      instruction: providedChallengeInstruction,
      proposals: '- soit possibilite A, et/ou' +
      '\n - soit possibilite B, et/ou' +
      '\n - soit possibilite C, et/ou' +
      '\n - soit possibilite D'
    });

    const answer = Ember.Object.create({
      value: '2,4',
      result: 'ko',
      id: 1,
      challenge: emberChallengeObject,
      assessment: {
        id: 4
      }
    });

    beforeEach(function() {
      this.set('index', 0);
    });

    it('should exist', function() {
      // given
      this.set('answer', '');

      // when
      this.render(hbs`{{result-item answer=answer index=index}}`);

      // then
      expect(this.$()).to.have.length(1);
    });

    it('should render an index 1 when 0 provided', function() {
      // given
      this.set('answer', '');

      // when
      this.render(hbs`{{result-item answer=answer index=index}}`);

      // then
      const index = this.$('.result-item__index').text();
      expect(index.trim().replace('\n', '')).to.equal('1');
    });

    it('should render an instruction with no empty content', function() {
      // given
      this.set('answer', '');

      // when
      this.render(hbs`{{result-item answer=answer index=index}}`);

      // then
      expect(this.$('.result-item__instruction')).to.have.lengthOf(1);
      expect(this.$('.result-item__instruction').text()).to.contain('\n');
    });

    it('should render the challenge instruction', function() {
      // given
      this.set('answer', answer);

      // when
      this.render(hbs`{{result-item answer=answer index=index}}`);

      // then
      const expectedChallengeInstruction = 'Un QCM propose plusieurs choix, l\'utilisateur peut en choisir plusieur...';
      expect(this.$('.result-item__instruction').text().trim()).to.equal(expectedChallengeInstruction);
    });

    it('should render an button when QCM', function() {
      // given
      this.set('answer', answer);

      this.render(hbs`{{result-item answer=answer index=index}}`);
      // Then
      expect(this.$('.result-item__correction__button').text().trim()).to.deep.equal('RÉPONSE');
    });

    it('should render tooltip with title Réponse incorrecte', function() {
      // given
      this.set('answer', answer);

      // when
      this.render(hbs`{{result-item answer=answer index=index}}`);

      // then
      expect(this.$('div[data-toggle="tooltip"]').attr('title').trim()).to.equal('Réponse incorrecte');
    });

    it('should render tooltip with an image', function() {
      // given
      this.set('answer', answer);

      // when
      this.render(hbs`{{result-item answer=answer index=index}}`);

      // Then
      expect(this.$('result-item__icon-img'));
    });

    [
      { status: 'ok' },
      { status: 'ko' },
      { status: 'aband' },
      { status: 'partially' },
      { status: 'timedout' },
      { status: 'default' },
    ].forEach(function(data) {

      it(`should display the good result icon when answer's result is "${data.status}"`, function() {
        // given
        answer.set('result', data.status);
        this.set('answer', answer);

        // when
        this.render(hbs`{{result-item answer=answer index=index}}`);

        // then
        const $icon = this.$('.result-item__icon-img');
        expect(this.$(`.result-item__icon-img--${data.status}`)).to.have.lengthOf(1);
        expect($icon.attr('src')).to.equal(`/images/answer-validation/icon-${data.status}.svg`);
      });
    });

  });
});
