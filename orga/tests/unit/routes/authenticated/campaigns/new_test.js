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
    const storeStub = {
      findAll: findAllStub.resolves(members),
      createRecord: sinon.stub(),
    };
    route.store = storeStub;

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

    const duplicatedCampaignRecord = Symbol('duplicated campaign record');

    const findAllStub = sinon.stub();
    const createRecordStub = sinon.stub();

    const storeStub = {
      findAll: findAllStub.resolves(members),
      createRecord: createRecordStub.resolves(duplicatedCampaignRecord),
    };
    route.store = storeStub;

    // when
    const model = await route.model();

    assert.strictEqual(await model.campaign, duplicatedCampaignRecord);
    sinon.assert.calledWithExactly(createRecordStub, 'campaign', expectedCampaignAttributes);
  });

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

    const storeStub = {
      findAll: findAllStub.resolves(members),
      createRecord: createRecordStub.resolves(duplicatedCampaignRecord),
      findRecord: findRecordStub.resolves(sourceCampaign),
      peekRecord: peekRecordStub.returns(targetProfile),
    };
    route.store = storeStub;

    // when
    const model = await route.model({ source: Symbol('source campaign id') });

    assert.strictEqual(await model.campaign, duplicatedCampaignRecord);
    sinon.assert.calledWithExactly(createRecordStub, 'campaign', expectedCampaignAttributes);
  });
});
