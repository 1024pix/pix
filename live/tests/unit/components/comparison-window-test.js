import Ember from 'ember';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';

function _assertResultItemTitle(resultItem, expected) {
  expect(resultItem.title).to.equal(expected);
}

function _assertResultItemTooltip(resultItem, expected) {
  expect(resultItem.titleTooltip).to.equal(expected);
}

describe('Unit | Component | comparison window', function () {

  setupTest('component:comparison-window', {});

  let component;
  let answer;
  let resultItem;

  beforeEach(function () {
    component = this.subject();
    answer = Ember.Object.create();
    component.set('answer', answer);
  });

  describe('#resultItem', function () {

    it('should return adapted title and tooltip when validation is unavailable (i.e. empty)', function () {
      // given
      answer.set('result', '');

      // when
      resultItem = component.get('resultItem');

      // then
      _assertResultItemTitle(resultItem, '');
      _assertResultItemTooltip(resultItem, 'Correction automatique en cours de développement ;)');
    });

    it('should return adapted title and tooltip when validation status is unknown', function () {
      // given
      answer.set('result', 'xxx');

      // when
      resultItem = component.get('resultItem');

      // then
      _assertResultItemTitle(resultItem, '');
      _assertResultItemTooltip(resultItem, 'Correction automatique en cours de développement ;)');
    });

    it('should return adapted title and tooltip when validation status is undefined', function () {
      // given
      let undefined;
      answer.set('result', undefined);

      // when
      resultItem = component.get('resultItem');

      // then
      _assertResultItemTitle(resultItem, '');
      _assertResultItemTooltip(resultItem, 'Correction automatique en cours de développement ;)');
    });

    it('should return adapted title and tooltip when result is "ok"', function () {
      // given
      answer.set('result', 'ok');

      // when
      resultItem = component.get('resultItem');

      // then
      _assertResultItemTitle(resultItem, 'Vous avez la bonne réponse !');
      _assertResultItemTooltip(resultItem, 'Réponse correcte');
    });

    it('should return adapted title and tooltip when result is "ko"', function () {
      // given
      answer.set('result', 'ko');

      // when
      resultItem = component.get('resultItem');

      // then
      _assertResultItemTitle(resultItem, 'Vous n\'avez pas la bonne réponse');
      _assertResultItemTooltip(resultItem, 'Réponse incorrecte');
    });

    it('should return adapted title and tooltip when result is "aband"', function () {
      // given
      answer.set('result', 'aband');

      // when
      resultItem = component.get('resultItem');

      // then
      _assertResultItemTitle(resultItem, 'Vous n\'avez pas donné de réponse');
      _assertResultItemTooltip(resultItem, 'Sans réponse');
    });

    it('should return adapted title and tooltip when result is "partially"', function () {
      // given
      answer.set('result', 'partially');

      // when
      resultItem = component.get('resultItem');

      // then
      _assertResultItemTitle(resultItem, 'Vous avez donné une réponse partielle');
      _assertResultItemTooltip(resultItem, 'Réponse partielle');
      expect(resultItem.custom).to.be.true;
    });

    it('should return adapted title and tooltip when result is "timedout"', function () {
      // given
      answer.set('result', 'timedout');

      // when
      resultItem = component.get('resultItem');

      // then
      _assertResultItemTitle(resultItem, 'Vous avez dépassé le temps imparti');
      _assertResultItemTooltip(resultItem, 'Temps dépassé');
    });
  });
});
