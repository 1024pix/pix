import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

describe('Integration | Component | user certifications detail result', function () {
  setupIntlRenderingTest();

  let certification;

  context('when certification is complete', function () {
    it('should show the comment for candidate', async function () {
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
      expect(screen.getByText('Comment for candidate')).to.exist;
    });
  });

  context('when certification has no comment for the user', function () {
    it('should not show the comment for candidate', async function () {
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
      expect(screen.queryByRole('heading', { name: this.intl.t('pages.certificate.jury-title') })).to.not.exist;
    });
  });

  context('when certification has a certified badge image', function () {
    it('should show the complementary certification badge', async function () {
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
      expect(screen.getByRole('img', { name: 'Certification complémentaire' })).to.exist;
    });

    context('when the certified badge image has a message', function () {
      it('should display the message', async function () {
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
        expect(screen.getByText('Bravo Coco!')).to.exist;
      });
    });
  });

  context('when certification has no certifed badge image', function () {
    it('should not show the complementary certification badge', async function () {
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
        certifiedBadgeImages: [],
      });
      this.set('certification', certification);

      // when
      const screen = await renderScreen(hbs`<UserCertificationsDetailResult @certification={{this.certification}}/>`);
      // then
      expect(screen.queryByRole('img', { name: 'Certification complémentaire' })).to.not.exist;
    });
  });

  context('when certification has jury comments but no complementary certifed badges', function () {
    it('should not show the complementary certification badge section', async function () {
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
        certifiedBadgeImages: [],
      });
      this.set('certification', certification);

      // when
      const screen = await renderScreen(hbs`<UserCertificationsDetailResult @certification={{this.certification}}/>`);

      // then
      expect(
        screen.queryByRole('heading', { name: this.intl.t('pages.certificate.complementary.title') })
      ).to.not.exist;
    });
  });
});
