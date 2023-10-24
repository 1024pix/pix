import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import sinon from 'sinon';

module('Unit | Component | session-supervising/candidate-in-list', function (hooks) {
  setupTest(hooks);

  module('validateLiveAlert', function () {
    module('when there is no error', function () {
      test('it should call the method with the correct arguments', async function (assert) {
        // given
        const subcategory = 'EMBED_NOT_WORKING';
        const component = createGlimmerComponent('component:session-supervising/candidate-in-list');
        component.args.sessionId = 123;
        component.args.candidate = { userId: 456 };
        component.notifications = { error: sinon.spy() };
        const store = this.owner.lookup('service:store');
        const adapter = store.adapterFor('session');
        adapter.validateLiveAlert = sinon.stub();
        adapter.validateLiveAlert.resolves();

        class IntlStub extends Service {
          t = sinon.stub();
        }

        this.owner.register('service:intl', IntlStub);

        // when
        await component.validateLiveAlert(subcategory);

        // then
        sinon.assert.calledWithExactly(adapter.validateLiveAlert, { sessionId: 123, candidateId: 456, subcategory });
        sinon.assert.notCalled(component.notifications.error);
        assert.ok(true);
      });
    });

    module('when there is an error', function () {
      test('it should call the notification service', async function (assert) {
        // given
        const subcategory = 'EMBED_NOT_WORKING';
        const component = createGlimmerComponent('component:session-supervising/candidate-in-list');
        component.args.sessionId = 123;
        component.args.candidate = { userId: 456 };
        component.notifications = { error: sinon.spy() };
        const store = this.owner.lookup('service:store');
        const adapter = store.adapterFor('session');
        adapter.validateLiveAlert = sinon.stub();
        adapter.validateLiveAlert.rejects();

        class IntlStub extends Service {
          t = sinon.stub();
        }

        this.owner.register('service:intl', IntlStub);

        // when
        await component.validateLiveAlert(subcategory);

        // then
        sinon.assert.calledOnce(component.notifications.error);
        assert.ok(true);
      });
    });
  });

  module('rejectLiveAlert', function () {
    module('when there is no error', function () {
      test('it should call the method with the correct arguments', async function (assert) {
        // given
        const component = createGlimmerComponent('component:session-supervising/candidate-in-list');
        component.args.sessionId = 123;
        component.args.candidate = { userId: 456 };
        component.notifications = { error: sinon.spy() };
        const store = this.owner.lookup('service:store');
        const adapter = store.adapterFor('session');
        adapter.dismissLiveAlert = sinon.stub();
        adapter.dismissLiveAlert.resolves();

        class IntlStub extends Service {
          t = sinon.stub();
        }

        this.owner.register('service:intl', IntlStub);

        // when
        await component.rejectLiveAlert();

        // then
        sinon.assert.calledWithExactly(adapter.dismissLiveAlert, 123, 456);
        sinon.assert.notCalled(component.notifications.error);
        assert.ok(true);
      });
    });

    module('when there is an error', function () {
      test('it should call the notification service', async function (assert) {
        // given
        const component = createGlimmerComponent('component:session-supervising/candidate-in-list');
        component.args.sessionId = 123;
        component.args.candidate = { userId: 456 };
        component.notifications = { error: sinon.spy() };
        const store = this.owner.lookup('service:store');
        const adapter = store.adapterFor('session');
        adapter.dismissLiveAlert = sinon.stub();
        adapter.dismissLiveAlert.rejects();

        class IntlStub extends Service {
          t = sinon.stub();
        }

        this.owner.register('service:intl', IntlStub);

        // when
        await component.rejectLiveAlert();

        // then
        sinon.assert.calledOnce(component.notifications.error);
        assert.ok(true);
      });
    });
  });
});
