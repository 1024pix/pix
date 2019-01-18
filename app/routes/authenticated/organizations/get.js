import Route from '@ember/routing/route';

export default Route.extend({

  async model(params) {
    const store = this.get('store');
    const organization = await store.findRecord('organization', params.organization_id);
    const users = await store.query('user', { organizationId: organization.id });
    return { organization, users };
  }

});
