import { render } from '@1024pix/ember-testing-library';
import { click, tab } from '@ember/test-helpers';
import userEvent from '@testing-library/user-event';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | Tabs', function (hooks) {
  setupRenderingTest(hooks);

  module('default behaviour', function (hooks) {
    let screen;

    hooks.beforeEach(async function () {
      this.handleTabChange = sinon.spy();

      screen = await render(hbs`{{! template-lint-disable no-bare-strings }}
<Tabs @ariaLabel='Sample tabs' @onTabChange={{this.handleTabChange}}>
  <:tabs as |Tab|>
    <Tab @index={{0}}>First tab label</Tab>
    <Tab @index={{1}}>Second tab label</Tab>
    <Tab @index={{2}}>Third tab label</Tab>
  </:tabs>

  <:panels as |Panel|>
    <Panel @index={{0}}>
      <h2>First panel</h2>
    </Panel>
    <Panel @index={{1}}>
      <h2>Second panel</h2>
    </Panel>
    <Panel @index={{2}}>
      <h2>Third panel</h2>
    </Panel>
  </:panels>
</Tabs>`);
    });

    module('on first render', function () {
      test('it displays the first tab', async function (assert) {
        assert.dom(screen.getByRole('tablist')).hasAttribute('aria-label', 'Sample tabs');

        assert.strictEqual(screen.getAllByRole('tab').length, 3);
        assert.dom(screen.getByRole('tab', { name: 'First tab label' })).hasAttribute('aria-selected', 'true');
        assert.dom(screen.getByRole('tab', { name: 'Second tab label' })).hasAttribute('aria-selected', 'false');
        assert.dom(screen.getByRole('tab', { name: 'Third tab label' })).hasAttribute('aria-selected', 'false');

        assert.strictEqual(screen.getAllByRole('tabpanel').length, 1);
        assert.dom(screen.getByText('First panel')).exists();
      });
    });

    module('on tab click', function () {
      test('it displays the right tab and calls onTabChange', async function (assert) {
        // when
        await click(screen.getByRole('tab', { name: 'Second tab label' }));

        // then
        assert.dom(screen.getByRole('tab', { name: 'First tab label' })).hasAttribute('aria-selected', 'false');
        assert.dom(screen.getByRole('tab', { name: 'Second tab label' })).hasAttribute('aria-selected', 'true');
        assert.dom(screen.getByRole('tab', { name: 'Third tab label' })).hasAttribute('aria-selected', 'false');

        assert.dom(screen.getByText('Second panel')).exists();

        assert.ok(this.handleTabChange.calledOnce);
        assert.ok(this.handleTabChange.calledWith(1));
      });
    });

    module('on tab space keyup', function () {
      test('it displays the right tab and calls onTabChange', async function (assert) {
        // when
        screen.getByRole('tab', { name: 'Second tab label' }).focus();

        await userEvent.keyboard('[Space]');

        // then
        assert.dom(screen.getByRole('tab', { name: 'First tab label' })).hasAttribute('aria-selected', 'false');
        assert.dom(screen.getByRole('tab', { name: 'Second tab label' })).hasAttribute('aria-selected', 'true');
        assert.dom(screen.getByRole('tab', { name: 'Third tab label' })).hasAttribute('aria-selected', 'false');

        assert.dom(screen.getByText('Second panel')).exists();

        assert.ok(this.handleTabChange.calledOnce);
        assert.ok(this.handleTabChange.calledWith(1));
      });
    });

    module('on tablist right arrow keyup', function () {
      module('when the initial focus is not on the last tab', function () {
        test('focus goes to the next tab', async function (assert) {
          // when
          screen.getByRole('tab', { name: 'First tab label' }).focus();
          await userEvent.keyboard('[ArrowRight]');

          // then
          assert.dom(screen.getByRole('tab', { name: 'Second tab label' })).isFocused();
        });
      });

      module('when the initial focus is on the last tab', function () {
        test('focus goes to the first tab', async function (assert) {
          // when
          screen.getByRole('tab', { name: 'Third tab label' }).focus();
          await userEvent.keyboard('[ArrowRight]');

          // then
          assert.dom(screen.getByRole('tab', { name: 'First tab label' })).isFocused();
        });
      });
    });

    module('on tablist left arrow keyup', function () {
      module('when the initial focus is not on the first tab', function () {
        test('focus goes to the prev tab', async function (assert) {
          // when
          screen.getByRole('tab', { name: 'Third tab label' }).focus();
          await userEvent.keyboard('[ArrowLeft]');

          // then
          assert.dom(screen.getByRole('tab', { name: 'Second tab label' })).isFocused();
        });
      });

      module('when the initial focus is on the first tab', function () {
        test('focus goes to the last tab', async function (assert) {
          // when
          screen.getByRole('tab', { name: 'First tab label' }).focus();
          await userEvent.keyboard('[ArrowLeft]');
          await userEvent.keyboard('[Enter]');

          // then
          assert.dom(screen.getByRole('tab', { name: 'Third tab label' })).isFocused();
        });
      });
    });

    module('when a tab is selected, on tabulation keyup', function () {
      test('focus goes to the panel', async function (assert) {
        // when
        screen.getByRole('tab', { name: 'First tab label' }).focus();

        await tab();

        // then
        assert.dom(screen.getByRole('tabpanel')).isFocused();
      });
    });
  });

  module('with initialTabIndex', function () {
    test('it renders the tab with the given initial index', async function (assert) {
      // when
      const screen = await render(hbs`{{! template-lint-disable no-bare-strings }}
<Tabs @ariaLabel='Sample tabs' @initialTabIndex={{1}}>
  <:tabs as |Tab|>
    <Tab @index={{0}}>First tab label</Tab>
    <Tab @index={{1}}>Second tab label</Tab>
    <Tab @index={{2}}>Third tab label</Tab>
  </:tabs>

  <:panels as |Panel|>
    <Panel @index={{0}}>
      <h2>First panel</h2>
    </Panel>
    <Panel @index={{1}}>
      <h2>Second panel</h2>
    </Panel>
    <Panel @index={{2}}>
      <h2>Third panel</h2>
    </Panel>
  </:panels>
</Tabs>`);

      // then
      assert.dom(screen.getByRole('tab', { name: 'First tab label' })).hasAttribute('aria-selected', 'false');
      assert.dom(screen.getByRole('tab', { name: 'Second tab label' })).hasAttribute('aria-selected', 'true');
      assert.dom(screen.getByRole('tab', { name: 'Third tab label' })).hasAttribute('aria-selected', 'false');

      assert.strictEqual(screen.getAllByRole('tabpanel').length, 1);
      assert.dom(screen.getByText('Second panel')).exists();
    });
  });

  module('when the tablist is scrollable', function () {
    module('when the first tab is fully visible', function () {
      test('it renders only the right arrow button on the tablist', async function (assert) {
        // when
        const screen = await render(hbs`{{! template-lint-disable no-bare-strings }}
<Tabs @ariaLabel='Sample tabs' @initialTabIndex={{0}}>
  <:tabs as |Tab|>
    <Tab @index={{0}}>First tab label First tab label First tab label</Tab>
    <Tab @index={{1}}>Second tab label Second tab label Second tab label</Tab>
    <Tab @index={{2}}>Third tab label Third tab label Third tab label</Tab>
  </:tabs>

  <:panels as |Panel|>
    <Panel @index={{0}}>
      <h2>First panel</h2>
    </Panel>
    <Panel @index={{1}}>
      <h2>Second panel</h2>
    </Panel>
    <Panel @index={{2}}>
      <h2>Third panel</h2>
    </Panel>
  </:panels>
</Tabs>`);

        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for the render to finish

        // then
        assert.strictEqual(screen.getByRole('tablist').children.length, 2);
        assert.dom(screen.getByRole('tablist').children[1]).hasAttribute('tabindex', '-1');
      });
    });

    module('when the scroll is not at edges', function () {
      test('it renders the left and right arrow buttons on the tablist', async function (assert) {
        // when
        const screen = await render(hbs`{{! template-lint-disable no-bare-strings }}
<Tabs @ariaLabel='Sample tabs' @initialTabIndex={{1}}>
  <:tabs as |Tab|>
    <Tab @index={{0}}>First tab label First tab label First tab label</Tab>
    <Tab @index={{1}}>Second tab label Second tab label Second tab label</Tab>
    <Tab @index={{2}}>Third tab label Third tab label Third tab label</Tab>
  </:tabs>

  <:panels as |Panel|>
    <Panel @index={{0}}>
      <h2>First panel</h2>
    </Panel>
    <Panel @index={{1}}>
      <h2>Second panel</h2>
    </Panel>
    <Panel @index={{2}}>
      <h2>Third panel</h2>
    </Panel>
  </:panels>
</Tabs>`);

        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for the render to finish

        // then
        assert.strictEqual(screen.getByRole('tablist').children.length, 3);
        assert.dom(screen.getByRole('tablist').children[0]).hasAttribute('tabindex', '-1');
        assert.dom(screen.getByRole('tablist').children[2]).hasAttribute('tabindex', '-1');
      });
    });

    module('when the last tab is fully visible', function () {
      test('it renders only the left arrow button on the tablist', async function (assert) {
        // when
        const screen = await render(hbs`{{! template-lint-disable no-bare-strings }}
<Tabs @ariaLabel='Sample tabs' @initialTabIndex={{2}}>
  <:tabs as |Tab|>
    <Tab @index={{0}}>First tab label First tab label First tab label</Tab>
    <Tab @index={{1}}>Second tab label Second tab label Second tab label</Tab>
    <Tab @index={{2}}>Third tab label Third tab label Third tab label</Tab>
  </:tabs>

  <:panels as |Panel|>
    <Panel @index={{0}}>
      <h2>First panel</h2>
    </Panel>
    <Panel @index={{1}}>
      <h2>Second panel</h2>
    </Panel>
    <Panel @index={{2}}>
      <h2>Third panel</h2>
    </Panel>
  </:panels>
</Tabs>`);

        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for the render to finish

        // then
        assert.strictEqual(screen.getByRole('tablist').children.length, 2);
        assert.dom(screen.getByRole('tablist').children[0]).hasAttribute('tabindex', '-1');
      });
    });

    module('on right arrow button click', function () {
      test('it scrolls right', async function (assert) {
        // when
        const screen = await render(hbs`{{! template-lint-disable no-bare-strings }}
<Tabs @ariaLabel='Sample tabs' @initialTabIndex={{0}}>
  <:tabs as |Tab|>
    <Tab @index={{0}}>First tab label First tab label First tab label</Tab>
    <Tab @index={{1}}>Second tab label Second tab label Second tab label</Tab>
    <Tab @index={{2}}>Third tab label Third tab label Third tab label</Tab>
  </:tabs>

  <:panels as |Panel|>
    <Panel @index={{0}}>
      <h2>First panel</h2>
    </Panel>
    <Panel @index={{1}}>
      <h2>Second panel</h2>
    </Panel>
    <Panel @index={{2}}>
      <h2>Third panel</h2>
    </Panel>
  </:panels>
</Tabs>`);

        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for the render to finish

        // when
        await click(screen.getByRole('tablist').children[1]);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // then
        const scrollPosition = screen.getByRole('tablist').querySelector('div').scrollLeft;
        assert.notStrictEqual(scrollPosition, 0);
      });
    });

    module('on left arrow button click', function () {
      test('it scrolls left', async function (assert) {
        // when
        const screen = await render(hbs`{{! template-lint-disable no-bare-strings }}
<Tabs @ariaLabel='Sample tabs' @initialTabIndex={{1}}>
  <:tabs as |Tab|>
    <Tab @index={{0}}>First tab label First tab label First tab label</Tab>
    <Tab @index={{1}}>Second tab label Second tab label Second tab label</Tab>
    <Tab @index={{2}}>Third tab label Third tab label Third tab label</Tab>
  </:tabs>

  <:panels as |Panel|>
    <Panel @index={{0}}>
      <h2>First panel</h2>
    </Panel>
    <Panel @index={{1}}>
      <h2>Second panel</h2>
    </Panel>
    <Panel @index={{2}}>
      <h2>Third panel</h2>
    </Panel>
  </:panels>
</Tabs>`);

        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for the render to finish

        // when
        await click(screen.getByRole('tablist').children[0]);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // then
        const scrollPosition = screen.getByRole('tablist').querySelector('div').scrollLeft;
        assert.strictEqual(scrollPosition, 0);
      });
    });
  });
});
