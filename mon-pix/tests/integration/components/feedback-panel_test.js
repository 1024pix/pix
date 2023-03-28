import { resolve } from 'rsvp';
import Service from '@ember/service';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { blur, click, find, findAll, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { clickByLabel } from '../../helpers/click-by-label';
import { contains } from '../../helpers/contains';

const OPEN_FEEDBACK_BUTTON = '.feedback-panel__open-button';
const BUTTON_SEND = '.feedback-panel__button--send';

const TEXTAREA = 'textarea.feedback-panel__field--content';
const DROPDOWN = '.feedback-panel__dropdown';
const CATEGORY_DROPDOWN = 'select[data-test-feedback-category-dropdown]';
const SUBCATEGORY_DROPDOWN = 'select[data-test-feedback-subcategory-dropdown]';
const TUTORIAL_AREA = '.feedback-panel__quick-help';

const PICK_SELECT_OPTION_WITH_NESTED_LEVEL = 'question';
const PICK_ANOTHER_SELECT_OPTION_WITH_NESTED_LEVEL = 'embed';
const PICK_SELECT_OPTION_WITH_TEXTAREA = 'accessibility';
const PICK_SELECT_OPTION_WITH_TUTORIAL = 'picture';
const PICK_SELECT_OPTION_WITH_TEXTAREA_AND_TUTORIAL = '3';

async function setContent(content) {
  await fillIn(DROPDOWN, PICK_SELECT_OPTION_WITH_TEXTAREA);
  await fillIn(TEXTAREA, content);
  await blur(TEXTAREA);
}

module('Integration | Component | feedback-panel', function (hooks) {
  setupIntlRenderingTest(hooks);

  class StoreStub extends Service {
    createRecord() {
      return Object.create({
        save() {
          return resolve();
        },
      });
    }
  }

  module('Default rendering', function (hooks) {
    hooks.beforeEach(async function () {
      const assessment = { id: 'assessment_id' };
      const challenge = { id: 'challenge_id' };

      this.set('assessment', assessment);
      this.set('challenge', challenge);

      this.owner.unregister('service:store');
      this.owner.register('service:store', StoreStub);

      await render(hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} />`);
    });

    test('should not display the feedback form', async function (assert) {
      // then
      assert.dom('.feedback-panel__form').doesNotExist();
    });

    test('should display the "mercix" view when clicking on send button', async function (assert) {
      // given
      await click(OPEN_FEEDBACK_BUTTON);
      const CONTENT_VALUE = 'Prêtes-moi ta plume, pour écrire un mot';
      await setContent(CONTENT_VALUE);

      // when
      await clickByLabel(this.intl.t('pages.challenge.feedback-panel.form.actions.submit'));

      // then
      assert.dom('.feedback-panel__view--form').doesNotExist();
      assert.dom('.feedback-panel__view--mercix').exists();
    });

    module('when selecting a category', function () {
      test('should display a second dropdown with the list of questions when category have a nested level', async function (assert) {
        // when
        await click(OPEN_FEEDBACK_BUTTON);
        await fillIn(CATEGORY_DROPDOWN, PICK_SELECT_OPTION_WITH_NESTED_LEVEL);

        // then
        assert.strictEqual(findAll(DROPDOWN).length, 2);
        assert.dom(TEXTAREA).doesNotExist();
        assert.dom(BUTTON_SEND).doesNotExist();
      });

      test('should directly display the message box and the submit button when category has a textarea', async function (assert) {
        // when
        await click(OPEN_FEEDBACK_BUTTON);
        await fillIn(CATEGORY_DROPDOWN, PICK_SELECT_OPTION_WITH_TEXTAREA);

        // then
        assert.strictEqual(findAll(DROPDOWN).length, 1);
        assert.dom(TEXTAREA).exists();
        assert.ok(contains(this.intl.t('pages.challenge.feedback-panel.form.actions.submit')));
      });

      test('should directly display the tuto without the textbox or the send button when category has a tutorial', async function (assert) {
        // when
        await click(OPEN_FEEDBACK_BUTTON);
        await fillIn(CATEGORY_DROPDOWN, PICK_SELECT_OPTION_WITH_TUTORIAL);

        // then
        assert.strictEqual(findAll(DROPDOWN).length, 2);
        assert.dom(BUTTON_SEND).doesNotExist();
        assert.dom(TEXTAREA).doesNotExist();
      });

      test('should show the correct feedback action when selecting two different categories', async function (assert) {
        // when
        await click(OPEN_FEEDBACK_BUTTON);
        await fillIn(CATEGORY_DROPDOWN, PICK_SELECT_OPTION_WITH_TUTORIAL);
        await fillIn(CATEGORY_DROPDOWN, PICK_SELECT_OPTION_WITH_TEXTAREA);

        // then
        assert.strictEqual(findAll(DROPDOWN).length, 1);
        assert.dom(TUTORIAL_AREA).doesNotExist();
        assert.ok(contains(this.intl.t('pages.challenge.feedback-panel.form.actions.submit')));
        assert.dom(TEXTAREA).exists();
      });

      test('should hide the second dropdown when category has fewer levels after a deeper category', async function (assert) {
        // when
        await click(OPEN_FEEDBACK_BUTTON);
        await fillIn(CATEGORY_DROPDOWN, PICK_SELECT_OPTION_WITH_NESTED_LEVEL);
        await fillIn(CATEGORY_DROPDOWN, PICK_SELECT_OPTION_WITH_TEXTAREA);

        // then
        assert.strictEqual(findAll(DROPDOWN).length, 1);
        assert.dom(TUTORIAL_AREA).doesNotExist();
        assert.ok(contains(this.intl.t('pages.challenge.feedback-panel.form.actions.submit')));
        assert.dom(TEXTAREA).exists();
      });

      test('should display tutorial with textarea with selecting related category and subcategory', async function (assert) {
        // when
        await click(OPEN_FEEDBACK_BUTTON);
        await fillIn(CATEGORY_DROPDOWN, PICK_ANOTHER_SELECT_OPTION_WITH_NESTED_LEVEL);
        await fillIn(SUBCATEGORY_DROPDOWN, PICK_SELECT_OPTION_WITH_TEXTAREA_AND_TUTORIAL);

        // then
        assert.strictEqual(findAll(DROPDOWN).length, 2);
        assert.dom(TUTORIAL_AREA).exists();
        assert.dom(TEXTAREA).exists();
        assert.ok(contains(this.intl.t('pages.challenge.feedback-panel.form.actions.submit')));
      });
    });
  });

  module('When assessment is not of type certification', function (hooks) {
    hooks.beforeEach(async function () {
      await render(hbs`<FeedbackPanel />`);
    });

    test('should display the feedback panel', function (assert) {
      assert.dom('.feedback-panel__view--link').exists();
    });

    test('should toggle the form view when clicking on the toggle link', async function (assert) {
      // when
      await click(OPEN_FEEDBACK_BUTTON);

      // then
      assert.dom('.feedback-panel__view--form').exists();

      // then when
      await click(OPEN_FEEDBACK_BUTTON);

      // then
      assert.dom('.feedback-panel__view--form').doesNotExist();
    });
  });

  module('When assessment is of type certification', function (hooks) {
    hooks.beforeEach(async function () {
      const assessment = {
        isCertification: true,
      };
      this.set('assessment', assessment);

      await render(hbs`<FeedbackPanel @assessment={{this.assessment}} @context={{this.context}} />`);
    });

    test('should display the feedback certification section', async function (assert) {
      // when
      await click(OPEN_FEEDBACK_BUTTON);

      // then
      assert.dom('.feedback-certification-section__div').exists();
    });
  });

  module('When FeedbackPanel is rendered initially opened (e.g. in a comparison-window)', function (hooks) {
    hooks.beforeEach(async function () {
      const assessment = { id: 'assessment_id' };
      const challenge = { id: 'challenge_id' };

      this.set('assessment', assessment);
      this.set('challenge', challenge);
      this.set('alwaysOpenForm', true);

      await render(
        hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} @alwaysOpenForm={{this.alwaysOpenForm}} />`
      );
    });

    test('should display the "form" view', async function (assert) {
      assert.dom('.feedback-panel__view--form').exists();
      assert.strictEqual(findAll(DROPDOWN).length, 1);
    });

    test('should not be able to hide the form view', async function (assert) {
      // then
      assert.true(find(OPEN_FEEDBACK_BUTTON).disabled);
      assert.dom('.feedback-panel__form').exists();
    });
  });

  module('When FeedbackPanel is rendered initially closed (e.g. in a challenge)', function (hooks) {
    hooks.beforeEach(async function () {
      const assessment = { id: 'assessment_id' };
      const challenge = { id: 'challenge_id' };

      this.set('assessment', assessment);
      this.set('challenge', challenge);

      await render(hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} />`);
      await click(OPEN_FEEDBACK_BUTTON);
    });

    test('should display the "form" view', async function (assert) {
      assert.dom('.feedback-panel__view--form').exists();
      assert.strictEqual(findAll(DROPDOWN).length, 1);
    });

    test('should be able to hide the form view', async function (assert) {
      // when
      await click(OPEN_FEEDBACK_BUTTON);

      // then
      assert.dom('.feedback-panel__form').doesNotExist();
    });
  });

  module('Error management', function (hooks) {
    hooks.beforeEach(async function () {
      await render(hbs`<FeedbackPanel />`);
      await click(OPEN_FEEDBACK_BUTTON);
    });

    test('should display error if "content" is empty', async function (assert) {
      // given
      await fillIn(CATEGORY_DROPDOWN, PICK_SELECT_OPTION_WITH_TEXTAREA);

      // when
      await clickByLabel(this.intl.t('pages.challenge.feedback-panel.form.actions.submit'));

      // then
      assert.dom('.feedback-panel__alert').exists();
    });

    test('should display error if "content" is blank', async function (assert) {
      // given
      await setContent('');

      // when
      await clickByLabel(this.intl.t('pages.challenge.feedback-panel.form.actions.submit'));

      // then
      assert.dom('.feedback-panel__alert').exists();
    });

    test('should not display error if "form" view (with error) was closed and re-opened', async function (assert) {
      // given
      await setContent('   ');
      await clickByLabel(this.intl.t('pages.challenge.feedback-panel.form.actions.submit'));

      // when
      await click(OPEN_FEEDBACK_BUTTON);
      await click(OPEN_FEEDBACK_BUTTON);

      // then
      assert.dom('.feedback-panel__alert').doesNotExist();
    });
  });
});
