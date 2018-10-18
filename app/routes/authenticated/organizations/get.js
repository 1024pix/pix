import Route from '@ember/routing/route';

export default Route.extend({

  model(params) {
    return this.get('store').findRecord('organization', params.organization_id)
      .then((organization) => {
        organization.set('members', [
          {firstName: 'Bruce', lastName: 'Wayne', email: 'bruce.wayne@gotham.city', role: 'OWNER'},
          {firstName: 'Selina', lastName: 'Kyle', email: 'selina.kyle@gotham.city', role: 'PRESCRIBER'},
          ]);
        return organization;
      });
  }

});
