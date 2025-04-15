import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Challenge | Content', function (hooks) {
  setupIntlRenderingTest(hooks);

  let screen;

  hooks.beforeEach(async function () {
    // given
    sinon.stub(window, 'fetch');
    const router = this.owner.lookup('service:router');
    router.transitionTo = sinon.stub();

    const store = this.owner.lookup('service:store');
    this.set(
      'challenge',
      store.createRecord('challenge', {
        type: 'QROC',
        timer: false,
        format: 'phrase',
        proposals: '${myInput}',
      }),
    );
    this.set('answer', null);
    this.set(
      'assessment',
      store.createRecord('assessment', {
        certificationCourse: store.createRecord('certification-course', {
          version: 3,
        }),
        answers: [],
      }),
    );
    this.set('fakeFunction', () => {});

    // when
    screen = await render(
      hbs`<Challenge::Content
  @challenge={{this.challenge}}
  @answer={{this.answer}}
  @assessment={{this.assessment}}
  @hideOutOfFocusBorder={{this.fakeFunction}}
  @showOutOfFocusBorder={{this.fakeFunction}}
  @resetAllChallengeInfo={{this.fakeFunction}}
/>`,
    );
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('on challenge skip', function () {
    test('should disable the live alert button', async function (assert) {
      // then
      await click(screen.getByRole('button', { name: /Signaler un problème avec la question/ }));
      assert.dom(screen.getByRole('button', { name: /Oui, je suis/ })).exists();

      await click(screen.getByRole('button', { name: /Je passe/ }));
      assert
        .dom(screen.getByRole('button', { name: /Signaler un problème avec la question/ }))
        .hasAttribute('disabled');
      assert.dom(screen.queryByRole('button', { name: /Oui, je suis/ })).doesNotExist();
    });
  });

  module('on challenge answering', function () {
    test('should disable the live alert button', async function (assert) {
      // then
      await click(screen.getByRole('button', { name: /Signaler un problème avec la question/ }));
      assert.dom(screen.getByRole('button', { name: /Oui, je suis/ })).exists();

      await fillIn(screen.getByRole('textbox'), 'answer');
      await click(screen.getByRole('button', { name: /Je valide/ }));

      assert
        .dom(screen.getByRole('button', { name: /Signaler un problème avec la question/ }))
        .hasAttribute('disabled');
      assert.dom(screen.queryByRole('button', { name: /Oui, je suis/ })).doesNotExist();
    });
  });
});
