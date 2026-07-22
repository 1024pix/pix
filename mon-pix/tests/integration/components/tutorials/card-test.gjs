import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
// eslint-disable-next-line no-restricted-imports
import { click, find } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import Card from 'mon-pix/components/tutorials/card';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubCurrentUserService } from '../../../helpers/service-stubs';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Tutorials | Card', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when user is logged', function () {
    test('should render the component with actions', async function (assert) {
      // given
      stubCurrentUserService(this.owner);

      const store = this.owner.lookup('service:store');
      const tutorial = store.createRecord('tutorial', {
        title: 'Mon super tutoriel',
        link: 'https://exemple.net/',
        source: 'mon-tuto',
        format: 'vidéo',
        duration: '60',
        userSavedTutorial: store.createRecord('user-saved-tutorial', {}),
        tutorialEvaluation: store.createRecord('tutorial-evaluation', { status: 'LIKED' }),
      });

      // when
      const screen = await render(<template><Card @tutorial={{tutorial}} /></template>);

      // then
      const link = screen.getByRole('link', { name: 'Mon super tutoriel' });
      assert.strictEqual(link.getAttribute('href'), 'https://exemple.net/');
      assert.ok(find('.tutorial-card-content__details').textContent.includes('mon-tuto'));
      assert.ok(find('.tutorial-card-content__details').textContent.includes('vidéo'));
      assert.ok(find('.tutorial-card-content__details').textContent.includes('une minute'));
      assert.dom(screen.getByRole('list')).exists();
      const evaluationButton = screen.getByRole('button', { name: 'Ne plus considérer ce tuto comme utile' });
      assert.strictEqual(evaluationButton.title, 'Ne plus considérer ce tuto comme utile');
      assert.dom(screen.getByRole('button', { name: 'Retirer de ma liste de tutos' })).exists();
    });

    test('should display save and evaluate labels when tutorial is neither saved nor evaluated', async function (assert) {
      // given
      stubCurrentUserService(this.owner);

      const store = this.owner.lookup('service:store');
      const tutorial = store.createRecord('tutorial', {
        title: 'Mon super tutoriel',
        link: 'https://exemple.net/',
        source: 'mon-tuto',
        format: 'vidéo',
        duration: '60',
      });

      // when
      const screen = await render(<template><Card @tutorial={{tutorial}} /></template>);

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: t('pages.user-tutorials.list.tutorial.actions.evaluate.extra-information'),
          }),
        )
        .exists();
      assert
        .dom(screen.getByRole('button', { name: t('pages.user-tutorials.list.tutorial.actions.save.label') }))
        .exists();
    });
  });

  module('when user toggles save tutorial', function () {
    test('should save the tutorial and display the remove label when it is not yet saved', async function (assert) {
      // given
      stubCurrentUserService(this.owner);

      const store = this.owner.lookup('service:store');
      const tutorial = store.createRecord('tutorial', {
        title: 'Mon super tutoriel',
        link: 'https://exemple.net/',
        source: 'mon-tuto',
        format: 'vidéo',
        duration: '60',
      });

      const userSavedTutorial = { save: sinon.stub().resolves(null) };
      const originalCreateRecord = store.createRecord.bind(store);
      const createRecordStub = sinon.stub(store, 'createRecord');
      createRecordStub.callsFake((...args) =>
        args[0] === 'user-saved-tutorial' ? userSavedTutorial : originalCreateRecord(...args),
      );

      const screen = await render(<template><Card @tutorial={{tutorial}} /></template>);

      // when
      await click(screen.getByRole('button', { name: t('pages.user-tutorials.list.tutorial.actions.save.label') }));

      // then
      sinon.assert.calledWith(createRecordStub, 'user-saved-tutorial', { tutorial });
      sinon.assert.called(userSavedTutorial.save);
      assert
        .dom(screen.getByRole('button', { name: t('pages.user-tutorials.list.tutorial.actions.remove.label') }))
        .exists();
    });

    test('should remove the tutorial and display the save label when it is already saved', async function (assert) {
      // given
      stubCurrentUserService(this.owner);

      const store = this.owner.lookup('service:store');
      const userSavedTutorial = store.createRecord('user-saved-tutorial', {});
      const destroyRecordStub = sinon.stub(userSavedTutorial, 'destroyRecord').resolves(null);
      const tutorial = store.createRecord('tutorial', {
        title: 'Mon super tutoriel',
        link: 'https://exemple.net/',
        source: 'mon-tuto',
        format: 'vidéo',
        duration: '60',
        userSavedTutorial,
      });

      const screen = await render(<template><Card @tutorial={{tutorial}} /></template>);

      // when
      await click(screen.getByRole('button', { name: t('pages.user-tutorials.list.tutorial.actions.remove.label') }));

      // then
      sinon.assert.called(destroyRecordStub);
      assert
        .dom(screen.getByRole('button', { name: t('pages.user-tutorials.list.tutorial.actions.save.label') }))
        .exists();
    });
  });

  module('when user clicks on the tutorial link', function () {
    test('should push a metrics event', async function (assert) {
      // given
      const trackEventStub = sinon.stub();
      class PixMetricsStub extends Service {
        trackEvent = trackEventStub;
      }
      this.owner.register('service:pixMetrics', PixMetricsStub);

      class RouterStub extends Service {
        currentRouteName = 'current.route.name';
      }
      this.owner.register('service:router', RouterStub);

      const store = this.owner.lookup('service:store');
      const tutorial = store.createRecord('tutorial', {
        title: 'Mon super tutoriel',
        link: 'https://exemple.net/',
        source: 'mon-tuto',
        format: 'vidéo',
        duration: '60',
      });

      const screen = await render(<template><Card @tutorial={{tutorial}} /></template>);

      // when
      await click(screen.getByRole('link', { name: 'Mon super tutoriel' }));

      // then
      sinon.assert.calledWithExactly(trackEventStub, 'Ouvre le tutoriel', {
        category: 'Accès tuto',
        action: 'Clic depuis : current.route.name',
        title: 'Mon super tutoriel',
      });
      assert.ok(true);
    });
  });

  module('when user is not logged', function () {
    test('should render the component without actions', async function (assert) {
      // given
      stubCurrentUserService(this.owner, { isAuthenticated: false });

      const store = this.owner.lookup('service:store');
      const tutorial = store.createRecord('tutorial', {
        title: 'Mon super tutoriel',
        link: 'https://exemple.net/',
        source: 'mon-tuto',
        format: 'vidéo',
        duration: '60',
        userSavedTutorial: store.createRecord('user-saved-tutorial', {}),
        tutorialEvaluation: store.createRecord('tutorial-evaluation', { status: 'LIKED' }),
      });

      // when
      const screen = await render(<template><Card @tutorial={{tutorial}} /></template>);

      // then
      const link = screen.getByRole('link', { name: 'Mon super tutoriel' });
      assert.strictEqual(link.getAttribute('href'), 'https://exemple.net/');
      assert.ok(find('.tutorial-card-content__details').textContent.includes('mon-tuto'));
      assert.ok(find('.tutorial-card-content__details').textContent.includes('vidéo'));
      assert.ok(find('.tutorial-card-content__details').textContent.includes('une minute'));
      assert.dom(screen.queryByRole('list')).doesNotExist();
    });
  });

  module('link referrer policy', function () {
    test('should set referrerpolicy="strict-origin" on external links', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const tutorial = store.createRecord('tutorial', {
        title: 'Mon super tutoriel',
        link: 'https://exemple.net/',
        source: 'mon-tuto',
        format: 'vidéo',
        duration: '60',
        userSavedTutorial: store.createRecord('user-saved-tutorial', {}),
        tutorialEvaluation: store.createRecord('tutorial-evaluation', { status: 'LIKED' }),
      });

      // when
      const screen = await render(<template><Card @tutorial={{tutorial}} /></template>);

      // then
      const link = screen.getByRole('link', { name: 'Mon super tutoriel' });
      assert.strictEqual(link.getAttribute('referrerpolicy'), 'strict-origin');
    });

    test('should not set rel="noreferrer" on internal links', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const tutorial = store.createRecord('tutorial', {
        title: 'Mon super tutoriel',
        link: 'https://tutorial.pix.fr:443/known-link',
        source: 'mon-tuto',
        format: 'vidéo',
        duration: '60',
        userSavedTutorial: store.createRecord('user-saved-tutorial', {}),
        tutorialEvaluation: store.createRecord('tutorial-evaluation', { status: 'LIKED' }),
      });

      // when
      const screen = await render(<template><Card @tutorial={{tutorial}} /></template>);

      // then
      const tutorialLink = screen.getByRole('link', { name: 'Mon super tutoriel' });
      assert.strictEqual(tutorialLink.getAttribute('rel'), null);
    });
  });
});
