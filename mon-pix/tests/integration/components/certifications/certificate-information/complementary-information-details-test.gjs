import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import { t } from 'ember-intl/test-support';
import ComplementaryInformationDetails from 'mon-pix/components/certifications/certificate-information/complementary-information-details';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | complementary information details', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when certification is complete', function () {
    test('should show the comment for candidate', async function (assert) {
      // given
      const certification = EmberObject.create({
        id: '1',
        birthdate: new Date('2000-01-22T15:15:52Z'),
        firstName: 'Jean',
        lastName: 'Bon',
        date: new Date('2018-02-15T15:15:52Z'),
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 654,
        status: 'validated',
        commentForCandidate: 'Comment for candidate',
      });

      // when
      const screen = await render(
        <template><ComplementaryInformationDetails @certificate={{certification}} /></template>,
      );

      // then
      assert.ok(screen.getByText('Comment for candidate'));
    });
  });

  module('when certification has no comment for the user', function () {
    test('should not show the comment for candidate', async function (assert) {
      // given
      const certification = EmberObject.create({
        id: '1',
        birthdate: new Date('2000-01-22T15:15:52Z'),
        firstName: 'Jean',
        lastName: 'Bon',
        date: new Date('2018-02-15T15:15:52Z'),
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 654,
        status: 'validated',
        commentForCandidate: null,
      });

      // when
      const screen = await render(
        <template><ComplementaryInformationDetails @certificate={{certification}} /></template>,
      );

      // then
      assert.notOk(screen.queryByRole('heading', { name: t('pages.certificate.jury-title') }));
    });
  });

  module('when certification has complementary certified badge', function () {
    test('should show the complementary certification section', async function (assert) {
      // given
      const certification = EmberObject.create({
        id: '1',
        birthdate: new Date('2000-01-22T15:15:52Z'),
        firstName: 'Jean',
        lastName: 'Bon',
        date: new Date('2018-02-15T15:15:52Z'),
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 654,
        status: 'validated',
        hasAcquiredComplementaryCertifications: true,
        certifiedBadgeImages: [
          {
            url: '/some/img',
            isTemporaryBadge: false,
          },
        ],
      });

      // when
      const screen = await render(
        <template><ComplementaryInformationDetails @certificate={{certification}} /></template>,
      );

      // then
      assert.ok(screen.getByRole('heading', { name: t('pages.certificate.complementary.title') }));
    });

    module('when certification has a certified badge image', function () {
      test('should show the complementary certification badge', async function (assert) {
        // given
        const certification = EmberObject.create({
          id: '1',
          birthdate: new Date('2000-01-22T15:15:52Z'),
          firstName: 'Jean',
          lastName: 'Bon',
          date: new Date('2018-02-15T15:15:52Z'),
          certificationCenter: 'Université de Lyon',
          isPublished: true,
          pixScore: 654,
          status: 'validated',
          hasAcquiredComplementaryCertifications: true,
          certifiedBadgeImages: [
            {
              url: '/some/img',
              isTemporaryBadge: false,
            },
          ],
        });

        // when
        const screen = await render(
          <template><ComplementaryInformationDetails @certificate={{certification}} /></template>,
        );

        // then
        assert.ok(screen.getByRole('img', { name: 'Certification complémentaire' }));
      });

      module('when the certified badge image has a message', function () {
        test('should display the message', async function (assert) {
          // given
          const certification = EmberObject.create({
            id: '1',
            birthdate: new Date('2000-01-22T15:15:52Z'),
            firstName: 'Jean',
            lastName: 'Bon',
            date: new Date('2018-02-15T15:15:52Z'),
            certificationCenter: 'Université de Lyon',
            isPublished: true,
            pixScore: 654,
            status: 'validated',
            hasAcquiredComplementaryCertifications: true,
            certifiedBadgeImages: [
              {
                url: '/some/img',
                message: 'Bravo Coco!',
                levelName: 'Level Name',
              },
            ],
          });

          // when
          const screen = await render(
            <template><ComplementaryInformationDetails @certificate={{certification}} /></template>,
          );

          // then
          assert.ok(screen.getByText('Bravo Coco!'));
        });
      });
    });

    module('when certification has no certified badge image', function () {
      test('should not show the complementary certification badge', async function (assert) {
        // given
        const certification = EmberObject.create({
          id: '1',
          birthdate: new Date('2000-01-22T15:15:52Z'),
          firstName: 'Jean',
          lastName: 'Bon',
          date: new Date('2018-02-15T15:15:52Z'),
          certificationCenter: 'Université de Lyon',
          isPublished: true,
          pixScore: 654,
          status: 'validated',
          commentForCandidate: null,
          certifiedBadgeImages: [],
        });

        // when
        const screen = await render(
          <template><ComplementaryInformationDetails @certificate={{certification}} /></template>,
        );

        // then
        assert.notOk(screen.queryByRole('img', { name: 'Certification complémentaire' }));
      });
    });
  });

  module('when certification has jury comments but no complementary certified badge', function () {
    test('should not show the complementary certification badge section', async function (assert) {
      // given
      const certification = EmberObject.create({
        id: '1',
        birthdate: new Date('2000-01-22T15:15:52Z'),
        firstName: 'Jean',
        lastName: 'Bon',
        date: new Date('2018-02-15T15:15:52Z'),
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 654,
        status: 'validated',
        commentForCandidate: 'Commentaire du jury',
        certifiedBadgeImages: [],
      });

      // when
      const screen = await render(
        <template><ComplementaryInformationDetails @certificate={{certification}} /></template>,
      );

      // then
      assert.notOk(screen.queryByRole('heading', { name: t('pages.certificate.complementary.title') }));
    });
  });
});
