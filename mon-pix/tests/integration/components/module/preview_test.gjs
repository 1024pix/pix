import { render, within } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
// eslint-disable-next-line no-restricted-imports
import { click, find } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ModulixPreview from 'mon-pix/components/module/preview';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Preview', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a link to Modulix Editor', async function (assert) {
    // given
    const expectedUrl = 'https://1024pix.github.io/modulix-editor/';
    const linkName = 'Modulix Editor';

    //  when
    const screen = await render(<template><ModulixPreview /></template>);

    // then
    const linkToModulixEditor = screen.getByRole('link', { name: linkName });
    assert.dom(linkToModulixEditor).exists();
    assert.strictEqual(linkToModulixEditor.href, expectedUrl);
  });

  test('should enable preview mode service', async function (assert) {
    // given
    const enableStub = sinon.stub();
    class PreviewModeServiceStub extends Service {
      enable = enableStub;
    }
    this.owner.register('service:modulixPreviewMode', PreviewModeServiceStub);

    // when
    await render(<template><ModulixPreview /></template>);

    // then
    assert.true(enableStub.calledOnce);
  });

  test('should hide json textarea by default', async function (assert) {
    //  when
    const screen = await render(<template><ModulixPreview /></template>);

    // then
    assert.dom(screen.queryByRole('textbox', { name: 'Contenu du Module' })).doesNotExist();
  });

  test('should display json textarea on button click', async function (assert) {
    //  given
    const screen = await render(<template><ModulixPreview /></template>);
    const button = screen.getByRole('button', { name: 'Afficher le JSON' });

    // when
    await click(button);

    // then
    assert.dom(screen.queryByRole('textbox', { name: 'Contenu du Module' })).exists();
  });

  module('when previewing an existing module passed as argument', function () {
    test('should display the module title', async function (assert) {
      // given
      const moduleData = { title: 'Existing module' };
      const screen = await render(<template><ModulixPreview @module={{moduleData}} /></template>);

      // then
      assert.dom(screen.getByRole('heading', { name: 'Existing module' })).exists();
    });

    test('should not display the navbar', async function (assert) {
      // given
      const moduleData = { title: 'Existing module' };
      const screen = await render(<template><ModulixPreview @module={{moduleData}} /></template>);

      // then
      const linkToModulixEditor = screen.queryByRole('link', { name: 'Modulix Editor' });
      assert.dom(linkToModulixEditor).doesNotExist();
      const displayJsonButton = screen.queryByRole('button', { name: 'Afficher le JSON' });
      assert.dom(displayJsonButton).doesNotExist();
    });

    test('should display the grain navigation form', async function (assert) {
      // given
      const moduleData = {
        title: 'Existing module',
        sections: [{ type: 'blank', grains: [{ title: 'Grain 1', components: [] }] }],
      };

      // when
      const screen = await render(<template><ModulixPreview @module={{moduleData}} /></template>);

      // then
      assert.dom(screen.getByRole('button', { name: t('pages.modulix.preview.grain-select.button') })).exists();
    });

    module('#goToModuleGrain', function () {
      test('should transition to module.passage with the selected grain index', async function (assert) {
        // given
        const router = this.owner.lookup('service:router');
        const transitionToStub = sinon.stub(router, 'transitionTo');
        const navigationProgress = this.owner.lookup('service:modulix-navigation-progress');
        sinon.stub(navigationProgress, 'setCurrentSectionIndex');

        const moduleData = {
          title: 'Existing module',
          sections: [
            {
              type: 'blank',
              grains: [
                { title: 'Grain 1', components: [] },
                { title: 'Grain 2', components: [] },
              ],
            },
          ],
        };
        const screen = await render(<template><ModulixPreview @module={{moduleData}} /></template>);

        // when
        await click(screen.getByRole('button', { name: t('pages.modulix.preview.grain-select.button') }));

        // then
        sinon.assert.calledOnceWithExactly(transitionToStub, 'module.passage', moduleData, {
          queryParams: { grainIndex: '0' },
        });
        assert.ok(true);
      });
    });

    module('when has a section', function () {
      module('when section is type "blank"', function () {
        test('should not display section title', async function (assert) {
          // given
          const moduleData = { title: 'Existing module', sections: [{ type: 'blank', grains: [] }] };
          const screen = await render(<template><ModulixPreview @module={{moduleData}} /></template>);

          // then
          const h2 = screen.queryByRole('heading', { level: 2 });
          assert.dom(h2).doesNotExist();
        });
      });

      module('when section is type "question-yourself"', function () {
        test('should display section title', async function (assert) {
          // given
          const moduleData = {
            title: 'Existing module',
            sections: [{ type: 'question-yourself', grains: [] }],
          };
          const screen = await render(<template><ModulixPreview @module={{moduleData}} /></template>);

          // then
          const h2 = screen.queryByRole('heading', {
            level: 2,
            name: t(`pages.modulix.section.${moduleData.sections[0].type}`),
          });
          assert.dom(h2).exists();
        });
      });

      module('when section is type "practise"', function () {
        test('should display section title', async function (assert) {
          // given
          const moduleData = {
            title: 'Existing module',
            sections: [{ type: 'practise', grains: [] }],
          };
          const screen = await render(<template><ModulixPreview @module={{moduleData}} /></template>);

          // then
          const h2 = screen.queryByRole('heading', {
            level: 2,
            name: t(`pages.modulix.section.${moduleData.sections[0].type}`),
          });
          assert.dom(h2).exists();
        });
      });
    });
  });

  test('should not display grain navigation form when no module is provided', async function (assert) {
    // when
    const screen = await render(<template><ModulixPreview /></template>);

    // then
    assert.dom(screen.queryByRole('button', { name: t('pages.modulix.preview.grain-select.button') })).doesNotExist();
  });

  test('should display a button display elements id (false by default)', async function (assert) {
    // given
    //  when
    const screen = await render(<template><ModulixPreview /></template>);

    // then
    const radioGroup = screen.getByRole('radiogroup', { name: t('pages.modulix.preview.elements-id-button.label') });
    assert.dom(radioGroup).exists();
    assert.dom(within(radioGroup).getByRole('radio', { name: t('common.yes') })).exists();
    assert.dom(within(radioGroup).getByRole('radio', { name: t('common.no') })).isChecked();
  });

  module('grains title button', function () {
    test('should display a display grains title button', async function (assert) {
      // given
      // when
      const screen = await render(<template><ModulixPreview /></template>);

      // then
      const radioGroup = screen.getByRole('radiogroup', { name: t('pages.modulix.preview.grains-title-button.label') });
      assert.dom(radioGroup).exists();
      assert.dom(within(radioGroup).getByRole('radio', { name: t('common.yes') })).exists();
      assert.dom(within(radioGroup).getByRole('radio', { name: t('common.no') })).exists();
    });

    module('when clicking on grain title button', function () {
      test('should display all grain title in page', async function (assert) {
        // given
        const firstSectionGrain = [
          { id: '4198b9b7-75a3-4bf2-8f1d-71f1f4f408bd', title: 'grain1', components: [] },
          { id: 'e845cece-aea3-4d61-885d-abf00765e784', title: 'grain2', components: [] },
        ];
        const lastSectionGrain = [{ id: '268fbbcf-c01b-4ae5-af0c-79d4654484c7', title: 'grain3', components: [] }];
        const moduleData = {
          title: 'Existing module',
          sections: [
            { type: 'question-yourself', grains: firstSectionGrain },
            { type: 'practise', grains: lastSectionGrain },
          ],
        };

        // when
        const screen = await render(<template><ModulixPreview @module={{moduleData}} /></template>);

        const grainsTitleRadioGroup = screen.getByRole('radiogroup', {
          name: t('pages.modulix.preview.grains-title-button.label'),
        });
        await click(within(grainsTitleRadioGroup).getByRole('radio', { name: t('common.yes') }));

        // then
        const moduleContent = find('.module-preview-passage__content');

        assert
          .dom(
            within(moduleContent).getByText(
              t('pages.modulix.preview.grain-select.grain-label', { index: 0, title: firstSectionGrain[0].title }),
            ),
          )
          .exists();
        assert
          .dom(
            within(moduleContent).getByText(
              t('pages.modulix.preview.grain-select.grain-label', { index: 1, title: firstSectionGrain[1].title }),
            ),
          )
          .exists();
        assert
          .dom(
            within(moduleContent).getByText(
              t('pages.modulix.preview.grain-select.grain-label', { index: 2, title: lastSectionGrain[0].title }),
            ),
          )
          .exists();
      });
    });
  });
});
