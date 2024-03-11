import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
// eslint-disable-next-line no-restricted-imports
import { find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Tutorials | Card', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when user is logged', function () {
    test('should render the component with actions', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        user = { firstName: 'John' };
      }

      const store = this.owner.lookup('service:store');
      this.owner.register('service:currentUser', CurrentUserStub);
      this.set(
        'tutorial',
        store.createRecord('tutorial', {
          title: 'Mon super tutoriel',
          link: 'https://exemple.net/',
          source: 'mon-tuto',
          format: 'vidéo',
          duration: '60',
          userSavedTutorial: store.createRecord('user-saved-tutorial', {}),
          tutorialEvaluation: store.createRecord('tutorial-evaluation', { status: 'LIKED' }),
        }),
      );

      // when
      const screen = await render(hbs`<Tutorials::Card @tutorial={{this.tutorial}} />`);

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
  });

  module('when user is not logged', function () {
    test('should render the component without actions', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        user = null;
      }

      const store = this.owner.lookup('service:store');
      this.owner.register('service:currentUser', CurrentUserStub);
      this.set(
        'tutorial',
        store.createRecord('tutorial', {
          title: 'Mon super tutoriel',
          link: 'https://exemple.net/',
          source: 'mon-tuto',
          format: 'vidéo',
          duration: '60',
          userSavedTutorial: store.createRecord('user-saved-tutorial', {}),
          tutorialEvaluation: store.createRecord('tutorial-evaluation', { status: 'LIKED' }),
        }),
      );

      // when
      const screen = await render(hbs`<Tutorials::Card @tutorial={{this.tutorial}} />`);

      // then
      const link = screen.getByRole('link', { name: 'Mon super tutoriel' });
      assert.strictEqual(link.getAttribute('href'), 'https://exemple.net/');
      assert.ok(find('.tutorial-card-content__details').textContent.includes('mon-tuto'));
      assert.ok(find('.tutorial-card-content__details').textContent.includes('vidéo'));
      assert.ok(find('.tutorial-card-content__details').textContent.includes('une minute'));
      assert.dom(screen.queryByRole('list')).doesNotExist();
    });
  });

  module('link rel', function () {
    test('should set rel="noreferrer" on external links', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      this.set(
        'tutorial',
        store.createRecord('tutorial', {
          title: 'Mon super tutoriel',
          link: 'https://exemple.net/',
          source: 'mon-tuto',
          format: 'vidéo',
          duration: '60',
          userSavedTutorial: store.createRecord('user-saved-tutorial', {}),
          tutorialEvaluation: store.createRecord('tutorial-evaluation', { status: 'LIKED' }),
        }),
      );

      // when
      const screen = await render(hbs`<Tutorials::Card @tutorial={{this.tutorial}} />`);

      // then
      const link = screen.getByRole('link', { name: 'Mon super tutoriel' });
      assert.strictEqual(link.getAttribute('rel'), 'noreferrer');
    });

    test('should not set rel="noreferrer" on internal links', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      this.set(
        'tutorial',
        store.createRecord('tutorial', {
          title: 'Mon super tutoriel',
          link: 'https://tutorial.pix.fr:443/known-link',
          source: 'mon-tuto',
          format: 'vidéo',
          duration: '60',
          userSavedTutorial: store.createRecord('user-saved-tutorial', {}),
          tutorialEvaluation: store.createRecord('tutorial-evaluation', { status: 'LIKED' }),
        }),
      );

      // when
      const screen = await render(hbs`<Tutorials::Card @tutorial={{this.tutorial}} />`);

      // then
      const tutorialLink = screen.getByRole('link', { name: 'Mon super tutoriel' });
      assert.strictEqual(tutorialLink.getAttribute('rel'), null);
    });
  });
});
