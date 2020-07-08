import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

function _assertResultItemTitle(resultItem, expected) {
  expect(resultItem.title).to.equal(expected);
}

function _assertResultItemTooltip(resultItem, expected) {
  expect(resultItem.tooltip).to.equal(expected);
}

describe('Unit | Component | comparison-window', function() {

  setupTest();

  let component;
  let answer;
  let resultItem;

  const challengeQroc = EmberObject.create({ type: 'QROC', autoReply: false });
  const challengeQrocWithAutoReply = EmberObject.create({ type: 'QROC', autoReply: true });
  const challengeQcm = EmberObject.create({ type: 'QCM' });
  const challengeQrocmInd = EmberObject.create({ type: 'QROCM-ind' });
  const challengeQrocmDep = EmberObject.create({ type: 'QROCM-dep' });

  beforeEach(function() {
    answer = EmberObject.create();
    component = createGlimmerComponent('component:comparison-window', { answer });
  });

  describe('#isAssessmentChallengeTypeQroc', function() {

    it('should be true when the challenge is QROC', function() {
      // given
      answer.set('challenge', challengeQroc);
      // when
      const isAssessmentChallengeTypeQroc = component.isAssessmentChallengeTypeQroc;
      // then
      expect(isAssessmentChallengeTypeQroc).to.be.true;
    });

    it('should be false when the challenge is not QROCM-ind', function() {
      // given
      answer.set('challenge', challengeQrocmInd);
      // when
      const isAssessmentChallengeTypeQroc = component.isAssessmentChallengeTypeQroc;
      // then
      expect(isAssessmentChallengeTypeQroc).to.be.false;
    });
  });

  describe('#isAssessmentChallengeTypeQcm', function() {

    it('should be true when the challenge is QCM', function() {
      // given
      answer.set('challenge', challengeQcm);
      // when
      const isAssessmentChallengeTypeQcm = component.isAssessmentChallengeTypeQcm;
      // then
      expect(isAssessmentChallengeTypeQcm).to.be.true;
    });

    it('should be false when the challenge is not QCM', function() {
      // given
      answer.set('challenge', challengeQroc);
      // when
      const isAssessmentChallengeTypeQcm = component.isAssessmentChallengeTypeQcm;
      // then
      expect(isAssessmentChallengeTypeQcm).to.be.false;
    });
  });

  describe('#isAssessmentChallengeTypeQrocmInd', function() {

    it('should be true when the challenge is QROCM-ind', function() {
      // given
      answer.set('challenge', challengeQrocmInd);
      // when
      const isAssessmentChallengeTypeQrocmInd = component.isAssessmentChallengeTypeQrocmInd;
      // then
      expect(isAssessmentChallengeTypeQrocmInd).to.be.true;
    });

    it('should be true when the challenge is not QROCM-ind', function() {
      // given
      answer.set('challenge', challengeQroc);
      // when
      const isAssessmentChallengeTypeQrocmInd = component.isAssessmentChallengeTypeQrocmInd;
      // then
      expect(isAssessmentChallengeTypeQrocmInd).to.be.false;
    });
  });

  describe('#isAssessmentChallengeTypeQrocmDep', function() {

    it('should be true when the challenge is QROCM-dep', function() {
      // given
      answer.set('challenge', challengeQrocmDep);
      // when
      const isAssessmentChallengeTypeQrocmDep = component.isAssessmentChallengeTypeQrocmDep;
      // then
      expect(isAssessmentChallengeTypeQrocmDep).to.be.true;
    });

    it('should be true when the challenge is not QROCM-dep', function() {
      // given
      answer.set('challenge', challengeQroc);
      // when
      const isAssessmentChallengeTypeQrocmDep = component.isAssessmentChallengeTypeQrocmDep;
      // then
      expect(isAssessmentChallengeTypeQrocmDep).to.be.false;
    });

  });

  describe('#resultItem', function() {
    beforeEach(function() {
      answer.set('challenge', challengeQcm);
    });

    it('should return adapted title and tooltip when validation is unavailable (i.e. empty)', function() {
      // given
      answer.set('result', '');

      // when
      resultItem = component.resultItem;

      // then
      _assertResultItemTitle(resultItem, '');
      _assertResultItemTooltip(resultItem, 'Correction automatique en cours de développement ;)');
    });

    it('should return adapted title and tooltip when validation status is unknown', function() {
      // given
      answer.set('result', 'xxx');

      // when
      resultItem = component.resultItem;

      // then
      _assertResultItemTitle(resultItem, '');
      _assertResultItemTooltip(resultItem, 'Correction automatique en cours de développement ;)');
    });

    it('should return adapted title and tooltip when validation status is undefined', function() {
      // given
      let undefined;
      answer.set('result', undefined);

      // when
      resultItem = component.resultItem;

      // then
      _assertResultItemTitle(resultItem, '');
      _assertResultItemTooltip(resultItem, 'Correction automatique en cours de développement ;)');
    });

    it('should return adapted title and tooltip when result is "ok"', function() {
      // given
      answer.set('result', 'ok');

      // when
      resultItem = component.resultItem;

      // then
      _assertResultItemTitle(resultItem, 'Vous avez la bonne réponse !');
      _assertResultItemTooltip(resultItem, 'Réponse correcte');
    });

    it('should return adapted title and tooltip when result is "ko"', function() {
      // given
      answer.set('result', 'ko');

      // when
      resultItem = component.resultItem;

      // then
      _assertResultItemTitle(resultItem, 'Vous n’avez pas la bonne réponse');
      _assertResultItemTooltip(resultItem, 'Réponse incorrecte');
    });

    it('should return adapted title and tooltip when result is "aband"', function() {
      // given
      answer.set('result', 'aband');

      // when
      resultItem = component.resultItem;

      // then
      _assertResultItemTitle(resultItem, 'Vous n’avez pas donné de réponse');
      _assertResultItemTooltip(resultItem, 'Sans réponse');
    });

    it('should return adapted title and tooltip when result is "partially"', function() {
      // given
      answer.set('result', 'partially');

      // when
      resultItem = component.resultItem;

      // then
      _assertResultItemTitle(resultItem, 'Vous avez donné une réponse partielle');
      _assertResultItemTooltip(resultItem, 'Réponse partielle');
    });

    it('should return adapted title and tooltip when result is "timedout"', function() {
      // given
      answer.set('result', 'timedout');

      // when
      resultItem = component.resultItem;

      // then
      _assertResultItemTitle(resultItem, 'Vous avez dépassé le temps imparti');
      _assertResultItemTooltip(resultItem, 'Temps dépassé');
    });

    it('should return adapted title and tooltip when result is "ko" and challenge is auto validated', function() {
      // given
      answer.set('result', 'ko');
      answer.set('challenge', challengeQrocWithAutoReply);

      // when
      resultItem = component.resultItem;

      // then
      _assertResultItemTitle(resultItem, 'Vous n’avez pas réussi l’épreuve');
      _assertResultItemTooltip(resultItem, 'Épreuve non réussie');
    });

    it('should return adapted title and tooltip when result is "ok" and challenge is auto validated', function() {
      // given
      answer.set('result', 'ok');
      answer.set('challenge', challengeQrocWithAutoReply);

      // when
      resultItem = component.resultItem;

      // then
      _assertResultItemTitle(resultItem, 'Vous avez réussi l’épreuve');
      _assertResultItemTooltip(resultItem, 'Épreuve réussie');
    });

    it('should return adapted title and tooltip when result is "aband" and challenge is auto validated', function() {
      // given
      answer.set('result', 'aband');
      answer.set('challenge', challengeQrocWithAutoReply);

      // when
      resultItem = component.resultItem;

      // then
      _assertResultItemTitle(resultItem, 'Vous avez passé l’épreuve');
      _assertResultItemTooltip(resultItem, 'Épreuve passée');
    });
  });
});
