import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Participant::Assessment::Header', function(hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.owner.setupRouter();
  });

  test('it should display user information', async function(assert) {
    // given
    this.participation = {
      firstName: 'Jean',
      lastName: 'La fripouille',
    };
    this.campaign = {};

    // when
    await render(hbs`<Participant::Assessment::Header @participation={{participation}} @campaign={{campaign}} />`);

    // then
    assert.contains('Jean La fripouille');
  });

  test('it displays campaign participation creation date', async function(assert) {
    this.participation = { createdAt: '2020-01-01' };
    this.campaign = {};

    await render(hbs`<Participant::Assessment::Header @participation={{participation}} @campaign={{campaign}} />`);

    assert.contains('01 janv. 2020');
  });

  test('it displays campaign participation progression', async function(assert) {
    this.participation = { progression: 75 };
    this.campaign = {};

    await render(hbs`<Participant::Assessment::Header @participation={{participation}} @campaign={{campaign}} />`);

    assert.contains('Avancement');
    assert.contains('75%');
  });

  module('is shared', function() {
    module('when participant has shared results', function() {
      test('it displays the sharing date', async function(assert) {
        this.participation = {
          isShared: true,
          sharedAt: '2020-01-02',
        };
        this.campaign = {};

        await render(hbs`<Participant::Assessment::Header @participation={{participation}} @campaign={{campaign}} />`);

        assert.contains('Envoyé le');
        assert.contains('02 janv. 2020');
      });
    });

    module('when participant has not shared results', function() {
      test('it does not displays the sharing date', async function(assert) {
        this.participation = { isShared: false };
        this.campaign = {};

        await render(hbs`<Participant::Assessment::Header @participation={{participation}} @campaign={{campaign}} />`);

        assert.notContains('Envoyé le');
      });
    });
  });

  module('identifiant', function() {
    module('when the external id is present', function() {
      test('it displays the external id', async function(assert) {
        this.participation = {
          participantExternalId: 'i12345',
          isShared: false,
        };
        this.campaign = { idPixLabel: 'identifiant de l’élève' };

        await render(hbs`<Participant::Assessment::Header @participation={{participation}} @campaign={{campaign}} />`);

        assert.contains('identifiant de l’élève');
        assert.contains('i12345');
      });
    });
    module('when the external id is not present', function() {
      test('it does not display the external id', async function(assert) {
        this.participation = {
          participantExternalId: null,
          isShared: false,
        };
        this.campaign = {};

        await render(hbs`<Participant::Assessment::Header @participation={{participation}} @campaign={{campaign}} />`);

        assert.notContains('identifiant de l’élève');
      });
    });
  });

  module('results information', function() {
    module('when the participation is shared', function() {
      test('it should not display campaign progression', async function(assert) {
        this.participation = { progression: 100, isShared: true };
        this.campaign = {};

        await render(hbs`<Participant::Assessment::Header @participation={{participation}} @campaign={{campaign}} />`);

        assert.notContains('Avancement');
        assert.notContains('100%');
      });

      test('it displays campaign participation details of mastery percentage (validated skills over total skills)', async function(assert) {
        this.participation = {
          validatedSkillsCount: 45,
          targetedSkillsCount: 50,
          isShared: true,
        };
        this.campaign = {};

        await render(hbs`<Participant::Assessment::Header @participation={{participation}} @campaign={{campaign}} />`);

        assert.dom('[aria-label="Résultat"]').containsText('45 / 50 ACQUIS');
      });

      module('when the campaign has stages', function() {
        test('it displays stages acquired', async function(assert) {
          this.campaign = {
            hasStages: true,
            stages: [{ threshold: 20 }, { threshold: 70 }],
          };
          this.participation = {
            masteryPercentage: 65,
            isShared: true,
          };

          await render(hbs`<Participant::Assessment::Header @participation={{participation}} @campaign={{campaign}} />`);

          assert.dom('[aria-label="Paliers"]').containsText('1 étoiles sur 2');
        });
      });

      module('when the campaign has no stages', function() {
        test('it displays campaign participation mastery percentage', async function(assert) {
          this.participation = { masteryPercentage: 65, isShared: true };
          this.campaign = {};

          await render(hbs`<Participant::Assessment::Header @participation={{participation}} @campaign={{campaign}} />`);

          assert.contains('65%');
        });
      });

      module('when the campaign has badges', function() {
        test('it displays badges acquired', async function(assert) {
          this.campaign = { hasBadges: true };
          this.participation = { isShared: true, badges: [{ id: 1, title: 'Les bases' }] };

          await render(hbs`<Participant::Assessment::Header @participation={{participation}} @campaign={{campaign}} />`);

          assert.dom('[aria-label="Résultats Thématiques"]').containsText('Les bases');
        });
      });

      module('when the campaign has no badges', function() {
        test('it does not display badges acquired', async function(assert) {
          this.campaign = { hasBadges: false };
          this.participation = { isShared: true, badges: [{ id: 1, title: 'Les bases' }] };

          await render(hbs`<Participant::Assessment::Header @participation={{participation}} @campaign={{campaign}} />`);

          assert.dom('[aria-label="Résultats Thématiques"]').doesNotExist();
        });
      });

      module('when the campaign has badges but the participant has not acquired one', function() {
        test('it does not display badges', async function(assert) {
          this.campaign = { hasBadges: true };
          this.participation = { isShared: true, badges: [] };

          await render(hbs`<Participant::Assessment::Header @participation={{participation}} @campaign={{campaign}} />`);

          assert.dom('[aria-label="Résultats Thématiques"]').doesNotExist();
        });
      });
    });

    module('when the participation is not shared', function() {
      test('it does not display results', async function(assert) {
        this.participation = { isShared: false };
        this.campaign = {};

        await render(hbs`<Participant::Assessment::Header @participation={{participation}} @campaign={{campaign}} />`);

        assert.dom('[aria-label="Résultat"]').doesNotExist();
      });
    });
  });
});
