import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign/profile | profile', function(hooks) {
  setupRenderingTest(hooks);

  test('it displays user information', async function(assert) {
    const campaignProfile = {
      firstName: 'Godefroy',
      lastName: 'de Montmirail',
    };

    const campaign = {};

    this.campaignProfile = campaignProfile;
    this.campaign = campaign;

    await render(hbs`<Routes::Authenticated::Campaigns::Profile::Profile @campaignProfile={{campaignProfile}} @campaign={{campaign}} />`);

    assert.contains('Godefroy de Montmirail');
  });

  test('it displays campaign particiaption creation date', async function(assert) {
    const campaignProfile = {
      createdAt: '2020-01-01',
    };

    const campaign = {};

    this.campaignProfile = campaignProfile;
    this.campaign = campaign;

    await render(hbs`<Routes::Authenticated::Campaigns::Profile::Profile @campaignProfile={{campaignProfile}} @campaign={{campaign}} />`);

    assert.contains('01 janv. 2020');
  });

  module('shared at', function() {
    module('when the sharing date is present', function() {
      test('it displays the sharing date', async function(assert) {
        const campaignProfile = {
          sharedAt: '2020-01-02'
        };

        const campaign = {};

        this.campaignProfile = campaignProfile;
        this.campaign = campaign;

        await render(hbs`<Routes::Authenticated::Campaigns::Profile::Profile @campaignProfile={{campaignProfile}} @campaign={{campaign}} />`);

        assert.contains('02 janv. 2020');
      });
    });
    module('when the sharing date is not present', function() {
      test('it displays non disponible', async function(assert) {
        const campaignProfile = {
        };

        const campaign = {};

        this.campaignProfile = campaignProfile;
        this.campaign = campaign;

        await render(hbs`<Routes::Authenticated::Campaigns::Profile::Profile @campaignProfile={{campaignProfile}} @campaign={{campaign}} />`);

        assert.contains('Non disponible');
      });
    });
  });

  module('identifiant', function() {
    module('when the external id is present', function() {
      test('it displays the external id', async function(assert) {
        const campaignProfile = {
          externalId: 'i12345'
        };

        const campaign = {};

        this.campaignProfile = campaignProfile;
        this.campaign = campaign;

        await render(hbs`<Routes::Authenticated::Campaigns::Profile::Profile @campaignProfile={{campaignProfile}} @campaign={{campaign}} />`);

        assert.contains('i12345');
      });
    });
    module('when the external id is not present', function() {
      test('it does not display the external id', async function(assert) {
        const campaignProfile = {
          externalId: null
        };

        const campaign = {};

        this.campaignProfile = campaignProfile;
        this.campaign = campaign;

        await render(hbs`<Routes::Authenticated::Campaigns::Profile::Profile @campaignProfile={{campaignProfile}} @campaign={{campaign}} />`);

        assert.notContains('Identifiant');
      });
    });
  });

  module('certification info', function() {
    module('when the  profile is shared', function() {
      test('it displays the pix score', async function(assert) {
        const campaignProfile = {
          pixScore: '1024',
          isShared: true
        };

        const campaign = {};

        this.campaignProfile = campaignProfile;
        this.campaign = campaign;

        await render(hbs`<Routes::Authenticated::Campaigns::Profile::Profile @campaignProfile={{campaignProfile}} @campaign={{campaign}} />`);

        assert.contains('1024');
      });

      test('it displays the total number of competence', async function(assert) {
        const campaignProfile = {
          competencesCount: 12,
          isShared: true
        };

        const campaign = {};

        this.campaignProfile = campaignProfile;
        this.campaign = campaign;

        await render(hbs`<Routes::Authenticated::Campaigns::Profile::Profile @campaignProfile={{campaignProfile}} @campaign={{campaign}} />`);
        assert.contains('/\u00a012');
      });

      test('it displays the total number of certifiable competence', async function(assert) {
        const campaignProfile = {
          certifiableCompetencesCount: 2,
          isShared: true
        };

        const campaign = {};

        this.campaignProfile = campaignProfile;
        this.campaign = campaign;

        await render(hbs`<Routes::Authenticated::Campaigns::Profile::Profile @campaignProfile={{campaignProfile}} @campaign={{campaign}} />`);

        assert.contains('2');
      });

      module('certifiable badge', function() {
        module('when the profile is certifiable', function() {
          test('it displays certifiable', async function(assert) {
            const campaignProfile = {
              isCertifiable: true,
              isShared: true
            };

            const campaign = {};

            this.campaignProfile = campaignProfile;
            this.campaign = campaign;

            await render(hbs`<Routes::Authenticated::Campaigns::Profile::Profile @campaignProfile={{campaignProfile}} @campaign={{campaign}} />`);

            assert.contains('Certifiable');
          });
        });

        module('when the profile is not certifiable', function() {
          test('it does not display certifiable', async function(assert) {
            const campaignProfile = {
              isCertifiable: false,
              isShared: true
            };

            const campaign = {};

            this.campaignProfile = campaignProfile;
            this.campaign = campaign;

            await render(hbs`<Routes::Authenticated::Campaigns::Profile::Profile @campaignProfile={{campaignProfile}} @campaign={{campaign}} />`);

            assert.notContains('Certifiable');
          });
        });
      });
    });

    module('when the  profile is not shared', function() {
      test('it does not display the pix score', async function(assert) {
        const campaignProfile = {
          isShared: false
        };

        const campaign = {};

        this.campaignProfile = campaignProfile;
        this.campaign = campaign;

        await render(hbs`<Routes::Authenticated::Campaigns::Profile::Profile @campaignProfile={{campaignProfile}} @campaign={{campaign}} />`);

        assert.notContains('PIX');
      });

      test('it does not display the total number of competence', async function(assert) {
        const campaignProfile = {
          competencesCount: 12,
          isShared: false
        };

        const campaign = {};

        this.campaignProfile = campaignProfile;
        this.campaign = campaign;

        await render(hbs`<Routes::Authenticated::Campaigns::Profile::Profile @campaignProfile={{campaignProfile}} @campaign={{campaign}} />`);

        assert.notContains('12');
        assert.notContains('COMP. CERTIFIABLE');
      });

      test('it does not display the total number of certifiable competence', async function(assert) {
        const campaignProfile = {
          certifiableCompetencesCount: 30,
          isShared: false
        };

        const campaign = {};

        this.campaignProfile = campaignProfile;
        this.campaign = campaign;

        await render(hbs`<Routes::Authenticated::Campaigns::Profile::Profile @campaignProfile={{campaignProfile}} @campaign={{campaign}} />`);

        assert.notContains('30');
      });

      test('it does not display certifiable badge', async function(assert) {
        const campaignProfile = {
          isCertifiable: true,
          isShared: false
        };

        const campaign = {};

        this.campaignProfile = campaignProfile;
        this.campaign = campaign;

        await render(hbs`<Routes::Authenticated::Campaigns::Profile::Profile @campaignProfile={{campaignProfile}} @campaign={{campaign}} />`);

        assert.notContains('Certifiable');
      });
    });
  });
});
