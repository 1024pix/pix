import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | organizations/information-section-edit', function (hooks) {
  setupTest(hooks);

  module('when "Aucun" is selected as SSO', function () {
    test('it should set identityProviderForCampaigns to null', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const organization = store.createRecord('organization', {
        id: 1,
        features: {
          PLACES_MANAGEMENT: { active: false },
          MULTIPLE_SENDING_ASSESSMENT: { active: false },
          COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY: { active: false },
        },
      });
      const component = createGlimmerComponent('component:organizations/information-section-edit', {
        organization,
        toggleEditMode: sinon.stub(),
        onSubmit: sinon.stub(),
      });
      const validations = { isValid: true };
      component.form.validate = sinon.stub().returns({ validations });

      const event = {
        preventDefault: sinon.stub(),
      };
      component._initForm = sinon.stub();

      // when
      await component.updateOrganization(event);

      // then
      assert.strictEqual(component.form.identityProviderForCampaigns, null);
    });
  });
});
