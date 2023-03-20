import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | certifications list item', function (hooks) {
  setupIntlRenderingTest(hooks);

  const PUBLISH_CLASS = '.certifications-list-item__published-item';
  const UNPUBLISH_CLASS = '.certifications-list-item__unpublished-item';
  const CERTIFICATION_CELL_SELECTOR = '.certifications-list-item__cell';
  const STATUS_SELECTOR = '.certifications-list-item__cell-double-width';
  const IMG_FOR_STATUS_SELECTOR = 'img[data-test-id="certifications-list-item__cross-img"]';
  const IMG_FOR_WAITING_STATUS_SELECTOR = 'img[data-test-id="certifications-list-item__hourglass-img"]';
  const PIX_SCORE_CELL_SELECTOR = '.certifications-list-item__pix-score';
  const DETAIL_SELECTOR = '.certifications-list-item__cell-detail';
  const VALIDATED_DETAIL_SELECTOR = `${DETAIL_SELECTOR} a`;
  const COMMENT_CELL_SELECTOR = '.certifications-list-item__row-comment-cell';
  const NOT_CLICKABLE_SELECTOR = '.certifications-list-item__not-clickable';
  const CLICKABLE_SELECTOR = '.certifications-list-item__clickable';

  const commentForCandidate = 'Commentaire pour le candidat';

  test('renders', async function (assert) {
    await render(hbs`<CertificationsListItem />`);
    assert.dom('.certifications-list-item__row-presentation').exists();
  });

  module('when the certification is not published', function (hooks) {
    hooks.beforeEach(async function () {
      // given
      const certification = createCertification({
        status: 'validated',
        isPublished: false,
        commentForCandidate: null,
      });
      this.set('certification', certification);

      // when
      await render(hbs`<CertificationsListItem @certification={{this.certification}}/>`);
    });

    // then
    test('should render a certifications-list-item__unpublished-item div', function (assert) {
      assert.dom(UNPUBLISH_CLASS).exists();
    });

    test('should show en attente de résultat', function (assert) {
      assert.dom(IMG_FOR_WAITING_STATUS_SELECTOR).exists();
      assert.ok(find(STATUS_SELECTOR).textContent.includes('En attente du résultat'));
    });

    test('should not be clickable', function (assert) {
      assert.dom(NOT_CLICKABLE_SELECTOR).exists();
      assert.dom(CLICKABLE_SELECTOR).doesNotExist();
    });
  });

  module('when the certification is published and rejected', function () {
    module('without commentForCandidate', function (hooks) {
      let screen;

      hooks.beforeEach(async function () {
        // given
        const certification = createCertification({
          status: 'rejected',
          isPublished: true,
          commentForCandidate: null,
        });

        this.set('certification', certification);

        // when
        screen = await render(hbs`<CertificationsListItem @certification={{this.certification}}/>`);
      });

      // then
      test('should render a certifications-list-item__published-item div', function (assert) {
        assert.dom(PUBLISH_CLASS).exists();
      });

      test('should show Certification non obtenue', function (assert) {
        assert.dom(IMG_FOR_STATUS_SELECTOR).exists();
        assert.ok(find(STATUS_SELECTOR).textContent.includes('Certification non obtenue'));
      });

      test('should not show Détail in last column', function (assert) {
        assert
          .dom(screen.queryByRole('button', { name: this.intl.t('pages.certifications-list.statuses.fail.action') }))
          .doesNotExist();
      });

      test('should not show comment for candidate panel when clicked on row', async function (assert) {
        // when
        await click(CERTIFICATION_CELL_SELECTOR);

        // then
        assert.dom(COMMENT_CELL_SELECTOR).doesNotExist();
      });

      test('should not be clickable', function (assert) {
        assert.dom(NOT_CLICKABLE_SELECTOR).exists();
        assert.dom(CLICKABLE_SELECTOR).doesNotExist();
      });
    });

    module('with a commentForCandidate', function (hooks) {
      let screen;

      hooks.beforeEach(async function () {
        // given
        const certification = createCertification({
          status: 'rejected',
          isPublished: true,
          commentForCandidate,
        });
        this.set('certification', certification);

        // when
        screen = await render(hbs`<CertificationsListItem @certification={{this.certification}}/>`);
      });

      // then
      test('should render a certifications-list-item__published-item div', function (assert) {
        assert.dom(PUBLISH_CLASS).exists();
      });

      test('should show Certification non obtenue', function (assert) {
        assert.dom(IMG_FOR_STATUS_SELECTOR).exists();
        assert.ok(find(STATUS_SELECTOR).textContent.includes('Certification non obtenue'));
      });

      test('should show Détail in last column', function (assert) {
        assert
          .dom(screen.getByRole('button', { name: `${this.intl.t('pages.certifications-list.statuses.fail.action')}` }))
          .exists();
      });

      test('should show comment for candidate panel when clicked on row', async function (assert) {
        await click(CERTIFICATION_CELL_SELECTOR);

        assert.dom(COMMENT_CELL_SELECTOR).exists();
        assert.ok(find(COMMENT_CELL_SELECTOR).textContent.includes(commentForCandidate));
      });

      test('should be clickable', function (assert) {
        assert.dom(CLICKABLE_SELECTOR).exists();
        assert.dom(NOT_CLICKABLE_SELECTOR).doesNotExist();
      });
    });
  });

  module('when the certification is published and validated', function (hooks) {
    hooks.beforeEach(async function () {
      // given
      const certification = createCertification({
        status: 'validated',
        isPublished: true,
      });
      this.set('certification', certification);

      // when
      await render(hbs`<CertificationsListItem @certification={{this.certification}}/>`);
    });

    // then
    test('should render certifications-list-item__published-item with a link inside', function (assert) {
      assert.dom(`${PUBLISH_CLASS} a`).exists();
    });

    test('should show Certification obtenue', function (assert) {
      assert.dom('img[data-test-id="certifications-list-item__green-check-img"]').exists();
      assert.ok(find(STATUS_SELECTOR).textContent.includes('Certification obtenue'));
    });

    test('should show the Pix Score', function (assert) {
      assert.dom(PIX_SCORE_CELL_SELECTOR).exists();
      assert.ok(find(PIX_SCORE_CELL_SELECTOR).textContent.includes('231'));
    });

    test('should show link to certification page in last column', function (assert) {
      assert.dom(VALIDATED_DETAIL_SELECTOR).exists();
      assert.ok(find(VALIDATED_DETAIL_SELECTOR).textContent.includes('résultats'));
    });

    test('should be clickable', function (assert) {
      assert.dom(CLICKABLE_SELECTOR).exists();
      assert.dom(NOT_CLICKABLE_SELECTOR).doesNotExist();
    });
  });

  module('when the certification is cancelled', function () {
    module('and is published', function () {
      module('and and has no comments', function () {
        test('should show Certification annulée without comments', async function (assert) {
          // given
          const certification = createCertification({
            status: 'cancelled',
            isPublished: true,
          });
          this.set('certification', certification);

          // when
          await render(hbs`<CertificationsListItem @certification={{this.certification}}/>`);

          assert.dom(PUBLISH_CLASS).exists();
          assert.dom(IMG_FOR_STATUS_SELECTOR).exists();
          assert.ok(find(STATUS_SELECTOR).textContent.includes('Certification annulée'));

          assert.dom('button').doesNotExist();
        });

        test('should not be clickable', async function (assert) {
          // given
          const certification = createCertification({
            status: 'cancelled',
            isPublished: true,
          });
          this.set('certification', certification);

          // when
          await render(hbs`<CertificationsListItem @certification={{this.certification}}/>`);

          assert.dom(NOT_CLICKABLE_SELECTOR).exists();
          assert.dom(CLICKABLE_SELECTOR).doesNotExist();
        });
      });

      module('and and has comments', function () {
        test('should show Certification annulée with comments', async function (assert) {
          // given
          const certification = EmberObject.create({
            id: 1,
            date: '2018-02-15T15:15:52.504Z',
            status: 'cancelled',
            certificationCenter: 'Université de Paris',
            isPublished: true,
            commentForCandidate: 'random',
          });

          this.set('certification', certification);

          // when
          await render(hbs`<CertificationsListItem @certification={{this.certification}}/>`);

          assert.dom('button').exists();
        });
      });

      test('should be clickable', async function (assert) {
        // given
        const certification = createCertification({
          status: 'cancelled',
          isPublished: true,
          commentForCandidate,
        });
        this.set('certification', certification);

        // when
        await render(hbs`<CertificationsListItem @certification={{this.certification}}/>`);

        assert.dom(CLICKABLE_SELECTOR).exists();
        assert.dom(NOT_CLICKABLE_SELECTOR).doesNotExist();
      });
    });

    module('and is not published', function (hooks) {
      hooks.beforeEach(async function () {
        // given
        const certification = createCertification({
          status: 'cancelled',
          isPublished: false,
        });
        this.set('certification', certification);

        // when
        await render(hbs`<CertificationsListItem @certification={{this.certification}}/>`);
      });

      // then
      test('should render a certifications-list-item__unpublished-item div', function (assert) {
        assert.dom(UNPUBLISH_CLASS).exists();
      });

      test('should not show Certification annulée', function (assert) {
        assert.dom(IMG_FOR_STATUS_SELECTOR).doesNotExist();
      });
    });
  });
});

function createCertification({ status, isPublished, commentForCandidate }) {
  return EmberObject.create({
    id: 1,
    date: '2018-02-15T15:15:52.504Z',
    certificationCenter: 'Université de Paris',
    pixScore: 231,
    status,
    isPublished,
    commentForCandidate,
  });
}
