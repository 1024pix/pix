import Route from '@ember/routing/route';

export default Route.extend({

  async model(params) {
    const organization = await this.get('store').findRecord('organization', params.organization_id);
    return { organization, userEmail: null };
  }

});
