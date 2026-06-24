import EmberObject from '@ember/object';
import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntl from '../../../../helpers/setup-intl';

module('Unit | Route | authenticated/campaigns/new-catalogue', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  test('should return members', async function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/campaigns/new-catalogue');

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
    const route = this.owner.lookup('route:authenticated/campaigns/new-catalogue');

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

  module('when courseId param is defined', function (hooks) {
    const organizationId = 12345;
    const createdCampaignRecord = {};
    let courseRecord;
    let peekRecordStub;

    hooks.beforeEach(async function () {
      const organization = EmberObject.create({
        id: organizationId,
      });

      const prescriber = { id: Symbol('prescriber id') };

      class CurrentUserStub extends Service {
        organization = organization;
        prescriber = prescriber;
      }

      this.owner.register('service:current-user', CurrentUserStub);

      const members = Symbol('list of members sorted by firstnames and lastnames');

      const findAllStub = sinon.stub();
      const createRecordStub = sinon.stub();
      peekRecordStub = sinon.stub();

      courseRecord = {
        id: Symbol('target profile overview id'),
      };

      class StoreStub extends Service {
        findAll = findAllStub.resolves(members);
        createRecord = createRecordStub.resolves(createdCampaignRecord);
        peekRecord = peekRecordStub.resolves(courseRecord);
      }

      this.owner.register('service:store', StoreStub);
    });

    test('should return a campaign with course set', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/campaigns/new-catalogue');

      courseRecord.type = 'targetProfile';

      // when
      const model = await route.model({ courseId: courseRecord.id });

      assert.strictEqual(model.campaign.course, courseRecord);
      sinon.assert.calledWithExactly(peekRecordStub, 'course', courseRecord.id, {
        adapterOptions: { organizationId },
      });
    });

    module('when course is a target profile', function () {
      test('it should set the campaign type to ASSESSMENT', async function (assert) {
        // given
        const route = this.owner.lookup('route:authenticated/campaigns/new-catalogue');

        courseRecord.type = 'targetProfile';

        // when
        const model = await route.model({ courseId: courseRecord.id });

        assert.strictEqual(model.campaign.type, 'ASSESSMENT');
      });
    });

    module('when course is a blueprint', function () {
      test('it should set the campaign type to COMBINED_COURSE', async function (assert) {
        // given
        const route = this.owner.lookup('route:authenticated/campaigns/new-catalogue');

        courseRecord.type = 'blueprint';

        // when
        const model = await route.model({ courseId: courseRecord.id });

        assert.strictEqual(model.campaign.type, 'COMBINED_COURSE');
      });
    });
  });

  module('when duplicating a campaign', function () {
    module('when campaign type is ASSESSMENT', function () {
      test('should prefill campaign attributes from given source campaign', async function (assert) {
        // given
        const route = this.owner.lookup('route:authenticated/campaigns/new-catalogue');

        const organization = EmberObject.create({
          id: 12345,
          targetProfiles: new Promise((resolve) => resolve([])),
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
          externalIdLabel: Symbol('campaign external id'),
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
        assert.false(model.targetProfiles instanceof Promise);
      });
    });

    module('when campaign type is PROFILES_COLLECTION', function () {
      test('should prefill campaign attributes from given source campaign', async function (assert) {
        // given
        const route = this.owner.lookup('route:authenticated/campaigns/new-catalogue');

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
          externalIdLabel: Symbol('campaign external id'),
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

      const replaceWithStub = sinon.stub();

      class RouterStub extends Service {
        replaceWith = replaceWithStub.returns();
      }

      this.owner.register('service:router', RouterStub);

      const route = this.owner.lookup('route:authenticated/campaigns/new-catalogue');

      // when
      const model = await route.model({ source: Symbol('source campaign id') });

      assert.strictEqual(await model.campaign, createdCampaignRecord);
      sinon.assert.calledWithExactly(createRecordStub, 'campaign', expectedCampaignAttributes);
      sinon.assert.calledWithMatch(replaceWithStub, 'authenticated.campaigns.new', {
        queryParams: { source: null },
      });
    });
  });

  module('resetController', function () {
    test('should reset source and courseId when isExiting true', function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/campaigns/new-catalogue');
      const controller = { set: sinon.stub() };

      // when
      route.resetController(controller, true);

      // then
      assert.true(controller.set.firstCall.calledWithExactly('source', null));
      assert.true(controller.set.secondCall.calledWithExactly('courseId', null));
    });
  });

  module('beforeModel', function (hooks) {
    let route;

    hooks.beforeEach(function () {
      route = this.owner.lookup('route:authenticated/campaigns/new-catalogue');
    });

    hooks.afterEach(function () {
      sinon.restore();
    });

    module('When places limit is reached', function () {
      test('should redirect to main campaign page', function (assert) {
        //given
        const modelForStub = sinon.stub(route, 'modelFor');
        const replaceWithStub = sinon.stub(route.router, 'replaceWith');

        modelForStub.withArgs('authenticated').returns({ hasReachedMaximumPlacesLimit: true });

        //when
        route.beforeModel();

        //then
        assert.ok(replaceWithStub.calledWithExactly('authenticated.campaigns'));
      });
    });

    module('When places limit is not reached', function () {
      test('should not redirect to main campaign page', function (assert) {
        //given
        const modelForStub = sinon.stub(route, 'modelFor');
        const replaceWithStub = sinon.stub(route.router, 'replaceWith');

        modelForStub.withArgs('authenticated').returns({ hasReachedMaximumPlacesLimit: false });

        //when
        route.beforeModel();

        //then
        assert.notOk(replaceWithStub.called);
      });
    });
  });
});
