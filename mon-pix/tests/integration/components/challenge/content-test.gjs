import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import ChallengeContent from 'mon-pix/components/challenge/content';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Challenge | Content', function (hooks) {
  setupIntlRenderingTest(hooks);

  let screen;
  module('When assessment is of type certification', function (hooks) {
    hooks.beforeEach(async function () {
      // given
      sinon.stub(window, 'fetch');
      const router = this.owner.lookup('service:router');
      router.transitionTo = sinon.stub();

      const store = this.owner.lookup('service:store');
      const challenge = store.createRecord('challenge', {
        type: 'QROC',
        timer: false,
        format: 'phrase',
        proposals: '${myInput}',
      });
      const answer = null;
      const assessment = store.createRecord('assessment', {
        certificationCourse: store.createRecord('certification-course'),
        type: 'CERTIFICATION',
        answers: [],
      });
      const fakeFunction = () => {};

      // when
      screen = await render(
        <template>
          <ChallengeContent
            @challenge={{challenge}}
            @answer={{answer}}
            @assessment={{assessment}}
            @hideOutOfFocusBorder={{fakeFunction}}
            @showOutOfFocusBorder={{fakeFunction}}
            @resetAllChallengeInfo={{fakeFunction}}
          />
        </template>,
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
          .hasAttribute('aria-disabled');
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
          .hasAttribute('aria-disabled');
        assert.dom(screen.queryByRole('button', { name: /Oui, je suis/ })).doesNotExist();
      });
    });
  });
});
