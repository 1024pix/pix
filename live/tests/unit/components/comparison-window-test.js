import Ember from 'ember';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';

function _assertResultItemTitle(resultItem, expected) {
  expect(resultItem.title).to.equal(expected);
}

function _assertResultItemTooltip(resultItem, expected) {
  expect(resultItem.tooltip).to.equal(expected);
}

describe('Unit | Component | comparison-window', function() {

  setupTest('component:comparison-window', {});

  let component;
  let answer;
  let resultItem;

  const challengeQroc = { type: 'QROC' };
  const challengeQcm = { type: 'QCM' };
  const challengeQrocmInd = { type: 'QROCM-ind' };
  const challengeQrocmDep = { type: 'QROCM-dep' };

  beforeEach(function() {
    component = this.subject();
    answer = Ember.Object.create();
    component.set('answer', answer);
  });

  describe('#isAssessmentChallengeTypeQroc', function() {

    it('should be true when the challenge is QROC', function() {
      // given
      component.set('challenge', challengeQroc);
      // when
      const isAssessmentChallengeTypeQroc = component.get('isAssessmentChallengeTypeQroc');
      // then
      expect(isAssessmentChallengeTypeQroc).to.be.true;
    });

    it('should be false when the challenge is not QROCM-ind', function() {
      // given
      component.set('challenge', challengeQrocmInd);
      // when
      const isAssessmentChallengeTypeQroc = component.get('isAssessmentChallengeTypeQroc');
      // then
      expect(isAssessmentChallengeTypeQroc).to.be.false;
    });
  });

  describe('#isAssessmentChallengeTypeQcm', function() {

    it('should be true when the challenge is QCM', function() {
      // given
      component.set('challenge', challengeQcm);
      // when
      const isAssessmentChallengeTypeQcm = component.get('isAssessmentChallengeTypeQcm');
      // then
      expect(isAssessmentChallengeTypeQcm).to.be.true;
    });

    it('should be false when the challenge is not QCM', function() {
      // given
      component.set('challenge', challengeQroc);
      // when
      const isAssessmentChallengeTypeQcm = component.get('isAssessmentChallengeTypeQcm');
      // then
      expect(isAssessmentChallengeTypeQcm).to.be.false;
    });
  });

  describe('#isAssessmentChallengeTypeQrocmInd', function() {

    it('should be true when the challenge is QROCM-ind', function() {
      // given
      component.set('challenge', challengeQrocmInd);
      // when
      const isAssessmentChallengeTypeQrocmInd = component.get('isAssessmentChallengeTypeQrocmInd');
      // then
      expect(isAssessmentChallengeTypeQrocmInd).to.be.true;
    });

    it('should be true when the challenge is not QROCM-ind', function() {
      // given
      component.set('challenge', challengeQroc);
      // when
      const isAssessmentChallengeTypeQrocmInd = component.get('isAssessmentChallengeTypeQrocmInd');
      // then
      expect(isAssessmentChallengeTypeQrocmInd).to.be.false;
    });
  });

  describe('#isAssessmentChallengeTypeQrocmDep', function() {

    it('should be true when the challenge is QROCM-dep', function() {
      // given
      component.set('challenge', challengeQrocmDep);
      // when
      const isAssessmentChallengeTypeQrocmDep = component.get('isAssessmentChallengeTypeQrocmDep');
      // then
      expect(isAssessmentChallengeTypeQrocmDep).to.be.true;
    });

    it('should be true when the challenge is not QROCM-dep', function() {
      // given
      component.set('challenge', challengeQroc);
      // when
      const isAssessmentChallengeTypeQrocmDep = component.get('isAssessmentChallengeTypeQrocmDep');
      // then
      expect(isAssessmentChallengeTypeQrocmDep).to.be.false;

    });

  });

  describe('#resultItem', function() {

    it('should return adapted title and tooltip when validation is unavailable (i.e. empty)', function() {
      // given
      answer.set('result', '');

      // when
      resultItem = component.get('resultItem');

      // then
      _assertResultItemTitle(resultItem, '');
      _assertResultItemTooltip(resultItem, 'Correction automatique en cours de développement ;)');
    });

    it('should return adapted title and tooltip when validation status is unknown', function() {
      // given
      answer.set('result', 'xxx');

      // when
      resultItem = component.get('resultItem');

      // then
      _assertResultItemTitle(resultItem, '');
      _assertResultItemTooltip(resultItem, 'Correction automatique en cours de développement ;)');
    });

    it('should return adapted title and tooltip when validation status is undefined', function() {
      // given
      let undefined;
      answer.set('result', undefined);

      // when
      resultItem = component.get('resultItem');

      // then
      _assertResultItemTitle(resultItem, '');
      _assertResultItemTooltip(resultItem, 'Correction automatique en cours de développement ;)');
    });

    it('should return adapted title and tooltip when result is "ok"', function() {
      // given
      answer.set('result', 'ok');

      // when
      resultItem = component.get('resultItem');

      // then
      _assertResultItemTitle(resultItem, 'Vous avez la bonne réponse !');
      _assertResultItemTooltip(resultItem, 'Réponse correcte');
    });

    it('should return adapted title and tooltip when result is "ko"', function() {
      // given
      answer.set('result', 'ko');

      // when
      resultItem = component.get('resultItem');

      // then
      _assertResultItemTitle(resultItem, 'Vous n\'avez pas la bonne réponse');
      _assertResultItemTooltip(resultItem, 'Réponse incorrecte');
    });

    it('should return adapted title and tooltip when result is "aband"', function() {
      // given
      answer.set('result', 'aband');

      // when
      resultItem = component.get('resultItem');

      // then
      _assertResultItemTitle(resultItem, 'Vous n\'avez pas donné de réponse');
      _assertResultItemTooltip(resultItem, 'Sans réponse');
    });

    it('should return adapted title and tooltip when result is "partially"', function() {
      // given
      answer.set('result', 'partially');

      // when
      resultItem = component.get('resultItem');

      // then
      _assertResultItemTitle(resultItem, 'Vous avez donné une réponse partielle');
      _assertResultItemTooltip(resultItem, 'Réponse partielle');
    });

    it('should return adapted title and tooltip when result is "timedout"', function() {
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

