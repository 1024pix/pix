import _ from 'lodash';
import { NoOrganizationToAttach } from '../errors';

class OrganizationsToAttachToTargetProfile {
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

export default OrganizationsToAttachToTargetProfile;
