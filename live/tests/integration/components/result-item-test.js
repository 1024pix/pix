import { expect } from 'chai';
import Ember from 'ember';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

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

const expectedPath = 'M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z';

const expectedChallengeInstruction = 'Un QCM propose plusieurs choix, l\'utilisateur peut en choisir plusieur...';

describe('Integration | Component | result item', function () {

  setupComponentTest('result-item', {
    integration: true
  });

  describe('Component rendering ', function () {

    beforeEach(function () {
      this.set('index', 0);
    });

    it('should exist', function () {
      // given
      this.set('answer', '');

      // when
      this.render(hbs`{{result-item answer=answer index=index}}`);

      // then
      expect(this.$()).to.have.length(1);
    });

    it('component render an index 1 when 0 provided', function () {
      // given
      this.set('answer', '');

      // when
      this.render(hbs`{{result-item answer=answer index=index}}`);

      // then
      const index = this.$('.result-item__index').text();
      expect(index.trim().replace('\n', '')).to.equal('1');
    });

    it('component render an instruction with no empty content', function () {
      // given
      this.set('answer', '');

      // when
      this.render(hbs`{{result-item answer=answer index=index}}`);

      // then
      expect(this.$('.result-item__instruction')).to.have.lengthOf(1);
      expect(this.$('.result-item__instruction').text()).to.contain('\n');
    });

    it(`component render an instruction which contain ${expectedChallengeInstruction}`, function () {
      // given
      this.set('answer', answer);

      // when
      this.render(hbs`{{result-item answer=answer index=index}}`);

      // then
      expect(this.$('.result-item__instruction').text().trim()).to.equal(expectedChallengeInstruction);
    });

    it('component render an button when QCM', function () {
      // given
      this.set('answer', answer);

      this.render(hbs`{{result-item answer=answer index=index}}`);
      // Then
      expect(this.$('.result-item__correction__button').text().trim()).to.deep.equal('RÉPONSE');
    });

    it('component render tooltip with title Réponse incorrecte', function () {
      // given
      this.set('answer', answer);

      // when
      this.render(hbs`{{result-item answer=answer index=index}}`);

      // then
      expect(this.$('div[data-toggle="tooltip"]').attr('title').trim()).to.equal('Réponse incorrecte');
    });

    it('component render tooltip with svg', function () {
      // given
      this.set('answer', answer);

      // when
      this.render(hbs`{{result-item answer=answer index=index}}`);

      // Then
      expect(this.$('svg path').attr('d')).to.equal(expectedPath);
      expect(this.$('svg path').attr('fill')).to.equal('#ff4600');
    });
  });
});
