import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ContentSection from 'pix-admin/components/combined-course-blueprints/form/content-section';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | CombinedCourseBlueprints::Form::ContentSection', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should not allow user to add an item unless type option is checked and item id is filled', async function (assert) {
    //when
    const screen = await renderContentSection(this.owner);

    //then
    assert
      .dom(screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }))
      .hasAttribute('aria-disabled');
  });

  module('error cases', function () {
    test('it should display an error if target profile does not exist', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const pixToast = this.owner.lookup('service:pixToast');
      const pixToastErrorStub = sinon.stub(pixToast, 'sendErrorNotification');

      const findRecordStub = sinon.stub(store, 'findRecord');
      findRecordStub
        .withArgs('target-profile')
        .rejects({ errors: [{ status: '404', detail: 'Le profil cible est introuvable' }] });

      //when
      const screen = await renderContentSection(this.owner);

      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }),
        1,
      );

      assert
        .dom(screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }))
        .hasAttribute('aria-disabled');

      //then
      assert.ok(
        pixToastErrorStub.calledOnceWith({
          message: t('components.combined-course-blueprints.create.notifications.campaignNotFound'),
        }),
      );
    });

    test('it should display an error if module does not exist', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const pixToast = this.owner.lookup('service:pixToast');
      const pixToastErrorStub = sinon.stub(pixToast, 'sendErrorNotification');

      const findRecordStub = sinon.stub(store, 'findRecord');
      findRecordStub.withArgs('module').rejects({ errors: [{ status: '404', detail: 'Le module est introuvable' }] });

      //when
      const screen = await renderContentSection(this.owner);

      await click(screen.getByLabelText(t('components.combined-course-blueprints.labels.module')));
      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }),
        'module-123',
      );
      //then
      assert.ok(
        pixToastErrorStub.calledOnceWith({
          message: t('components.combined-course-blueprints.create.notifications.moduleNotFound'),
        }),
      );
    });

    test('it should display an error if fetching ressource failed', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const pixToast = this.owner.lookup('service:pixToast');
      const pixToastErrorStub = sinon.stub(pixToast, 'sendErrorNotification');

      const findRecordStub = sinon.stub(store, 'findRecord');
      findRecordStub.withArgs('target-profile').rejects();

      //when
      const screen = await renderContentSection(this.owner);

      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }),
        1,
      );
      await click(
        screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }),
      );

      //then
      assert.ok(
        pixToastErrorStub.calledOnceWith({
          message: t('components.combined-course-blueprints.create.notifications.addItemError'),
        }),
      );
    });
  });

  module('combined course blueprint items', function () {
    test('should display tag for item when added', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const findRecordStub = sinon.stub(store, 'findRecord');
      findRecordStub
        .withArgs('module', 'module123')
        .resolves({ id: 'full-id-module123', shortId: 'module123', title: 'module 123' });
      findRecordStub.withArgs('target-profile', '1').resolves({ internalName: 'super pc', areas: [] });

      //when
      const screen = await renderContentSection(this.owner);

      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }),
        1,
      );
      await click(
        screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }),
      );

      await click(screen.getByLabelText(t('components.combined-course-blueprints.labels.module')));
      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }),
        'module123',
      );

      await click(
        screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }),
      );

      assert.ok(screen.getByText('Profil cible'));
      assert.ok(screen.getByText('Module'));
    });

    test('it should remove item when user clicks on remove button', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const findRecordStub = sinon.stub(store, 'findRecord');

      findRecordStub.withArgs('target-profile', '1').resolves({ internalName: 'super pc', areas: [] });

      //when
      const screen = await renderContentSection(this.owner);

      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }),
        1,
      );
      await click(
        screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }),
      );

      assert.ok(screen.getByRole('cell', { name: /super pc/ }));
      await click(screen.getByRole('button', { name: 'Supprimer' }));

      //then
      assert.notOk(screen.queryByRole('cell', { name: /super pc/ }));
    });

    test('it should remove only the selected item in a list of duplicates when user clicks on remove button', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const findRecordStub = sinon.stub(store, 'findRecord');

      findRecordStub.withArgs('target-profile', '1').resolves({ internalName: 'super pc', areas: [] });

      //when
      const screen = await renderContentSection(this.owner);

      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }),
        1,
      );
      await click(
        screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }),
      );
      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }),
        1,
      );
      await click(
        screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }),
      );

      let itemsInTable = screen.getAllByRole('cell', { name: /super pc/ });
      assert.strictEqual(itemsInTable.length, 2);

      await click(screen.getByTestId('delete-1'));

      //then
      itemsInTable = screen.getAllByRole('cell', { name: /super pc/ });
      assert.strictEqual(itemsInTable.length, 1);
    });
  });
});

function renderContentSection(owner) {
  const blueprint = owner.lookup('service:store').createRecord('combined-course-blueprint', { content: [] });
  const onAreasChange = sinon.stub();

  return render(<template><ContentSection @blueprint={{blueprint}} @onAreasChange={{onAreasChange}} /></template>);
}
