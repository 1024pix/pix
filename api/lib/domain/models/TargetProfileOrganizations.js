const _ = require('lodash');
const { NoOrganizationToAttach } = require('../errors');

class TargetProfileOrganizations {
  constructor({ id }) {
    this.id = id;
  }

  attach(organizationIds) {
    if (_.isEmpty(organizationIds)) {
      throw new NoOrganizationToAttach(`Il n'y a aucune organisation à rattacher.`);
    }
    this.organizations = _.uniq(organizationIds);
  }
}

module.exports = TargetProfileOrganizations;
