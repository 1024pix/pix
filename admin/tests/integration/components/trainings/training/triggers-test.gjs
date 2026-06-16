import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import TrainingTriggers from 'pix-admin/templates/authenticated/trainings/training/triggers';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Trainings | Training | TrainingTriggers', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when prerequisite is not defined', function () {
    test('should not display deletion button', async function (assert) {
      // given
      const serviceRouter = this.owner.lookup('service:router');
      sinon.stub(serviceRouter, 'currentRoute').value({ localName: 'triggers' });
      class AccessControlStub extends Service {
        hasAccessToTrainingsActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('training', {
        id: '12',
        title: 'title',
        internalTitle: 'internalTitle',
        link: 'my-training-link',
        type: 'webinaire',
        locales: ['fr-fr'],
        triggersorName: 'Albert',
        triggersorLogoUrl: 'http://localhost:4202/logo-placeholder.png',
        isRecommendable: true,
        isDisabled: false,
      });
      store.createRecord('module-metadata', { title: 'Bac à sable', link: '/modules/bac-a-sable' });

      store.createRecord('training-trigger', {
        type: 'goal',
        threshold: '80',
        areas: [],
      });

      // when
      const screen = await render(<template><TrainingTriggers @model={{model}} /></template>);

      // then
      assert.notOk(
        screen.queryByRole('button', { name: t('pages.trainings.training.delete.button.prerequisite-label') }),
      );
    });
  });

  module('when goal is not defined', function () {
    test('should not display deletion button', async function (assert) {
      // given
      const serviceRouter = this.owner.lookup('service:router');
      sinon.stub(serviceRouter, 'currentRoute').value({ localName: 'triggers' });
      class AccessControlStub extends Service {
        hasAccessToTrainingsActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('training', {
        id: '12',
        title: 'title',
        internalTitle: 'internalTitle',
        link: 'my-training-link',
        type: 'webinaire',
        locales: ['fr-fr'],
        triggersorName: 'Albert',
        triggersorLogoUrl: 'http://localhost:4202/logo-placeholder.png',
        isRecommendable: true,
        isDisabled: false,
      });
      store.createRecord('module-metadata', { title: 'Bac à sable', link: '/modules/bac-a-sable' });

      store.createRecord('training-trigger', {
        type: 'prerequisite',
        threshold: '80',
        areas: [],
      });

      // when
      const screen = await render(<template><TrainingTriggers @model={{model}} /></template>);

      // then
      assert.notOk(screen.queryByRole('button', { name: t('pages.trainings.training.delete.button.goal-label') }));
    });
  });

  module('when trigger is defined', function () {
    test('should display deletion button when trigger is defined', async function (assert) {
      // given
      const serviceRouter = this.owner.lookup('service:router');
      sinon.stub(serviceRouter, 'currentRoute').value({ localName: 'triggers' });
      class AccessControlStub extends Service {
        hasAccessToTrainingsActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('training', {
        id: '12',
        title: 'title',
        internalTitle: 'internalTitle',
        link: 'my-training-link',
        type: 'webinaire',
        locales: ['fr-fr'],
        triggersorName: 'Albert',
        triggersorLogoUrl: 'http://localhost:4202/logo-placeholder.png',
        isRecommendable: true,
        isDisabled: false,
      });
      store.createRecord('module-metadata', { title: 'Bac à sable', link: '/modules/bac-a-sable' });
      store.createRecord('training-trigger', {
        id: '6',
        type: 'goal',
        threshold: '80',
        areas: [],
        training: model,
      });
      store.createRecord('training-trigger', {
        id: '7',
        type: 'prerequisite',
        threshold: '80',
        areas: [],
        training: model,
      });

      // when
      const screen = await render(<template><TrainingTriggers @model={{model}} /></template>);

      // then
      assert.ok(screen.getByRole('button', { name: t('pages.trainings.training.delete.button.goal-label') }));
      assert.ok(screen.getByRole('button', { name: t('pages.trainings.training.delete.button.prerequisite-label') }));
    });

    test('should call adapter with correct parameter', async function (assert) {
      // given
      const serviceRouter = this.owner.lookup('service:router');
      sinon.stub(serviceRouter, 'currentRoute').value({ localName: 'triggers' });
      class AccessControlStub extends Service {
        hasAccessToTrainingsActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('training', {
        id: '12',
        title: 'title',
        internalTitle: 'internalTitle',
        link: 'my-training-link',
        type: 'webinaire',
        locales: ['fr-fr'],
        triggersorName: 'Albert',
        triggersorLogoUrl: 'http://localhost:4202/logo-placeholder.png',
        isRecommendable: true,
        isDisabled: false,
      });
      store.createRecord('module-metadata', { title: 'Bac à sable', link: '/modules/bac-a-sable' });
      store.createRecord('training-trigger', {
        id: '6',
        type: 'goal',
        threshold: '80',
        areas: [],
        training: model,
      });
      store.createRecord('training-trigger', {
        id: '7',
        type: 'prerequisite',
        threshold: '80',
        areas: [],
        training: model,
      });
      const reloadStub = sinon.stub(model, 'reload');
      const adapter = store.adapterFor('training-trigger');
      const deleteTriggerAdapterStub = sinon.stub(adapter, 'delete');
      const notificationSuccessStub = sinon.stub();
      class NotificationsStub extends Service {
        sendSuccessNotification = notificationSuccessStub;
      }
      this.owner.register('service:pixToast', NotificationsStub);

      deleteTriggerAdapterStub.withArgs({ trainingId: 12, triggerId: 6 }).resolves();

      // when
      const screen = await render(<template><TrainingTriggers @model={{model}} /></template>);
      await click(screen.getByRole('button', { name: t('pages.trainings.training.delete.button.goal-label') }));
      await screen.findByRole('dialog');
      await click(screen.getByRole('button', { name: t('common.actions.validate') }));

      // then
      assert.ok(deleteTriggerAdapterStub.calledOnce);
      assert.ok(reloadStub.calledOnce);
      assert.ok(notificationSuccessStub.calledOnce);
    });
  });
});
