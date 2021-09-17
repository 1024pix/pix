import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Integration | Component | Layout::Footer', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('should display copyright', async function(assert) {
    //given
    const date = new Date();
    const expectedYear = date.getFullYear().toString();

    // when
    await render(hbs`<Layout::Footer />}`);

    // then
    assert.contains(`© ${expectedYear} Pix`);
  });

  test('should display legal notice link', async function(assert) {
    // given
    const service = this.owner.lookup('service:url');
    service.currentDomain = { getExtension: sinon.stub().returns('fr') };

    // when
    await render(hbs`<Layout::Footer />}`);

    // then
    assert.contains('Mentions légales');
    assert.dom('a[href="https://pix.fr/mentions-legales"]').exists();
  });

  test('should display accessibility link', async function(assert) {
    // given
    const service = this.owner.lookup('service:url');
    service.currentDomain = { getExtension: sinon.stub().returns('fr') };

    // when
    await render(hbs`<Layout::Footer />}`);

    // then
    assert.contains('Accessibilité : non conforme');
    assert.dom('a[href="https://pix.fr/accessibilite-pix-orga"]').exists();
  });
});
