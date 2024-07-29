import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | Module | Embed', function (hooks) {
  setupTest(hooks);

  module('#setIframeHtmlElement', function () {
    test('should set the iframe html element', async function (assert) {
      // given
      const embed = {
        id: 'id',
        title: 'title',
        isCompletionRequired: false,
        url: 'https://example.org',
        height: 800,
      };
      const component = createGlimmerComponent('module/element/embed', {
        embed,
      });
      const expectedComponentIFrame = Symbol('iframeHtmlElement');

      // when
      component.setIframeHtmlElement(expectedComponentIFrame);

      // then
      assert.deepEqual(component.iframe, expectedComponentIFrame);
    });
  });

  module('#resetEmbed', function () {
    test('should update the iframe src', async function (assert) {
      // given
      const embed = {
        id: 'id',
        title: 'title',
        isCompletionRequired: false,
        url: 'https://example.org',
        height: 800,
      };
      const component = createGlimmerComponent('module/element/embed', {
        embed,
      });
      component.iframe = {
        setAttribute: sinon.stub(),
        focus: sinon.stub(),
      };

      // when
      component.resetEmbed();

      // then
      sinon.assert.calledWith(component.iframe.setAttribute, 'src', embed.url);
      sinon.assert.called(component.iframe.focus);
      assert.ok(true);
    });
  });
});
