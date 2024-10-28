import { render, within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

const badges = [{ title: 'Badge 1' }, { title: 'Badge 2' }];
const competences = [{ name: 'Competence 1' }, { name: 'Competence 2' }];

module('Integration | Component | Campaigns::Presentation::Steps', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when there is only organization data', function (hooks) {
    let screen;

    hooks.beforeEach(async function () {
      // given
      sinon.stub(this.owner.lookup('service:router'), 'currentRoute').value({});

      this.set('campaignCode', 'CAMPAIGN1');

      this.set('presentationSteps', { customLandingPageText: 'custom text' });

      //  when
      screen = await render(
        hbs`<Campaigns::Presentation::Steps @campaignCode={{this.campaignCode}} @presentationSteps={{this.presentationSteps}} />`,
      );
    });

    test('it should display the organization step', async function (assert) {
      // then
      assert
        .dom(screen.getByRole('heading', { name: t('pages.campaign.presentation.steps.organization.title') }))
        .exists();
      assert.dom(screen.getByText('custom text')).exists();
      assert.dom(screen.getByRole('presentation')).exists();

      assert.dom(screen.getByRole('button', { name: t('common.actions.continue') }));

      assert.ok(window.location.search.includes('currentStep=organization'));
    });

    test('on button click, it should redirect to campaign start', async function (assert) {
      // given
      const saveStub = sinon.stub();
      sinon.stub(this.owner.lookup('service:currentUser'), 'user').value({ save: saveStub });

      const transitionToStub = sinon.stub();
      sinon.stub(this.owner.lookup('service:router'), 'transitionTo').value(transitionToStub);

      // when
      await click(screen.getByRole('button'));

      // then
      sinon.assert.calledOnce(saveStub);
      sinon.assert.calledOnceWithExactly(transitionToStub, 'campaigns.access', this.campaignCode);
      assert.ok(true);
    });
  });

  module('when there is only competences data', function (hooks) {
    let screen;

    hooks.beforeEach(async function () {
      // given
      sinon.stub(this.owner.lookup('service:router'), 'currentRoute').value({});

      this.set('campaignCode', 'CAMPAIGN1');

      this.set('presentationSteps', { competences });

      //  when
      screen = await render(
        hbs`<Campaigns::Presentation::Steps @campaignCode={{this.campaignCode}} @presentationSteps={{this.presentationSteps}} />`,
      );
    });

    test('it should display the competences step', async function (assert) {
      // then
      assert
        .dom(
          screen.getByRole('heading', {
            name: t('pages.campaign.presentation.steps.competences.title', { count: competences.length }),
          }),
        )
        .exists();

      assert
        .dom(
          screen.getByText(t('pages.campaign.presentation.steps.competences.description'), {
            collapseWhitespace: false,
          }),
        )
        .exists();

      assert.strictEqual(screen.getAllByRole('listitem').length, competences.length);
      assert.dom(within(screen.getAllByRole('listitem')[0]).getByText(competences[0].name));
      assert.dom(within(screen.getAllByRole('listitem')[1]).getByText(competences[1].name));

      assert.dom(screen.getByRole('button', { name: t('common.actions.continue') }));

      assert.ok(window.location.search.includes('currentStep=competences'));
    });

    test('on button click, it should redirect to campaign start', async function (assert) {
      // given
      const saveStub = sinon.stub();
      sinon.stub(this.owner.lookup('service:currentUser'), 'user').value({ save: saveStub });

      const transitionToStub = sinon.stub();
      sinon.stub(this.owner.lookup('service:router'), 'transitionTo').value(transitionToStub);

      // when
      await click(screen.getByRole('button'));

      // then
      sinon.assert.calledOnce(saveStub);
      sinon.assert.calledOnceWithExactly(transitionToStub, 'campaigns.access', this.campaignCode);
      assert.ok(true);
    });
  });

  module('when there is only badges data', function (hooks) {
    let screen;

    hooks.beforeEach(async function () {
      // given
      sinon.stub(this.owner.lookup('service:router'), 'currentRoute').value({});

      this.set('campaignCode', 'CAMPAIGN1');

      this.set('presentationSteps', { badges });

      //  when
      screen = await render(
        hbs`<Campaigns::Presentation::Steps @campaignCode={{this.campaignCode}} @presentationSteps={{this.presentationSteps}} />`,
      );
    });

    test('it should display the badge step', async function (assert) {
      // then
      assert.dom(screen.getByRole('heading', { name: t('pages.campaign.presentation.steps.badges.title') })).exists();

      assert.strictEqual(screen.getAllByRole('listitem').length, badges.length);
      assert.dom(within(screen.getAllByRole('listitem')[0]).getByText(badges[0].title));
      assert.dom(within(screen.getAllByRole('listitem')[1]).getByText(badges[1].title));

      assert.dom(screen.getByRole('button', { name: t('common.actions.continue') }));

      assert.ok(window.location.search.includes('currentStep=badges'));
    });

    test('on button click, it should redirect to campaign start', async function (assert) {
      // given
      const saveStub = sinon.stub();
      sinon.stub(this.owner.lookup('service:currentUser'), 'user').value({ save: saveStub });

      const transitionToStub = sinon.stub();
      sinon.stub(this.owner.lookup('service:router'), 'transitionTo').value(transitionToStub);

      // when
      await click(screen.getByRole('button'));

      // then
      sinon.assert.calledOnce(saveStub);
      sinon.assert.calledOnceWithExactly(transitionToStub, 'campaigns.access', this.campaignCode);
      assert.ok(true);
    });
  });

  module('when there are at least 2 steps', function (hooks) {
    let screen;

    hooks.beforeEach(async function () {
      // given
      sinon.stub(this.owner.lookup('service:router'), 'currentRoute').value({});

      this.set('campaignCode', 'CAMPAIGN1');

      this.set('presentationSteps', { customLandingPageText: 'custom text', badges });

      //  when
      screen = await render(
        hbs`<Campaigns::Presentation::Steps @campaignCode={{this.campaignCode}} @presentationSteps={{this.presentationSteps}} />`,
      );
    });

    test('on first button click, it should display the next step', async function (assert) {
      assert
        .dom(screen.getByRole('heading', { name: t('pages.campaign.presentation.steps.organization.title') }))
        .exists();

      // when
      await click(screen.getByRole('button'));

      // then
      assert.dom(screen.getByRole('heading', { name: t('pages.campaign.presentation.steps.badges.title') })).exists();
      assert.ok(window.location.search.includes('currentStep=badges'));
    });
  });
});
