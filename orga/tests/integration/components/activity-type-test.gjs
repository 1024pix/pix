import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import ActivityType from 'pix-orga/components/activity-type';
import { module, test } from 'qunit';

module('Integration | Component | ActivityType', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');

  module('when rendering different activity types', function () {
    test('it renders ASSESSMENT type with correct icon and label', async function (assert) {
      // when
      const screen = await render(<template><ActivityType @type="ASSESSMENT" /></template>);

      // then
      assert.dom('.activity-type').exists();
      assert.dom('.activity-type__icon--assessment').exists();
      assert.ok(screen.getByText(t('components.activity-type.explanation.ASSESSMENT')));
    });

    test('it renders PROFILES_COLLECTION type with correct icon and label', async function (assert) {
      // when
      const screen = await render(<template><ActivityType @type="PROFILES_COLLECTION" /></template>);

      // then
      assert.dom('.activity-type').exists();
      assert.dom('.activity-type__icon--profiles-collection').exists();
      assert.ok(screen.getByText(t('components.activity-type.explanation.PROFILES_COLLECTION')));
    });

    test('it renders EXAM type with correct icon and label', async function (assert) {
      // when
      const screen = await render(<template><ActivityType @type="EXAM" /></template>);

      // then
      assert.dom('.activity-type').exists();
      assert.dom('.activity-type__icon--exam').exists();
      assert.ok(screen.getByText(t('components.activity-type.explanation.EXAM')));
    });

    test('it renders COMBINED_COURSE type with correct icon and label', async function (assert) {
      // when
      const screen = await render(<template><ActivityType @type="COMBINED_COURSE" /></template>);

      // then
      assert.dom('.activity-type').exists();
      assert.dom('.activity-type__icon--combined-course').exists();
      assert.ok(screen.getByText(t('components.activity-type.explanation.COMBINED_COURSE')));
    });

    test('it renders module type with correct icon and label', async function (assert) {
      // when
      const screen = await render(<template><ActivityType @type="module" /></template>);

      // then
      assert.dom('.activity-type').exists();
      assert.dom('.activity-type__icon--module').exists();
      assert.ok(screen.getByText(t('components.activity-type.explanation.module')));
    });

    test('it renders formation type with correct icon and label', async function (assert) {
      // when
      const screen = await render(<template><ActivityType @type="formation" /></template>);

      // then
      assert.dom('.activity-type').exists();
      assert.dom('.activity-type__icon--formation').exists();
      assert.ok(screen.getByText(t('components.activity-type.explanation.formation')));
    });

    test('it renders campaign type with assessment icon and label', async function (assert) {
      // when
      const screen = await render(<template><ActivityType @type="campaign" /></template>);

      // then
      assert.dom('.activity-type').exists();
      assert.dom('.activity-type__icon--assessment').exists();
      assert.ok(screen.getByText(t('components.activity-type.explanation.campaign')));
    });
  });

  module('when displayInformationLabel is true', function () {
    test('it displays information label instead of explanation label', async function (assert) {
      // when
      const screen = await render(
        <template><ActivityType @type="ASSESSMENT" @displayInformationLabel={{true}} /></template>,
      );

      // then
      assert.ok(screen.getByText(t('components.activity-type.information.ASSESSMENT')));
      assert.notOk(screen.queryByText(t('components.activity-type.explanation.ASSESSMENT')));
    });
  });

  module('when hideLabel is true', function () {
    test('it hides the label', async function (assert) {
      // when
      await render(<template><ActivityType @type="ASSESSMENT" @hideLabel={{true}} /></template>);

      // then
      assert.dom('.activity-type__label').doesNotExist();
      assert.dom('.activity-type__icon').exists();
    });
  });

  module('when hideLabel is false', function () {
    test('it shows the label', async function (assert) {
      // when
      const screen = await render(<template><ActivityType @type="ASSESSMENT" @hideLabel={{false}} /></template>);

      // then
      assert.dom('.activity-type__label').exists();
      assert.ok(screen.getByText(t('components.activity-type.explanation.ASSESSMENT')));
    });
  });

  module('when big is true', function () {
    test('it adds big modifier class to icon', async function (assert) {
      // when
      await render(<template><ActivityType @type="ASSESSMENT" @big={{true}} /></template>);

      // then
      assert.dom('.activity-type__icon--big').exists();
    });
  });

  module('when big is false', function () {
    test('it does not add big modifier class to icon', async function (assert) {
      // when
      await render(<template><ActivityType @type="ASSESSMENT" @big={{false}} /></template>);

      // then
      assert.dom('.activity-type__icon--big').doesNotExist();
    });
  });
});
