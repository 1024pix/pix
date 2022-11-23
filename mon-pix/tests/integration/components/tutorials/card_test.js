import { module, test } from 'qunit';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Tutorials | Card', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when user is logged', function () {
    test('should render the component with actions', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        user = { firstName: 'John' };
      }

      this.owner.register('service:currentUser', CurrentUserStub);
      this.set('tutorial', {
        title: 'Mon super tutoriel',
        link: 'https://exemple.net/',
        source: 'mon-tuto',
        format: 'vidéo',
        duration: '00:01:00',
        isEvaluated: true,
        isSaved: true,
      });

      // when
      await render(hbs`<Tutorials::Card @tutorial={{this.tutorial}} />`);

      // then
      assert.dom('.tutorial-card').exists();
      assert.dom('.tutorial-card__content').exists();
      assert.ok(find('.tutorial-card-content__link').textContent.includes('Mon super tutoriel'));
      assert.equal(find('.tutorial-card-content__link').href, 'https://exemple.net/');
      assert.ok(find('.tutorial-card-content__details').textContent.includes('mon-tuto'));
      assert.ok(find('.tutorial-card-content__details').textContent.includes('vidéo'));
      assert.ok(find('.tutorial-card-content__details').textContent.includes('une minute'));
      assert.dom('.tutorial-card-content__actions').exists();
      assert.dom('[aria-label="Ne plus considérer ce tuto comme utile"]').exists();
      assert.dom('[aria-label="Retirer de ma liste de tutos"]').exists();
      assert.dom('[title="Ne plus considérer ce tuto comme utile"]').exists();
    });
  });

  module('when user is not logged', function () {
    test('should render the component without actions', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        user = null;
      }

      this.owner.register('service:currentUser', CurrentUserStub);
      this.set('tutorial', {
        title: 'Mon super tutoriel',
        link: 'https://exemple.net/',
        source: 'mon-tuto',
        format: 'vidéo',
        duration: '00:01:00',
        isEvaluated: true,
        isSaved: true,
      });

      // when
      await render(hbs`<Tutorials::Card @tutorial={{this.tutorial}} />`);

      // then
      assert.dom('.tutorial-card').exists();
      assert.dom('.tutorial-card__content').exists();
      assert.ok(find('.tutorial-card-content__link').textContent.includes('Mon super tutoriel'));
      assert.equal(find('.tutorial-card-content__link').href, 'https://exemple.net/');
      assert.ok(find('.tutorial-card-content__details').textContent.includes('mon-tuto'));
      assert.ok(find('.tutorial-card-content__details').textContent.includes('vidéo'));
      assert.ok(find('.tutorial-card-content__details').textContent.includes('une minute'));
      assert.dom('.tutorial-card-content__actions').doesNotExist();
    });
  });
});
