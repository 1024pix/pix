import Ember from 'ember';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { getChallengeComponentClass } from 'pix-live/helpers/get-challenge-component-class';

describe('Unit | Helper | get challenge component class', function () {

  [
    { challengeType: 'QCU', expectedClass: 'challenge-item-qcu' },
    { challengeType: 'QCUIMG', expectedClass: 'challenge-item-qcu' },
    { challengeType: 'QRU', expectedClass: 'challenge-item-qcu' },
    { challengeType: 'QCM', expectedClass: 'challenge-item-qcm' },
    { challengeType: 'QCMIMG', expectedClass: 'challenge-item-qcm' },
    { challengeType: 'QROC', expectedClass: 'challenge-item-qroc' },
    { challengeType: 'QROCm', expectedClass: 'challenge-item-qrocm' },
    { challengeType: 'QROCm-ind', expectedClass: 'challenge-item-qrocm' },
    { challengeType: 'QROCm-dep', expectedClass: 'challenge-item-qrocm' }
  ].forEach((useCase) => {

    it(`should return component class "${useCase.expectedClass}" when challenge type is "${useCase.challengeType}"`, function () {
      // given
      const challenge = Ember.Object.create({ type: useCase.challengeType });
      const params = [challenge];

      // when
      const componentClass = getChallengeComponentClass(params);

      // then
      expect(componentClass).to.equal(useCase.expectedClass);
    });
  });
});

