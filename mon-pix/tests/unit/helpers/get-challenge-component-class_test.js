import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { getChallengeComponentClass } from 'mon-pix/helpers/get-challenge-component-class';

module('Unit | Helper | get challenge component class', function () {
  [
    { challengeType: 'QCU', expectedClass: 'challenge-item-qcu' },
    { challengeType: 'QCUIMG', expectedClass: 'challenge-item-qcu' },
    { challengeType: 'QCM', expectedClass: 'challenge-item-qcm' },
    { challengeType: 'QCMIMG', expectedClass: 'challenge-item-qcm' },
    { challengeType: 'QROC', expectedClass: 'challenge-item-qroc' },
    { challengeType: 'QROCm', expectedClass: 'challenge-item-qrocm' },
    { challengeType: 'QROCm-ind', expectedClass: 'challenge-item-qrocm' },
    { challengeType: 'QROCm-dep', expectedClass: 'challenge-item-qrocm' },
  ].forEach((useCase) => {
    test(`should return component class "${useCase.expectedClass}" when challenge type is "${useCase.challengeType}"`, function (assert) {
      // given
      const challenge = EmberObject.create({ type: useCase.challengeType });
      const params = [challenge];

      // when
      const componentClass = getChallengeComponentClass(params);

      // then
      assert.strictEqual(componentClass, useCase.expectedClass);
    });
  });
});
