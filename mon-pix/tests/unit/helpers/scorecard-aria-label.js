import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';

import EmberObject from '@ember/object';
import Service from '@ember/service';

import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

module('Unit | Helper | scorecard-aria-label', function (hooks) {
  setupTest(hooks);

  module('#compute', function (hooks) {
    let intlServiceStub, component;

    hooks.beforeEach(function () {
      class IntlServiceStub extends Service {
        t() {}
      }

      this.owner.register('service:intl', IntlServiceStub);
      intlServiceStub = this.owner.lookup('service:intl');
      sinon.spy(intlServiceStub, 't');

      component = createGlimmerComponent('scorecard-aria-label');
    });

    test('should return that competence is not started', async function (assert) {
      // given
      const scorecard = EmberObject.create({
        isNotStarted: true,
      });

      // when
      component.compute(scorecard);

      // then
      sinon.assert.calledWith(intlServiceStub.t, 'pages.profile.competence-card.image-info.no-level');
      assert.ok(true);
    });

    test('should return that first level of competence is started but not finished', async function (assert) {
      // given
      const scorecard = EmberObject.create({
        isNotStarted: false,
        level: 0,
        percentageAheadOfNextLevel: 12,
      });

      // when
      component.compute(scorecard);

      // then
      const expectedTranslationsParams = {
        percentageAheadOfNextLevel: 12,
      };
      sinon.assert.calledWith(
        intlServiceStub.t,
        'pages.profile.competence-card.image-info.first-level',
        expectedTranslationsParams,
      );
      assert.ok(true);
    });

    test('should return current level and percentage completed of the next level', async function (assert) {
      // given
      const scorecard = EmberObject.create({
        isNotStarted: false,
        level: 2,
        percentageAheadOfNextLevel: 30,
      });

      // when
      component.compute(scorecard);

      // then
      const expectedTranslationsParams = {
        currentLevel: 2,
        percentageAheadOfNextLevel: 30,
      };
      sinon.assert.calledWith(
        intlServiceStub.t,
        'pages.profile.competence-card.image-info.level',
        expectedTranslationsParams,
      );
      assert.ok(true);
    });
  });
});
