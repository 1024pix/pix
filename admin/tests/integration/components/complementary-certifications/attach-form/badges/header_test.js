import { module, test } from 'qunit';
import { render, getByText, fireEvent } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';
import { fillIn } from '@ember/test-helpers';
import sinon from 'sinon';

module('Integration | Component | ComplementaryCertifications::AttachForm::Badges::Row', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupMirage(hooks);


    test('it should display the header label with no required mark and no tooltip by default', async function (assert) {
      // given
    // when
    const screen = await render(hbs`<ComplementaryCertifications::AttachForm::Badges::Header>
        LABEL
      </ComplementaryCertifications::AttachForm::Badges::Header>
    `);

    // then
    assert.dom(screen.getByText('LABEL')).exists();
    assert.dom(screen.queryByTitle('obligatoire')).doesNotExist();
    assert.dom(screen.queryByRole('info')).doesNotExist();
    assert.dom(screen.queryByRole('tooltip')).doesNotExist();
    });

    test('it should display the mandatory mark if header is required', async function (assert) {
      // given
    // when
    const screen = await render(hbs`<ComplementaryCertifications::AttachForm::Badges::Header @isRequired="true">
        LABEL
      </ComplementaryCertifications::AttachForm::Badges::Header>
    `);

    // then
    assert.dom(screen.getByText('LABEL')).exists();
    assert.dom(screen.getByTitle('obligatoire')).exists();
    });

    test('it should display the tooltip if provided', async function (assert) {
      // given
    // when
    const screen = await render(hbs`<ComplementaryCertifications::AttachForm::Badges::Header>
        <:default>Label</:default>
        <:tooltip>A compléter</:tooltip>
      </ComplementaryCertifications::AttachForm::Badges::Header>
    `);

    // then
    assert.dom(screen.getByRole('tooltip')).exists();
    });
});
