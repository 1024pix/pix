import { render } from '@1024pix/ember-testing-library';
import ChallengeItemQrocm from 'mon-pix/components/challenge-item/challenge-item-qrocm';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Challenge item QROCM', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should provide an initial YAML answer value with empty fields, so a timed out challenge can be submitted without typing anything', async function (assert) {
    // given
    const challenge = {
      timer: 30,
      proposals: 'Champ 1 : ${input1}\nChamp 2 : ${input2}',
    };
    const assessment = { hasTimeoutChallenge: false };
    const setAnswerValue = sinon.stub();
    const setAnswerError = sinon.stub();

    // when
    await render(
      <template>
        <ChallengeItemQrocm
          @challenge={{challenge}}
          @assessment={{assessment}}
          @setAnswerValue={{setAnswerValue}}
          @setAnswerError={{setAnswerError}}
        />
      </template>,
    );

    // then
    assert.ok(setAnswerValue.calledOnceWithExactly("input1: ''\ninput2: ''\n"));
  });
});
