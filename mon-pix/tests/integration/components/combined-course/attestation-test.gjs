import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import Attestation from 'mon-pix/components/combined-course/attestation';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubSessionService } from '../../../helpers/service-stubs.js';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering.js';

module('Integration | Component | Combined Courses | Attestation', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store, fileSaverSaveStub;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    fileSaverSaveStub = sinon.stub();

    class FileSaverStub extends Service {
      save = fileSaverSaveStub;
    }

    this.owner.register('service:fileSaver', FileSaverStub);

    stubSessionService(this.owner, { isAuthenticated: true });
  });

  module('if attestation is obtained', function () {
    test('should display a button calling file saver with the correct parameters', async function (assert) {
      //given
      const attestation = store.createRecord('combined-course-reward', {
        status: 'OBTAINED',
        type: 'attestation',
        label: 'Parentalité',
        templateName: 'parentalite',
        data: { key: 'PARENTHOOD' },
      });

      //when
      const screen = await render(<template><Attestation @attestation={{attestation}} /></template>);
      await click(screen.getByRole('button', { name: t('pages.combined-courses.rewards.obtained.link') }));

      // then
      assert.ok(
        fileSaverSaveStub.calledWithExactly({
          url: '/api/users/123/attestations/PARENTHOOD',
          fileName: 'parentalite',
          token: 'access_token!',
        }),
      );
    });
    test('should display details', async function (assert) {
      //given
      const attestation = store.createRecord('combined-course-reward', {
        status: 'OBTAINED',
        type: 'attestation',
        label: 'Parentalité',
        templateName: 'parentalite',
        data: { key: 'PARENTHOOD' },
      });

      //when
      const screen = await render(<template><Attestation @attestation={{attestation}} /></template>);

      //then
      assert.ok(
        screen.getByRole('heading', {
          name:
            t('pages.combined-courses.rewards.title') +
            ' Parentalité ' +
            t('pages.combined-courses.rewards.obtained.status'),
        }),
      );

      const tag = screen.getByText(t('pages.combined-courses.rewards.obtained.status'));
      assert.ok(tag.getAttribute('class').includes('pix-tag pix-tag--green'));

      assert.ok(screen.getByText(t('pages.combined-courses.rewards.obtained.details.title')));
      assert.ok(screen.getByText(t('pages.combined-courses.rewards.obtained.details.text')));
      assert.ok(screen.getByRole('button', { name: t('pages.combined-courses.rewards.obtained.link') }));
      assert
        .dom(screen.getByRole('img', { name: 'attestation-image-obtained' }))
        .hasAttribute('src', 'https://assets.pix.org/combined-courses/attestation-image.svg')
        .hasAttribute('class', 'attestation__picto--obtained');
    });
  });

  module('if attestation is not obtained', function () {
    test('should display details', async function (assert) {
      //given
      const attestation = store.createRecord('combined-course-reward', {
        status: 'NOT_OBTAINED',
        type: 'attestation',
        requirementsDescription: 'Description des conditions',
        label: 'Parentalité',
        templateName: 'parentalite',
        data: { key: 'PARENTHOOD' },
      });

      //when
      const screen = await render(<template><Attestation @attestation={{attestation}} /></template>);

      //then
      assert.ok(
        screen.getByRole('heading', {
          name:
            t('pages.combined-courses.rewards.title') +
            ' Parentalité ' +
            t('pages.combined-courses.rewards.not-obtained.status'),
        }),
      );

      const tag = screen.getByText(t('pages.combined-courses.rewards.not-obtained.status'));
      assert.ok(tag.getAttribute('class').includes('pix-tag pix-tag--error'));

      assert.ok(screen.getByText(t('pages.combined-courses.rewards.not-obtained.details.title')));
      assert.ok(screen.getByText('Description des conditions'));
      assert
        .dom(screen.getByRole('img', { name: 'attestation-image-not-obtained' }))
        .hasAttribute('src', 'https://assets.pix.org/combined-courses/attestation-image.svg')
        .hasAttribute('class', 'attestation__picto--not-obtained');
    });

    test('should not display reward requirements description if not defined', async function (assert) {
      //given
      const attestation = store.createRecord('combined-course-reward', {
        status: 'NOT_OBTAINED',
        type: 'attestation',
        label: 'Parentalité',
        templateName: 'parentalite',
        data: { key: 'PARENTHOOD' },
      });

      //when
      const screen = await render(<template><Attestation @attestation={{attestation}} /></template>);

      //then
      assert.ok(
        screen.getByRole('heading', {
          name:
            t('pages.combined-courses.rewards.title') +
            ' Parentalité ' +
            t('pages.combined-courses.rewards.not-obtained.status'),
        }),
      );

      const tag = screen.getByText(t('pages.combined-courses.rewards.not-obtained.status'));
      assert.ok(tag.getAttribute('class').includes('pix-tag pix-tag--error'));

      assert.ok(screen.getByText(t('pages.combined-courses.rewards.not-obtained.details.title')));
      assert.notOk(await screen.queryByText('Description des conditions'));
      assert
        .dom(screen.getByRole('img', { name: 'attestation-image-not-obtained' }))
        .hasAttribute('src', 'https://assets.pix.org/combined-courses/attestation-image.svg')
        .hasAttribute('class', 'attestation__picto--not-obtained');
    });
  });

  module('if attestation is in progress', function () {
    [{ status: 'STARTED' }, { status: 'NOT_STARTED' }].forEach(({ status }) => {
      test('should display all details', async function (assert) {
        //given
        const store = this.owner.lookup('service:store');
        const attestation = store.createRecord('combined-course-reward', {
          status,
          type: 'attestation',
          label: 'Parentalité',
          requirementsDescription: 'Description des conditions',
          templateName: 'parentalite',
          data: { key: 'PARENTHOOD' },
        });

        //when
        const screen = await render(<template><Attestation @attestation={{attestation}} /></template>);

        //then
        assert.ok(
          screen.getByRole('heading', {
            name:
              t('pages.combined-courses.rewards.title') +
              ' Parentalité ' +
              t('pages.combined-courses.rewards.in-progress.status'),
          }),
        );

        const tag = screen.getByText(t('pages.combined-courses.rewards.in-progress.status'));
        assert.ok(tag.getAttribute('class').includes('pix-tag pix-tag--grey'));

        assert.ok(screen.getByText(t('pages.combined-courses.rewards.in-progress.details.title')));
        assert.ok(screen.getByText('Description des conditions'));
        assert
          .dom(screen.getByRole('img', { name: 'attestation-image-in-progress' }))
          .hasAttribute('src', 'https://assets.pix.org/combined-courses/attestation-image.svg')
          .hasAttribute('class', 'attestation__picto--in-progress');
      });

      test('should not display reward requirements description if not defined', async function (assert) {
        //given
        const store = this.owner.lookup('service:store');
        const attestation = store.createRecord('combined-course-reward', {
          status,
          type: 'attestation',
          label: 'Parentalité',
          templateName: 'parentalite',
          data: { key: 'PARENTHOOD' },
        });

        //when
        const screen = await render(<template><Attestation @attestation={{attestation}} /></template>);

        //then
        assert.ok(
          screen.getByRole('heading', {
            name:
              t('pages.combined-courses.rewards.title') +
              ' Parentalité ' +
              t('pages.combined-courses.rewards.in-progress.status'),
          }),
        );

        const tag = screen.getByText(t('pages.combined-courses.rewards.in-progress.status'));
        assert.ok(tag.getAttribute('class').includes('pix-tag pix-tag--grey'));

        assert.ok(screen.getByText(t('pages.combined-courses.rewards.in-progress.details.title')));
        assert.notOk(await screen.queryByText('Description des conditions'));
        assert
          .dom(screen.getByRole('img', { name: 'attestation-image-in-progress' }))
          .hasAttribute('src', 'https://assets.pix.org/combined-courses/attestation-image.svg')
          .hasAttribute('class', 'attestation__picto--in-progress');
      });
    });
  });

  module('if attestation is not available', function () {
    [{ status: 'NOT_OBTAINED' }, { status: 'STARTED' }, { status: 'NOT_STARTED' }].forEach(({ status }) => {
      test('should not display a button to save attestation', async function (assert) {
        //given
        const store = this.owner.lookup('service:store');
        const fileSaverSaveStub = sinon.stub();

        class FileSaverStub extends Service {
          save = fileSaverSaveStub;
        }

        this.owner.register('service:fileSaver', FileSaverStub);

        const attestation = store.createRecord('combined-course-reward', {
          status,
          type: 'attestation',
          label: 'Parentalité',
          templateName: 'parentalite',
          data: { key: 'PARENTHOOD' },
        });

        //when
        const screen = await render(<template><Attestation @attestation={{attestation}} /></template>);

        // then
        assert.notOk(screen.queryByRole('button', { name: t('pages.combined-courses.rewards.obtained.link') }));
        assert.ok(fileSaverSaveStub.notCalled);
      });
    });
  });
});
