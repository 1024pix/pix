import { clickByName, render } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { find } from '@ember/test-helpers';
import ModulixEmbed from 'mon-pix/components/module/element/embed';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Embed', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display an embed with instruction', async function (assert) {
    // given
    const embed = {
      id: 'id',
      title: 'title',
      isCompletionRequired: false,
      url: 'https://embed-pix.com',
      instruction: "<p>Instruction de l'embed</p>",
      height: 800,
    };

    // when
    const screen = await render(<template><ModulixEmbed @embed={{embed}} /></template>);

    // then
    assert.ok(screen);
    const expectedIframe = screen.getByTitle(embed.title);
    assert.strictEqual(expectedIframe.getAttribute('src'), embed.url);
    assert.strictEqual(expectedIframe.style.getPropertyValue('height'), '800px');
    assert
      .dom(screen.getByRole('button', { name: this.intl.t('pages.modulix.buttons.embed.start.ariaLabel') }))
      .exists();
    assert
      .dom(screen.queryByRole('button', { name: this.intl.t('pages.modulix.buttons.embed.reset.ariaLabel') }))
      .doesNotExist();
    assert.dom(screen.getByText("Instruction de l'embed")).exists();
  });

  test('should display an embed without instruction', async function (assert) {
    // given
    const embed = {
      id: 'id',
      title: 'title',
      isCompletionRequired: false,
      url: 'https://embed-pix.com',
      height: 800,
    };

    // when
    await render(<template><ModulixEmbed @embed={{embed}} /></template>);

    // then
    assert.dom(find('.element-embed__instruction')).doesNotExist();
  });

  module('when user clicks on start button', function () {
    test('should hide start button and display reset button', async function (assert) {
      // given
      const embed = {
        id: 'id',
        title: 'title',
        isCompletionRequired: false,
        url: 'https://embed-pix.com',
        height: 800,
      };

      // when
      const screen = await render(<template><ModulixEmbed @embed={{embed}} /></template>);

      // then
      const startButtonName = this.intl.t('pages.modulix.buttons.embed.start.ariaLabel');
      await clickByName(startButtonName);
      assert.dom(screen.queryByRole('button', { name: startButtonName })).doesNotExist();
      assert
        .dom(screen.getByRole('button', { name: this.intl.t('pages.modulix.buttons.embed.reset.ariaLabel') }))
        .exists();
    });

    test('should focus on the iframe', async function (assert) {
      // given
      const embed = {
        id: 'id',
        title: 'title',
        isCompletionRequired: false,
        url: 'https://embed-pix.com',
        height: 800,
      };
      const screen = await render(<template><ModulixEmbed @embed={{embed}} /></template>);

      // when
      await clickByName(this.intl.t('pages.modulix.buttons.embed.start.ariaLabel'));

      // then
      const iframe = screen.getByTitle(embed.title);
      assert.strictEqual(document.activeElement, iframe);
    });

    module('when a message is received', function () {
      module('when message is not from pix', function () {
        test('should not call the submitAnswer method', async function (assert) {
          // given
          const embed = {
            id: 'id',
            title: 'title',
            isCompletionRequired: true,
            url: 'https://embed-pix.com',
            height: 800,
          };
          const submitAnswerStub = sinon.stub();
          await render(<template><ModulixEmbed @embed={{embed}} @submitAnswer={{submitAnswerStub}} /></template>);
          await clickByName(this.intl.t('pages.modulix.buttons.embed.start.ariaLabel'));

          // when
          const event = new MessageEvent('message', {
            data: { answer: 'toto', from: 'nsa' },
            origin: 'https://epreuves.pix.fr',
          });
          window.dispatchEvent(event);

          // then
          sinon.assert.notCalled(submitAnswerStub);
          assert.ok(true);
        });
      });

      module('when message is not an answer', function () {
        test('should not call the submitAnswer method', async function (assert) {
          // given
          const embed = {
            id: 'id',
            title: 'title',
            isCompletionRequired: true,
            url: 'https://embed-pix.com',
            height: 800,
          };
          const submitAnswerStub = sinon.stub();
          await render(<template><ModulixEmbed @embed={{embed}} @submitAnswer={{submitAnswerStub}} /></template>);
          await clickByName(this.intl.t('pages.modulix.buttons.embed.start.ariaLabel'));

          // when
          const event = new MessageEvent('message', {
            data: { start: 'true', from: 'pix' },
            origin: 'https://epreuves.pix.fr',
          });
          window.dispatchEvent(event);

          // then
          sinon.assert.notCalled(submitAnswerStub);
          assert.ok(true);
        });
      });

      module('when message origin is not allowed', function () {
        test('should not call the submitAnswer method', async function (assert) {
          // given
          const embed = {
            id: 'id',
            title: 'title',
            isCompletionRequired: true,
            url: 'https://embed-pix.com',
            height: 800,
          };
          const submitAnswerStub = sinon.stub();
          await render(<template><ModulixEmbed @embed={{embed}} @submitAnswer={{submitAnswerStub}} /></template>);
          await clickByName(this.intl.t('pages.modulix.buttons.embed.start.ariaLabel'));

          // when
          const event = new MessageEvent('message', {
            data: { answer: 'toto', from: 'pix' },
            origin: 'https://example.org',
          });
          window.dispatchEvent(event);

          // then
          sinon.assert.notCalled(submitAnswerStub);
          assert.ok(true);
        });
      });

      module('otherwise when everything is ok', function () {
        test('should call the submitAnswer method', async function (assert) {
          // given
          const embed = {
            id: 'id',
            title: 'title',
            isCompletionRequired: true,
            url: 'https://embed-pix.com',
            height: 800,
          };
          const submitAnswerStub = sinon.stub();
          await render(<template><ModulixEmbed @embed={{embed}} @submitAnswer={{submitAnswerStub}} /></template>);
          await clickByName(this.intl.t('pages.modulix.buttons.embed.start.ariaLabel'));

          // when
          const event = new MessageEvent('message', {
            data: { answer: 'toto', from: 'pix' },
            origin: 'https://epreuves.pix.fr',
          });
          window.dispatchEvent(event);

          // then
          sinon.assert.called(submitAnswerStub);
          assert.ok(true);
        });
      });
    });
  });

  module('when user clicks on reset button', function () {
    test('should focus on the iframe', async function (assert) {
      // given
      const embed = {
        id: 'id',
        title: 'title',
        isCompletionRequired: false,
        url: 'https://embed-pix.com',
        height: 800,
      };
      const screen = await render(<template><ModulixEmbed @embed={{embed}} /></template>);

      // when
      await clickByName(this.intl.t('pages.modulix.buttons.embed.start.ariaLabel'));
      await clickByName(this.intl.t('pages.modulix.buttons.embed.reset.ariaLabel'));

      // then
      const iframe = screen.getByTitle(embed.title);
      assert.strictEqual(document.activeElement, iframe);
    });
  });
});
