import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupIntl from '../../../../helpers/setup-intl';
import Service from '@ember/service';
import EmberObject from '@ember/object';
import sinon from 'sinon';

module('Unit | Route | authenticated/campaigns/new', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  test('should return members', async function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/campaigns/new');

    class CurrentUserStub extends Service {
      organization = EmberObject.create({
        id: 12345,
      });
      prescriber = { id: Symbol('prescriber id') };
    }

    this.owner.register('service:current-user', CurrentUserStub);

    const members = Symbol('list of members sorted by firstnames and lastnames');
    const findAllStub = sinon.stub();

    class StoreStub extends Service {
      findAll = findAllStub.resolves(members);
      createRecord = sinon.stub();
    }

    this.owner.register('service:store', StoreStub);

    // when
    const result = await route.model();

    //then
    assert.strictEqual(result.membersSortedByFullName, members);
  });

  test('should return an empty campaign when there is no given source', async function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/campaigns/new');

    const organization = EmberObject.create({
      id: 12345,
    });

    const prescriber = { id: Symbol('prescriber id') };

    class CurrentUserStub extends Service {
      organization = organization;
      prescriber = prescriber;
    }

    this.owner.register('service:current-user', CurrentUserStub);

    const members = Symbol('list of members sorted by firstnames and lastnames');

    const expectedCampaignAttributes = {
      organization,
      ownerId: prescriber.id,
    };

    const createdCampaignRecord = Symbol('created campaign record');

    const findAllStub = sinon.stub();
    const createRecordStub = sinon.stub();

    class StoreStub extends Service {
      findAll = findAllStub.resolves(members);
      createRecord = createRecordStub.resolves(createdCampaignRecord);
    }

    this.owner.register('service:store', StoreStub);

    // when
    const model = await route.model();

    assert.strictEqual(await model.campaign, createdCampaignRecord);
    sinon.assert.calledWithExactly(createRecordStub, 'campaign', expectedCampaignAttributes);
  });

  module('when duplicating a campaign', function () {
    module('when campaign type is ASSESSMENT', function () {
      test('should prefill campaign attributes from given source campaign', async function (assert) {
        // given
        const route = this.owner.lookup('route:authenticated/campaigns/new');

        const organization = EmberObject.create({
          id: 12345,
        });

        class CurrentUserStub extends Service {
          organization = organization;
          prescriber = { id: Symbol('prescriber id') };
        }

        this.owner.register('service:current-user', CurrentUserStub);

        const members = Symbol('list of members sorted by firstnames and lastnames');
        const sourceCampaign = {
          name: 'A real campaign name',
          type: Symbol('campaign type'),
          title: Symbol('campaign title'),
          description: Symbol('campaign description'),
          targetProfileId: Symbol('campaign target profile id'),
          ownerId: Symbol('campaign owner id'),
          multipleSendings: Symbol('campaign multiple sendings activation'),
          idPixLabel: Symbol('campaign external id'),
          customLandingPageText: Symbol('campaign custom landing page text'),
        };
        const targetProfile = Symbol('campaign target profile');

        const expectedCampaignAttributes = {
          ...sourceCampaign,
          name: 'Copie de A real campaign name',
          targetProfile,
          organization,
        };

        const duplicatedCampaignRecord = Symbol('duplicated campaign record');

        const findAllStub = sinon.stub();
        const findRecordStub = sinon.stub();
        const peekRecordStub = sinon.stub();
        const createRecordStub = sinon.stub();

        class StoreStub extends Service {
          findAll = findAllStub.resolves(members);
          createRecord = createRecordStub.resolves(duplicatedCampaignRecord);
          findRecord = findRecordStub.resolves(sourceCampaign);
          peekRecord = peekRecordStub.returns(targetProfile);
        }

        this.owner.register('service:store', StoreStub);

        // when
        const model = await route.model({ source: Symbol('source campaign id') });

        assert.strictEqual(await model.campaign, duplicatedCampaignRecord);
        sinon.assert.calledWithExactly(createRecordStub, 'campaign', expectedCampaignAttributes);
      });
    });

    module('when campaign type is PROFILES_COLLECTION', function () {
      test('should prefill campaign attributes from given source campaign', async function (assert) {
        // given
        const route = this.owner.lookup('route:authenticated/campaigns/new');

        const organization = EmberObject.create({
          id: 12345,
        });

        class CurrentUserStub extends Service {
          organization = organization;
          prescriber = { id: Symbol('prescriber id') };
        }

        this.owner.register('service:current-user', CurrentUserStub);

        const members = Symbol('list of members sorted by firstnames and lastnames');
        const sourceCampaign = {
          name: 'A real campaign name',
          type: Symbol('campaign type'),
          title: Symbol('campaign title'),
          description: Symbol('campaign description'),
          ownerId: Symbol('campaign owner id'),
          multipleSendings: Symbol('campaign multiple sendings activation'),
          idPixLabel: Symbol('campaign external id'),
          customLandingPageText: Symbol('campaign custom landing page text'),
        };

        const expectedCampaignAttributes = {
          ...sourceCampaign,
          name: 'Copie de A real campaign name',
          organization,
        };

        const duplicatedCampaignRecord = Symbol('duplicated campaign record');

        const findAllStub = sinon.stub();
        const findRecordStub = sinon.stub();
        const peekRecordStub = sinon.stub();
        const createRecordStub = sinon.stub();

        class StoreStub extends Service {
          findAll = findAllStub.resolves(members);
          createRecord = createRecordStub.resolves(duplicatedCampaignRecord);
          findRecord = findRecordStub.resolves(sourceCampaign);
          peekRecord = peekRecordStub;
        }

        this.owner.register('service:store', StoreStub);

        // when
        const model = await route.model({ source: Symbol('source campaign id') });

        assert.strictEqual(await model.campaign, duplicatedCampaignRecord);
        sinon.assert.calledWithExactly(createRecordStub, 'campaign', expectedCampaignAttributes);
        sinon.assert.notCalled(peekRecordStub);
      });
    });

    test('should return empty campaign when searching for given source campaign raises an error', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/campaigns/new');
      sinon.stub(route.router, 'replaceWith');

      const organization = EmberObject.create({
        id: 12345,
      });

      const prescriber = { id: Symbol('prescriber id') };

      class CurrentUserStub extends Service {
        organization = organization;
        prescriber = prescriber;
      }

      this.owner.register('service:current-user', CurrentUserStub);

      const members = Symbol('list of members sorted by firstnames and lastnames');

      const expectedCampaignAttributes = {
        organization,
        ownerId: prescriber.id,
      };

      const createdCampaignRecord = Symbol('created campaign record');

      const findAllStub = sinon.stub();
      const findRecordStub = sinon.stub();
      const createRecordStub = sinon.stub();

      class StoreStub extends Service {
        findAll = findAllStub.resolves(members);
        findRecord = findRecordStub.rejects(new Error());
        createRecord = createRecordStub.resolves(createdCampaignRecord);
      }

      this.owner.register('service:store', StoreStub);

      // when
      const model = await route.model({ source: Symbol('source campaign id') });

      assert.strictEqual(await model.campaign, createdCampaignRecord);
      sinon.assert.calledWithExactly(createRecordStub, 'campaign', expectedCampaignAttributes);
      assert.ok(
        route.router.replaceWith.calledWithMatch('authenticated.campaigns.new', {
          queryParams: { source: null },
        }),
      );
    });
  });

  module('resetController', function () {
    test('should reset source to null when isExiting true', function (assert) {
      const route = this.owner.lookup('route:authenticated/campaigns/new');

      const controller = { set: sinon.stub() };
      route.resetController(controller, true);
      assert.true(controller.set.calledWithExactly('source', null));
    });
  });
});
