import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import Tags from 'mon-pix/components/user-certifications/list-item/tags';
import {
  CERTIFICATE_STATUSES,
  CERTIFICATE_TYPES,
  EXTRA_CERTIFICATE_STATUSES,
} from 'mon-pix/models/certificate-summary';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | User certifications | List item | Tags', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('main status tag', function () {
    test('displays validated status with framework name', async function (assert) {
      // given
      const status = CERTIFICATE_STATUSES.VALIDATED;
      const framework = 'CORE';
      const extraStatus = EXTRA_CERTIFICATE_STATUSES.NOT_APPLICABLE;

      // when
      const screen = await render(
        <template><Tags @status={{status}} @framework={{framework}} @extraStatus={{extraStatus}} /></template>,
      );

      // then
      const mainTag = screen.getByTestId('pw-certification-card-main-status');
      assert.dom(mainTag).containsText(t('pages.certification-frameworks.CORE'));
      assert.dom(mainTag).containsText(t('pages.certifications-list.statuses.validated'));
    });

    test('displays rejected status with framework name', async function (assert) {
      // given
      const status = CERTIFICATE_STATUSES.REJECTED;
      const framework = 'CORE';
      const extraStatus = EXTRA_CERTIFICATE_STATUSES.NOT_APPLICABLE;

      // when
      const screen = await render(
        <template><Tags @status={{status}} @framework={{framework}} @extraStatus={{extraStatus}} /></template>,
      );

      // then
      const mainTag = screen.getByTestId('pw-certification-card-main-status');
      assert.dom(mainTag).containsText(t('pages.certification-frameworks.CORE'));
      assert.dom(mainTag).containsText(t('pages.certifications-list.statuses.rejected'));
    });

    test('displays cancelled status with framework name', async function (assert) {
      // given
      const status = CERTIFICATE_STATUSES.CANCELLED;
      const framework = 'CORE';
      const extraStatus = EXTRA_CERTIFICATE_STATUSES.NOT_APPLICABLE;

      // when
      const screen = await render(
        <template><Tags @status={{status}} @framework={{framework}} @extraStatus={{extraStatus}} /></template>,
      );

      // then
      const mainTag = screen.getByTestId('pw-certification-card-main-status');
      assert.dom(mainTag).containsText(t('pages.certifications-list.statuses.cancelled'));
      assert.dom(mainTag).containsText(t('pages.certification-frameworks.CORE'));
    });

    test('displays cancelled_by_jury status with framework name', async function (assert) {
      // given
      const status = CERTIFICATE_STATUSES.CANCELLED_BY_JURY;
      const framework = 'CORE';
      const extraStatus = EXTRA_CERTIFICATE_STATUSES.NOT_APPLICABLE;

      // when
      const screen = await render(
        <template><Tags @status={{status}} @framework={{framework}} @extraStatus={{extraStatus}} /></template>,
      );

      // then
      const mainTag = screen.getByTestId('pw-certification-card-main-status');
      assert.dom(mainTag).containsText(t('pages.certifications-list.statuses.cancelled'));
      assert.dom(mainTag).containsText(t('pages.certification-frameworks.CORE'));
    });

    test('displays waiting for results status without framework name', async function (assert) {
      // given
      const status = CERTIFICATE_STATUSES.WAITING_FOR_RESULTS;
      const framework = 'CORE';
      const extraStatus = EXTRA_CERTIFICATE_STATUSES.NOT_APPLICABLE;

      // when
      const screen = await render(
        <template><Tags @status={{status}} @framework={{framework}} @extraStatus={{extraStatus}} /></template>,
      );

      // then
      const mainTag = screen.getByTestId('pw-certification-card-main-status');
      assert.dom(mainTag).containsText(t('pages.certifications-list.statuses.not-published'));
      assert.dom(mainTag).doesNotContainText(t('pages.certification-frameworks.CORE'));
    });

    test('displays mesh level for Pix+ v3 validated certification', async function (assert) {
      // given
      const status = CERTIFICATE_STATUSES.VALIDATED;
      const framework = 'EDU_2ND_DEGRE';
      const extraStatus = EXTRA_CERTIFICATE_STATUSES.NOT_APPLICABLE;
      const certificateType = CERTIFICATE_TYPES.CERTIFICATE;
      const reachedMeshLevel = 'ADMISSIBLE';

      // when
      const screen = await render(
        <template>
          <Tags
            @status={{status}}
            @framework={{framework}}
            @extraStatus={{extraStatus}}
            @reachedMeshLevel={{reachedMeshLevel}}
            @certificateType={{certificateType}}
          />
        </template>,
      );

      // then
      const mainTag = screen.getByTestId('pw-certification-card-main-status');
      assert.dom(mainTag).containsText(t('pages.certification-frameworks.EDU_2ND_DEGRE'));
      assert.dom(mainTag).containsText(t('pages.user-certifications.meshes.EDU_2ND_DEGRE.ADMISSIBLE'));
    });

    test('displays mesh level for Pix+ v3 rejected certification below minimum', async function (assert) {
      // given
      const status = CERTIFICATE_STATUSES.REJECTED;
      const framework = 'EDU_2ND_DEGRE';
      const extraStatus = EXTRA_CERTIFICATE_STATUSES.NOT_APPLICABLE;
      const certificateType = CERTIFICATE_TYPES.CERTIFICATE;
      const reachedMeshLevel = null;

      // when
      const screen = await render(
        <template>
          <Tags
            @status={{status}}
            @framework={{framework}}
            @extraStatus={{extraStatus}}
            @reachedMeshLevel={{reachedMeshLevel}}
            @certificateType={{certificateType}}
          />
        </template>,
      );

      // then
      const mainTag = screen.getByTestId('pw-certification-card-main-status');
      assert.dom(mainTag).containsText(t('pages.user-certifications.meshes.EDU_2ND_DEGRE.BELOW_MINIMUM'));
    });
  });

  module('when extra status exists', function () {
    test('displays CORE framework in main tag when extra status exists', async function (assert) {
      // given
      const status = CERTIFICATE_STATUSES.VALIDATED;
      const framework = 'CLEA';
      const extraStatus = EXTRA_CERTIFICATE_STATUSES.ACQUIRED;

      // when
      const screen = await render(
        <template><Tags @status={{status}} @framework={{framework}} @extraStatus={{extraStatus}} /></template>,
      );

      // then
      const mainTag = screen.getByTestId('pw-certification-card-main-status');
      assert.dom(mainTag).containsText(t('pages.certification-frameworks.CORE'));
    });

    module('when extra status is NOT_APPLICABLE', function () {
      test('does not display extra tag', async function (assert) {
        // given
        const status = CERTIFICATE_STATUSES.VALIDATED;
        const framework = 'CLEA';
        const extraStatus = EXTRA_CERTIFICATE_STATUSES.NOT_APPLICABLE;

        // when
        const screen = await render(
          <template><Tags @status={{status}} @framework={{framework}} @extraStatus={{extraStatus}} /></template>,
        );

        // then
        assert.dom(screen.queryByTestId('pw-certification-card-extra-status')).doesNotExist();
      });
    });

    module('when extra status is ACQUIRED', function () {
      test('displays extra tag with validated status', async function (assert) {
        // given
        const status = CERTIFICATE_STATUSES.VALIDATED;
        const framework = 'CLEA';
        const extraStatus = EXTRA_CERTIFICATE_STATUSES.ACQUIRED;

        // when
        const screen = await render(
          <template><Tags @status={{status}} @framework={{framework}} @extraStatus={{extraStatus}} /></template>,
        );

        // then
        const extraTag = screen.getByTestId('pw-certification-card-extra-status');
        assert.dom(extraTag).containsText(t('pages.certification-frameworks.CLEA'));
        assert.dom(extraTag).containsText(t('pages.certifications-list.statuses.validated'));
      });
    });

    module('when extra status is NOT_ACQUIRED', function () {
      test('displays extra tag with rejected status ', async function (assert) {
        // given
        const status = CERTIFICATE_STATUSES.VALIDATED;
        const framework = 'CLEA';
        const extraStatus = EXTRA_CERTIFICATE_STATUSES.NOT_ACQUIRED;

        // when
        const screen = await render(
          <template><Tags @status={{status}} @framework={{framework}} @extraStatus={{extraStatus}} /></template>,
        );

        // then
        const extraTag = screen.getByTestId('pw-certification-card-extra-status');
        assert.dom(extraTag).containsText(t('pages.certification-frameworks.CLEA'));
        assert.dom(extraTag).containsText(t('pages.certifications-list.statuses.rejected'));
      });
    });
  });
});
