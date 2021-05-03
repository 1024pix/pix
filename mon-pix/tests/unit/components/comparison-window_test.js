import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import setupIntl from '../../helpers/setup-intl';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

describe('Unit | Component | comparison-window', function() {

  setupTest();
  setupIntl();

  let component;
  let answer;
  let resultItem;

  const challengeQroc = EmberObject.create({ type: 'QROC', autoReply: false });
  const challengeQrocWithAutoReply = EmberObject.create({ type: 'QROC', autoReply: true });
  const challengeQcm = EmberObject.create({ type: 'QCM' });
  const challengeQcu = EmberObject.create({ type: 'QCU' });
  const challengeQrocmInd = EmberObject.create({ type: 'QROCM-ind' });
  const challengeQrocmDep = EmberObject.create({ type: 'QROCM-dep' });
  const challengeQrocmDepWithAutoReply = EmberObject.create({ type: 'QROCM-dep', autoReply: true });

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

    [
      { validationStatus: 'unavailable (i.e. empty)', result: '', expectedTitle: 'Réponse', expectedTooltip: 'Correction automatique en cours de développement ;)' },
      { validationStatus: 'unknown', result: 'xxx', expectedTitle: 'Réponse', expectedTooltip: 'Correction automatique en cours de développement ;)' },
      { validationStatus: 'undefined', result: undefined, expectedTitle: 'Réponse', expectedTooltip: 'Correction automatique en cours de développement ;)' },
      { validationStatus: 'ok', result: 'ok', expectedTitle: 'Vous avez la bonne réponse !', expectedTooltip: 'Réponse correcte' },
      { validationStatus: 'ko', result: 'ko', expectedTitle: 'Vous n’avez pas la bonne réponse', expectedTooltip: 'Réponse incorrecte' },
      { validationStatus: 'aband', result: 'aband', expectedTitle: 'Vous n’avez pas donné de réponse', expectedTooltip: 'Sans réponse' },
      { validationStatus: 'partially', result: 'partially', expectedTitle: 'Vous avez donné une réponse partielle', expectedTooltip: 'Réponse partielle' },
      { validationStatus: 'timedout', result: 'timedout', expectedTitle: 'Vous avez dépassé le temps imparti', expectedTooltip: 'Temps dépassé' },
    ].forEach((data) => {
      it(`should return adapted title and tooltip when validation is ${data.validationStatus}`, function() {
        // given
        answer.set('result', `${data.result}`);

        // when
        resultItem = component.resultItem;

        // then
        expect(this.intl.t(resultItem.title)).to.equal(`${data.expectedTitle}`);
        expect(this.intl.t(resultItem.tooltip)).to.equal(`${data.expectedTooltip}`);
      });
    });

    [
      { result: 'ko', expectedTitle: 'Vous n’avez pas réussi l’épreuve', expectedTooltip: 'Épreuve non réussie' },
      { result: 'ok', expectedTitle: 'Vous avez réussi l’épreuve', expectedTooltip: 'Épreuve réussie' },
      { result: 'aband', expectedTitle: 'Vous avez passé l’épreuve', expectedTooltip: 'Épreuve passée' },
    ].forEach((data) => {
      it(`should return adapted title and tooltip when challenge is auto validated and validation is ${data.result}`, function() {
        // given
        answer.set('result', `${data.result}`);
        answer.set('challenge', challengeQrocWithAutoReply);

        // when
        resultItem = component.resultItem;

        // then
        expect(this.intl.t(resultItem.title)).to.equal(`${data.expectedTitle}`);
        expect(this.intl.t(resultItem.tooltip)).to.equal(`${data.expectedTooltip}`);
      });
    });
  });

  describe('#solution', function() {
    it('should return null when challenge has autoReply=true', function() {
      // given
      answer.set('challenge', challengeQrocmDepWithAutoReply);
      answer.set('correction', EmberObject.create());

      // when
      const solution = component.solution;

      // then
      expect(solution).to.be.null;
    });

    it('should return solution', function() {
      // given
      answer.set('challenge', challengeQcu);
      answer.set('correction', EmberObject.create({ solution: 'solution' }));

      // when
      const solution = component.solution;

      // then
      expect(solution).to.equal('solution');
    });
  });
});
