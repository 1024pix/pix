import {expect} from 'chai';
import Ember from 'ember';
import {describe, it} from 'mocha';
import {setupComponentTest} from 'ember-mocha';
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

  function renderComponent() {
    this.render(hbs`{{result-item answer index}}`);
  }

  function addPropertyToComponent(item, value) {
    this.set(item, value);
  }

  describe('Component rendering ', function () {

    it('should exist', function () {
      // When
      addPropertyToComponent.call(this, 'answer', '');
      addPropertyToComponent.call(this, 'index', 0);

      renderComponent.call(this);
      // Then
      expect(this.$()).to.have.length(1);
    });

    it('component render an index 1 when 0 provided', function () {
      // When
      addPropertyToComponent.call(this, 'answer', '');
      addPropertyToComponent.call(this, 'index', 0);

      renderComponent.call(this);
      // Then
      const index = this.$('.result-list__index').text();
      expect(index.trim().replace('\n', '')).to.equal('1');
    });

    it('component render an instruction with no empty content', function () {
      // When
      addPropertyToComponent.call(this, 'answer', '');
      addPropertyToComponent.call(this, 'index', 0);

      renderComponent.call(this);
      // Then
      expect(this.$('.result-list__instruction')).to.have.lengthOf(1);
      expect(this.$('.result-list__instruction').text()).to.contain('\n');
    });

    it(`component render an instruction which contain ${expectedChallengeInstruction}`, function () {
      // When
      addPropertyToComponent.call(this, 'answer', answer);
      addPropertyToComponent.call(this, 'index', 0);

      // Then
      this.render(hbs`{{result-item answer index}}`);
      expect(this.$('.result-list__instruction').text().trim()).to.equal(expectedChallengeInstruction);
    });

    it('component render an button when QCM', function () {
      // When
      addPropertyToComponent.call(this, 'answer', answer);
      addPropertyToComponent.call(this, 'index', 0);

      this.render(hbs`{{result-item answer index}}`);
      // Then
      expect(this.$('.result-list__correction__button').text().trim()).to.deep.equal('RÉPONSE');
    });

    it('component render tooltip with title Réponse incorrecte', function () {
      // When
      addPropertyToComponent.call(this, 'answer', answer);
      addPropertyToComponent.call(this, 'index', 0);

      this.render(hbs`{{result-item answer index}}`);
      // Then
      expect(this.$('div[data-toggle="tooltip"]').attr('title').trim()).to.equal('Réponse incorrecte');
    });

    it('component render tooltip with svg', function () {
      // When
      addPropertyToComponent.call(this, 'answer', answer);
      addPropertyToComponent.call(this, 'index', 0);

      this.render(hbs`{{result-item answer index}}`);
      // Then
      expect(this.$('svg path').attr('d')).to.equal(expectedPath);
      expect(this.$('svg path').attr('fill')).to.equal('#ff4600');
    });
  });
});
