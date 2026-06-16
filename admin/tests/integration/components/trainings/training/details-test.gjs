import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import TrainingDetails from 'pix-admin/templates/authenticated/trainings/training/details';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Trainings | Training | Details', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('error cases', function () {
    module('when editorLogoURl format is incorrect', function () {
      test('should display an error', async function (assert) {
        // given
        class AccessControlStub extends Service {
          hasAccessToTrainingsActionsScope = true;
        }
        this.owner.register('service:access-control', AccessControlStub);
        const notificationErrorStub = sinon.stub();
        class NotificationsStub extends Service {
          sendErrorNotification = notificationErrorStub;
        }
        this.owner.register('service:pixToast', NotificationsStub);

        const store = this.owner.lookup('service:store');

        const model = store.createRecord('training', {
          id: '12',
          title: 'title',
          internalTitle: 'internalTitle',
          link: 'my-training-link',
          type: 'webinaire',
          locales: ['fr-fr'],
          editorName: 'Albert',
          editorLogoUrl: 'http://localhost:4202/logo-placeholder.png',
          isRecommendable: true,
          isDisabled: false,
        });
        store.createRecord('module-metadata', { title: 'Bac à sable', link: '/modules/bac-a-sable' });
        sinon.stub(model, 'save').rejects({ errors: [{ status: '400', detail: 'data.attributes.editor-logo-url' }] });

        // when
        const screen = await render(<template><TrainingDetails @model={{model}} /></template>);

        await click(screen.getByRole('button', { name: 'Modifier' }));
        await fillIn(
          screen.getByRole('textbox', {
            name: "Url du logo de l'éditeur (.svg) Exemple : https://assets.pix.org/contenu-formatif/editeur/pix-logo.svg",
          }),
          'bonjour!',
        );
        await click(screen.getByRole('button', { name: 'Modifier le contenu formatif' }));

        // then
        sinon.assert.calledWith(notificationErrorStub, {
          message: t('pages.trainings.training.error-messages.incorrect-editor-logo-url-format'),
        });
        assert.ok(true);
      });
    });

    module('for other errors', function () {
      test('should display a default error', async function (assert) {
        // given
        class AccessControlStub extends Service {
          hasAccessToTrainingsActionsScope = true;
        }
        this.owner.register('service:access-control', AccessControlStub);
        const notificationErrorStub = sinon.stub();
        class NotificationsStub extends Service {
          sendErrorNotification = notificationErrorStub;
        }
        this.owner.register('service:pixToast', NotificationsStub);

        const store = this.owner.lookup('service:store');

        const model = store.createRecord('training', {
          id: '12',
          title: 'title',
          internalTitle: 'internalTitle',
          link: 'my-training-link',
          type: 'webinaire',
          locales: ['fr-fr'],
          editorName: 'Albert',
          editorLogoUrl: 'http://localhost:4202/logo-placeholder.png',
          isRecommendable: true,
          isDisabled: false,
        });
        store.createRecord('module-metadata', { title: 'Bac à sable', link: '/modules/bac-a-sable' });
        sinon.stub(model, 'save').rejects();

        // when
        const screen = await render(<template><TrainingDetails @model={{model}} /></template>);
        await click(screen.getByRole('button', { name: 'Modifier' }));
        await fillIn(
          screen.getByRole('textbox', {
            name: "Url du logo de l'éditeur (.svg) Exemple : https://assets.pix.org/contenu-formatif/editeur/pix-logo.svg",
          }),
          'bonjour!',
        );
        await click(screen.getByRole('button', { name: 'Modifier le contenu formatif' }));

        // then
        sinon.assert.calledWith(notificationErrorStub, {
          message: 'Une erreur est survenue.',
        });
        assert.ok(true);
      });
    });
  });
});
