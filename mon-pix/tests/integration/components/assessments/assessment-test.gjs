import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import Assessments from 'mon-pix/components/assessments/assessments';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Assessments | assessments', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when extension is enabled', function () {
    test('it displays assessment page', async function (assert) {
      // given
      class PixCompanionStub extends Service {
        addEventListener = sinon.stub();
        removeEventListener = sinon.stub();
        startCheckingExtensionIsEnabled = sinon.stub();
        stopCheckingExtensionIsEnabled = sinon.stub();
        isExtensionEnabled = true;
      }

      this.owner.register('service:pix-companion', PixCompanionStub);

      const assessment = { isCertification: true };
      const title = 'Première question';

      // when
      const screen = await render(
        <template>
          <Assessments @assessment={{assessment}}>
            <h1>{{title}}</h1>
          </Assessments>
        </template>,
      );

      // then
      assert.dom(screen.getByRole('heading', { name: title })).exists();
    });

    module("when assessment's type is not certification", function () {
      test('it displays assessment page', async function (assert) {
        // given
        class PixCompanionStub extends Service {
          addEventListener = sinon.stub();
          removeEventListener = sinon.stub();
          startCheckingExtensionIsEnabled = sinon.stub();
          stopCheckingExtensionIsEnabled = sinon.stub();
          isExtensionEnabled = true;
        }

        this.owner.register('service:pix-companion', PixCompanionStub);

        const assessment = { isCertification: false };
        const title = 'Première question';

        // when
        const screen = await render(
          <template>
            <Assessments @assessment={{assessment}}>
              <h1>{{title}}</h1>
            </Assessments>
          </template>,
        );

        // then
        assert.dom(screen.getByRole('heading', { name: title })).exists();
        assert
          .dom(screen.queryByRole('heading', { name: 'L’extension Pix Companionn’est pas détectée' }))
          .doesNotExist();
      });
    });
  });

  module('when the companion is blocked', function () {
    test('it creates a companion live alert and reloads the assessment', async function (assert) {
      // given
      let blockListener;
      class PixCompanionStub extends Service {
        addEventListener = sinon.stub().callsFake((eventName, listener) => {
          if (eventName === 'block') blockListener = listener;
        });
        removeEventListener = sinon.stub();
        startCheckingExtensionIsEnabled = sinon.stub();
        stopCheckingExtensionIsEnabled = sinon.stub();
        isExtensionEnabled = true;
      }

      this.owner.register('service:pix-companion', PixCompanionStub);

      const store = this.owner.lookup('service:store');
      const adapter = store.adapterFor('assessment');
      const createCompanionLiveAlertStub = sinon.stub(adapter, 'createCompanionLiveAlert');

      const assessment = { id: '123', isCertification: true, reload: sinon.stub() };
      const title = 'Première question';

      await render(
        <template>
          <Assessments @assessment={{assessment}}>
            <h1>{{title}}</h1>
          </Assessments>
        </template>,
      );

      // when
      await blockListener();

      // then
      sinon.assert.calledOnceWithExactly(createCompanionLiveAlertStub, { assessmentId: '123' });
      sinon.assert.calledOnce(assessment.reload);
      assert.ok(true);
    });
  });

  module('when extension is disabled', function () {
    test('it displays companion blocker page', async function (assert) {
      // given
      class PixCompanionStub extends Service {
        addEventListener = sinon.stub();
        removeEventListener = sinon.stub();
        startCheckingExtensionIsEnabled = sinon.stub();
        stopCheckingExtensionIsEnabled = sinon.stub();
        isExtensionEnabled = false;
      }

      this.owner.register('service:pix-companion', PixCompanionStub);

      const assessment = { isCertification: true };
      const title = 'Première question';

      // when
      const screen = await render(
        <template>
          <Assessments @assessment={{assessment}}>
            <h1>{{title}}</h1>
          </Assessments>
        </template>,
      );

      // then
      assert.dom(screen.queryByRole('heading', { name: title })).doesNotExist();
      assert
        .dom(screen.getByRole('heading', { level: 1, name: 'L’extension Pix Companionn’est pas détectée' }))
        .exists();
    });

    module("when assessment's type is not certification", function () {
      test('it displays assessment page', async function (assert) {
        // given
        class PixCompanionStub extends Service {
          addEventListener = sinon.stub();
          removeEventListener = sinon.stub();
          startCheckingExtensionIsEnabled = sinon.stub();
          stopCheckingExtensionIsEnabled = sinon.stub();
          isExtensionEnabled = false;
        }

        this.owner.register('service:pix-companion', PixCompanionStub);

        const assessment = { isCertification: false };
        const title = 'Première question';

        // when
        const screen = await render(
          <template>
            <Assessments @assessment={{assessment}}>
              <h1>{{title}}</h1>
            </Assessments>
          </template>,
        );

        // then
        assert.dom(screen.getByRole('heading', { name: title })).exists();
        assert
          .dom(screen.queryByRole('heading', { name: 'L’extension Pix Companionn’est pas détectée' }))
          .doesNotExist();
      });
    });
  });
});
