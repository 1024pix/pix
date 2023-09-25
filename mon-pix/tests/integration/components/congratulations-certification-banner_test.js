import { module, test } from 'qunit';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Congratulations Certification Banner', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders a banner indicating the user certifiability', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    this.set('fullName', 'Fifi Brindacier');
    this.set('closeBanner', () => {});
    this.set('certificationEligibility', store.createRecord('is-certifiable', {}));

    // when
    const screen = await render(
      hbs`<CongratulationsCertificationBanner @fullName={{this.fullName}} @closeBanner={{this.closeBanner}} @certificationEligibility={{this.certificationEligibility}}/>`,
    );

    // then
    assert.ok(screen.getByText('Bravo Fifi Brindacier, votre profil Pix est certifiable.'));
  });

  test('calls the closeBanner method when closing the banner', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const closeBannerStub = sinon.stub();
    this.set('closeBanner', closeBannerStub);
    this.set('fullName', 'Fifi Brindacier');
    this.set('certificationEligibility', store.createRecord('is-certifiable', {}));

    const screen = await render(
      hbs`<CongratulationsCertificationBanner @fullName={{this.fullName}} @closeBanner={{this.closeBanner}} @certificationEligibility={{this.certificationEligibility}}/>`,
    );

    // when
    await click(screen.getByLabelText('Fermer'));

    // then
    sinon.assert.calledOnce(closeBannerStub);
    assert.ok(true);
  });

  module('When there are eligible complementary certifications', function () {
    module('When there is only one eligible complementary certification', function () {
      test(`renders the complementary certification eligibility special message and picture`, async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const certificationEligibility = store.createRecord('is-certifiable', {
          complementaryCertifications: [
            {
              label: 'CléA Numérique',
              imageUrl: 'http://www.image-clea.com',
              isOutdated: false,
            },
          ],
        });
        this.set('certificationEligibility', certificationEligibility);
        this.set('fullName', 'Fifi Brindacier');
        this.set('closeBanner', () => {});

        // when
        const screen = await render(
          hbs`<CongratulationsCertificationBanner @certificationEligibility={{this.certificationEligibility}} @fullName={{this.fullName}} @closeBanner={{this.closeBanner}}/>`,
        );

        // then
        assert.ok(screen.getByText('Vous êtes également éligible à la certification complémentaire :'));
        assert.ok(screen.getByText('CléA Numérique'));
        assert.ok(screen.getByRole('img', { name: 'CléA Numérique' }));
      });
    });

    module('When there are multiple eligible complementary certifications', function () {
      test(`renders the multiple complementary certification eligibility pluralized message and pictures`, async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const certificationEligibility = store.createRecord('is-certifiable', {
          complementaryCertifications: [
            { label: 'CléA Numérique', imageUrl: 'http://www.image-clea.com', isOutdated: false },
            { label: 'Pix+ Édu 1er degré Confirmé', imageUrl: 'http://www.image-clea.com', isOutdated: false },
          ],
        });
        this.set('certificationEligibility', certificationEligibility);
        this.set('fullName', 'Fifi Brindacier');
        this.set('closeBanner', () => {});

        // when
        const screen = await render(
          hbs`<CongratulationsCertificationBanner @certificationEligibility={{this.certificationEligibility}} @fullName={{this.fullName}} @closeBanner={{this.closeBanner}}/>`,
        );

        // then
        assert.ok(screen.getByText('Vous êtes également éligible aux certifications complémentaires :'));
        assert.ok(screen.getByText('CléA Numérique'));
        assert.ok(screen.getByText('Pix+ Édu 1er degré Confirmé'));
        assert.ok(screen.getByRole('img', { name: 'CléA Numérique' }));
        assert.ok(screen.getByRole('img', { name: 'Pix+ Édu 1er degré Confirmé' }));
      });
    });

    module('When there are outdated complementary certifications', function () {
      test(`renders the outdated complementary certification`, async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const certificationEligibility = store.createRecord('is-certifiable', {
          complementaryCertifications: [
            { label: 'CléA Numérique', imageUrl: 'http://www.image-clea.com', isOutdated: true },
            { label: 'Pix+ Édu 1er degré Confirmé', imageUrl: 'http://www.image-clea.com', isOutdated: true },
          ],
        });
        this.set('certificationEligibility', certificationEligibility);
        this.set('closeBanner', () => {});

        // when
        const screen = await render(
          hbs`<CongratulationsCertificationBanner @certificationEligibility={{this.certificationEligibility}} @fullName={{this.fullName}} @closeBanner={{this.closeBanner}}/>`,
        );

        // then
        assert.dom(screen.getByRole('img', { name: 'CléA Numérique' })).exists();
        assert
          .dom(screen.getByText("Vous n'êtes plus éligible à la certification CléA Numérique suite à son évolution."))
          .exists();
        assert
          .dom(
            screen.getAllByText(
              "Recontactez votre établissement ou l’organisation vous ayant proposé le parcours afin de repasser une campagne et ainsi redevenir éligible. Votre progression a été conservée et vous n'aurez qu'à jouer les nouvelles épreuves, cela devrait être rapide.",
            )[0],
          )
          .exists();

        assert.ok(screen.getByRole('img', { name: 'Pix+ Édu 1er degré Confirmé' }));
        assert
          .dom(
            screen.getByText(
              "Vous n'êtes plus éligible à la certification Pix+ Édu 1er degré Confirmé suite à son évolution.",
            ),
          )
          .exists();
        assert
          .dom(
            screen.getAllByText(
              "Recontactez votre établissement ou l’organisation vous ayant proposé le parcours afin de repasser une campagne et ainsi redevenir éligible. Votre progression a été conservée et vous n'aurez qu'à jouer les nouvelles épreuves, cela devrait être rapide.",
            )[1],
          )
          .exists();
      });
    });
  });
});
