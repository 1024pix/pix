import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupIntl from '../../../../helpers/setup-intl';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Route | campaigns | evaluation | tutorial', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:campaigns.assessment.tutorial');
    route.router = { transitionTo: sinon.stub() };
  });

  module('#model', function () {
    test('should initialize tutorial page with the first one', function (assert) {
      // given
      const params = { code: 'AZERTY' };
      route.paramsFor = sinon.stub().returns(params);

      // when
      const tutorialPage = route.model();

      // then
      assert.strictEqual(tutorialPage.title, this.intl.t('pages.tutorial.pages.page0.title'));
      assert.true(tutorialPage.showNextButton);
      assert.strictEqual(tutorialPage.paging[0], 'dot__active');
    });
  });

  module('#next', function () {
    test('should refresh the tutorial to show the next page', function (assert) {
      // given
      route.refresh = sinon.stub();
      route.set('tutorialPageId', 0);

      // when
      route.send('next');

      // then
      assert.strictEqual(route.get('tutorialPageId'), 1);
      sinon.assert.calledWith(route.refresh);
      assert.ok(true);
    });

    test('should stay on the same tutorial page since it is the last page', function (assert) {
      // given
      route.refresh = sinon.stub();
      route.set('tutorialPageId', 4);

      // when
      route.send('next');

      // then
      assert.strictEqual(route.get('tutorialPageId'), 4);
      sinon.assert.notCalled(route.refresh);
      assert.ok(true);
    });
  });

  module('#submit', function () {
    test('should transition to start-or-resume route', async function (assert) {
      // given
      const userServiceStub = Service.create({
        user: { save: sinon.stub() },
      });
      route.set('currentUser', userServiceStub);
      route.set('campaignCode', 'AZERTY123');

      // when
      await route.send('submit');

      // then
      sinon.assert.calledWith(route.currentUser.user.save, {
        adapterOptions: { rememberUserHasSeenAssessmentInstructions: true },
      });
      sinon.assert.calledWith(route.router.transitionTo, 'campaigns.assessment.start-or-resume', 'AZERTY123');
      assert.ok(true);
    });
  });
});
