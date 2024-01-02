import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

import createComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | Autonomous courses | ViewAutonomousCourse', function (hooks) {
  setupTest(hooks);
  let component;

  hooks.beforeEach(function () {
    // given
    component = createComponent('component:autonomous-courses/view-autonomous-course', {
      onSubmit: sinon.stub(),
      autonomousCourse: {
        id: '1',
        internalTitle: 'internalTitle',
        publicTitle: 'publicTitle',
        targetProfileId: 'targetProfileId',
        customLandingPageText: 'customLandingPageText',
        createdAt: '2023-12-27T15:07:57.376Z',
        code: '123456',
      },
    });
  });

  module('#displayedAttributes', function () {
    test('it should format date attribute', function (assert) {
      // when
      const dateAttribute = component.displayedAttributes.find(
        (attribute) => attribute.label === 'Date de création',
      ).value;

      // then
      assert.strictEqual(dateAttribute, '27/12/2023');
    });
  });

  module('#tooltipLabel', function () {
    test('it should return label', function (assert) {
      // when
      const label = component.tooltipLabel;

      // then
      assert.strictEqual(label, 'Copier le lien de la campagne');
    });

    test('it should return a different label when link has been copied', function (assert) {
      // when
      component.linkHasJustBeenCopied = true;
      const label = component.tooltipLabel;

      // then
      assert.strictEqual(label, 'Lien copié !');
    });
  });

  module('#campaignLink', function () {
    test('it should return campaign link', function (assert) {
      // when
      window.origin = 'https://admin-recette.pix.fr';
      const campaignLink = component.campaignLink;

      // then
      assert.strictEqual(campaignLink, 'https://app-recette.pix.fr/campagnes/123456');
    });
  });

  module('#copyCampaignLink', function () {
    test('it should copy link to navigator clipboard', async function (assert) {
      // given
      window.origin = 'https://admin-recette.pix.fr';
      const writeTextStub = sinon.stub();
      sinon.stub(navigator, 'clipboard').value({ writeText: writeTextStub.resolves() });

      // when
      component.copyCampaignLink();

      // then
      assert.ok(writeTextStub.calledOnce);
      assert.ok(writeTextStub.calledWithExactly('https://app-recette.pix.fr/campagnes/123456'));
    });
  });
});
