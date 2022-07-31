import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | user certifications detail result', function (hooks) {
  setupIntlRenderingTest(hooks);

  let certification;

  module('when certification is complete', function () {
    test('should show the comment for candidate', async function (assert) {
      // given
      const certification = EmberObject.create({
        id: 1,
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
      this.set('certification', certification);

      // when
      const screen = await renderScreen(hbs`<UserCertificationsDetailResult @certification={{this.certification}}/>`);

      // then
      assert.dom(screen.getByText('Comment for candidate')).exists();
    });
  });

  module('when certification has no comment for the user', function () {
    test('should not show the comment for candidate', async function (assert) {
      // given
      const certification = EmberObject.create({
        id: 1,
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
      this.set('certification', certification);

      // when
      const screen = await renderScreen(hbs`<UserCertificationsDetailResult @certification={{this.certification}}/>`);
      assert.dom(screen.queryByRole('heading', { name: this.intl.t('pages.certificate.jury-title') })).doesNotExist();
    });
  });

  module('when certification has Cléa', function () {
    test('should show the CLEA badge', async function (assert) {
      // given
      const certification = EmberObject.create({
        id: 1,
        birthdate: new Date('2000-01-22T15:15:52Z'),
        firstName: 'Jean',
        lastName: 'Bon',
        date: new Date('2018-02-15T15:15:52Z'),
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 654,
        status: 'validated',
        commentForCandidate: null,
        hasCleaCertif: true,
        hasAcquiredComplementaryCertifications: true,
      });
      this.set('certification', certification);

      // when
      const screen = await renderScreen(hbs`<UserCertificationsDetailResult @certification={{this.certification}}/>`);

      // then
      assert.dom(screen.getByRole('img', { name: 'Certification cléA numérique' })).exists();
    });
  });

  module('when certification does not have Cléa', function () {
    test('should not show the CLEA badge', async function (assert) {
      // given
      certification = EmberObject.create({
        id: 1,
        birthdate: new Date('2000-01-22T15:15:52Z'),
        firstName: 'Jean',
        lastName: 'Bon',
        date: new Date('2018-02-15T15:15:52Z'),
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 654,
        status: 'validated',
        commentForCandidate: null,
        hasCleaCertif: false,
      });
      this.set('certification', certification);

      // when
      const screen = await renderScreen(hbs`<UserCertificationsDetailResult @certification={{this.certification}}/>`);

      // then
      assert.dom(screen.queryByRole('img', { name: 'Certification cléA numérique' })).doesNotExist();
    });
  });

  module('when certification has a certified badge image', function () {
    test('should show the complementary certification badge', async function (assert) {
      // given
      certification = EmberObject.create({
        id: 1,
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
      this.set('certification', certification);

      // when
      const screen = await renderScreen(hbs`<UserCertificationsDetailResult @certification={{this.certification}}/>`);

      // then
      assert.dom(screen.getByRole('img', { name: 'Certification complémentaire' })).exists();
    });

    module('when the certified badge image has a message', function () {
      test('should display the message', async function (assert) {
        // given
        certification = EmberObject.create({
          id: 1,
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
        this.set('certification', certification);

        // when
        const screen = await renderScreen(hbs`<UserCertificationsDetailResult @certification={{this.certification}}/>`);

        // then
        assert.dom(screen.getByText('Bravo Coco!')).exists();
      });
    });
  });

  module('when certification has no certifed badge image', function () {
    test('should not show the complementary certification badge', async function (assert) {
      // given
      certification = EmberObject.create({
        id: 1,
        birthdate: new Date('2000-01-22T15:15:52Z'),
        firstName: 'Jean',
        lastName: 'Bon',
        date: new Date('2018-02-15T15:15:52Z'),
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 654,
        status: 'validated',
        commentForCandidate: null,
        hasCleaCertif: false,
        certifiedBadgeImages: [],
      });
      this.set('certification', certification);

      // when
      const screen = await renderScreen(hbs`<UserCertificationsDetailResult @certification={{this.certification}}/>`);
      // then
      assert.dom(screen.queryByRole('img', { name: 'Certification complémentaire' })).doesNotExist();
    });
  });

  module('when certification has jury comments but no complementary certifed badges', function () {
    test('should not show the complementary certification badge section', async function (assert) {
      // given
      certification = EmberObject.create({
        id: 1,
        birthdate: new Date('2000-01-22T15:15:52Z'),
        firstName: 'Jean',
        lastName: 'Bon',
        date: new Date('2018-02-15T15:15:52Z'),
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 654,
        status: 'validated',
        commentForCandidate: 'Commentaire du jury',
        hasCleaCertif: false,
        certifiedBadgeImages: [],
      });
      this.set('certification', certification);

      // when
      const screen = await renderScreen(hbs`<UserCertificationsDetailResult @certification={{this.certification}}/>`);

      // then
      assert
        .dom(screen.queryByRole('heading', { name: this.intl.t('pages.certificate.complementary.title') }))
        .doesNotExist();
    });
  });
});
