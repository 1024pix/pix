import { render, within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import ModulixCustomElement from 'mon-pix/components/module/element/custom-element';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { waitForDialog } from '../../../helpers/wait-for';

module('Integration | Component | Module | Custom Element', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display report button', async function (assert) {
    const customElement = {
      id: 'id',
      title: 'mon-custom-test',
      instruction: 'Test POI quiz image',
      tagName: 'image-quiz',
      props: {
        name: 'Liste d‘applications',
        imageChoicesSize: 'icon',
        choices: [
          {
            name: 'Google',
            image: {
              width: 534,
              height: 544,
              loading: 'lazy',
              decoding: 'async',
              src: 'https://epreuves.pix.fr/_astro/Google.B1bcY5Go_1BynY8.svg',
            },
          },
          {
            name: 'LibreOffice Writer',
            image: {
              width: 205,
              height: 246,
              loading: 'lazy',
              decoding: 'async',
              src: 'https://epreuves.pix.fr/_astro/writer.3bR8N2DK_Z1iWuJ9.webp',
            },
          },
          {
            name: 'Explorateur',
            image: {
              width: 128,
              height: 128,
              loading: 'lazy',
              decoding: 'async',
              src: 'https://epreuves.pix.fr/_astro/windows-file-explorer.CnF8MYwI_23driA.webp',
            },
          },
          {
            name: 'Geogebra',
            image: {
              width: 640,
              height: 640,
              loading: 'lazy',
              decoding: 'async',
              src: 'https://epreuves.pix.fr/_astro/geogebra.CZH9VYqc_19v4nj.webp',
            },
          },
        ],
      },
    };

    // when
    const screen = await render(<template><ModulixCustomElement @component={{customElement}} /></template>);

    // then
    assert.dom(screen.getByRole('button', { name: t('pages.modulix.issue-report.aria-label') })).exists();
  });

  module('when user clicks on report button', function () {
    test('should display issue-report modal with a form inside', async function (assert) {
      // given
      const customElement = {
        id: 'b0e9d79f-1727-4861-ac89-bd834473d62b',
        title: 'mon-custom-test',
        instruction: 'Test POI quiz image',
        tagName: 'image-quiz',
        props: {
          name: 'Liste d‘applications',
          imageChoicesSize: 'icon',
          choices: [
            {
              name: 'Google',
              image: {
                width: 534,
                height: 544,
                loading: 'lazy',
                decoding: 'async',
                src: 'https://epreuves.pix.fr/_astro/Google.B1bcY5Go_1BynY8.svg',
              },
            },
            {
              name: 'LibreOffice Writer',
              image: {
                width: 205,
                height: 246,
                loading: 'lazy',
                decoding: 'async',
                src: 'https://epreuves.pix.fr/_astro/writer.3bR8N2DK_Z1iWuJ9.webp',
              },
            },
            {
              name: 'Explorateur',
              image: {
                width: 128,
                height: 128,
                loading: 'lazy',
                decoding: 'async',
                src: 'https://epreuves.pix.fr/_astro/windows-file-explorer.CnF8MYwI_23driA.webp',
              },
            },
            {
              name: 'Geogebra',
              image: {
                width: 640,
                height: 640,
                loading: 'lazy',
                decoding: 'async',
                src: 'https://epreuves.pix.fr/_astro/geogebra.CZH9VYqc_19v4nj.webp',
              },
            },
          ],
        },
        type: 'custom',
      };

      // when
      const screen = await render(
        <template>
          <div id="modal-container"></div>
          <ModulixCustomElement @component={{customElement}} />
        </template>,
      );
      await click(screen.getByRole('button', { name: t('pages.modulix.issue-report.aria-label') }));
      await waitForDialog();

      // then
      await click(screen.getByRole('button', { name: t('pages.modulix.issue-report.modal.select-label') }));
      const listbox = await screen.findByRole('listbox');
      const options = within(listbox).getAllByRole('option');
      assert.strictEqual(options.length, 4);
    });
  });

  module('when custom element can be reset', function () {
    module('when user clicks on reset button', function () {
      test('should send an event', async function (assert) {
        const customElement = {
          id: 'id',
          title: 'clickable-image',
          instruction: 'Test POI interactif',
          tagName: 'clickable-image',
          props: {
            image: {
              src: 'https://assets.pix.org/modules/salon-connecte.webp',
              alt: 'salon connecté',
              width: 1536,
              height: 1024,
            },
            areas: [
              {
                coords: {
                  x1: 390,
                  y1: 120,
                  x2: 842,
                  y2: 400,
                },
                spot: { x: 240, y: 130 },
                info: 'Info sur le POI',
              },
            ],
          },
        };
        const passageEventService = this.owner.lookup('service:passageEvents');
        const passageEventRecordStub = sinon.stub(passageEventService, 'record');

        // when
        const screen = await render(<template><ModulixCustomElement @component={{customElement}} /></template>);
        const resetButton = screen.getByRole('button', {
          name: t('pages.modulix.buttons.interactive-element.reset.ariaLabel'),
        });
        await click(resetButton);

        // then
        sinon.assert.calledOnceWith(passageEventRecordStub, {
          type: 'CUSTOM_RETRIED',
          data: {
            elementId: customElement.id,
          },
        });
        assert.ok(true);
      });
    });
  });

  module('when custom element is not interactive', function () {
    module('when custom element has instruction', function () {
      test('should display instruction', async function (assert) {
        // given
        const customElement = {
          id: 'b0e9d79f-1727-4861-ac89-bd834473d62b',
          title: 'mon-custom-test',
          instruction: 'Test POI quiz image',
          tagName: 'llm-compare-messages',
          props: {
            conversation1: { title: 'Conversation 1', llmName: 'Nono' },
            conversation2: { title: 'Conversation 2', llmName: 'Jaja' },
          },
          type: 'custom',
        };

        // when
        const screen = await render(<template><ModulixCustomElement @component={{customElement}} /></template>);

        // then
        assert.dom(screen.getByText('Test POI quiz image')).exists();
      });
    });
  });

  module('when custom element is interactive', function () {
    module('when custom element has instructions', function () {
      test('should display instructions (title, instruction and functionalInstruction)', async function (assert) {
        // given
        const customElement = {
          id: 'b0e9d79f-1727-4861-ac89-bd834473d62b',
          title: 'mon-custom-test',
          instruction: 'Test POI quiz image',
          functionalInstruction: 'Consigne fonctionnelle du POI quiz image',
          tagName: 'image-quiz',
          props: {
            name: 'Liste d‘applications',
            imageChoicesSize: 'icon',
            choices: [
              {
                name: 'Google',
                image: {
                  width: 534,
                  height: 544,
                  loading: 'lazy',
                  decoding: 'async',
                  src: 'https://epreuves.pix.fr/_astro/Google.B1bcY5Go_1BynY8.svg',
                },
              },
              {
                name: 'LibreOffice Writer',
                image: {
                  width: 205,
                  height: 246,
                  loading: 'lazy',
                  decoding: 'async',
                  src: 'https://epreuves.pix.fr/_astro/writer.3bR8N2DK_Z1iWuJ9.webp',
                },
              },
              {
                name: 'Explorateur',
                image: {
                  width: 128,
                  height: 128,
                  loading: 'lazy',
                  decoding: 'async',
                  src: 'https://epreuves.pix.fr/_astro/windows-file-explorer.CnF8MYwI_23driA.webp',
                },
              },
              {
                name: 'Geogebra',
                image: {
                  width: 640,
                  height: 640,
                  loading: 'lazy',
                  decoding: 'async',
                  src: 'https://epreuves.pix.fr/_astro/geogebra.CZH9VYqc_19v4nj.webp',
                },
              },
            ],
          },
          type: 'custom',
        };

        // when
        const screen = await render(<template><ModulixCustomElement @component={{customElement}} /></template>);

        // then
        assert.dom(screen.getByText('mon-custom-test')).exists();
        assert.dom(screen.getByText('Test POI quiz image')).exists();
        assert.dom(screen.getByText('Consigne fonctionnelle du POI quiz image')).exists();
      });
    });
  });
});
