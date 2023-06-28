import _ from 'lodash';

class TargetProfile {
  constructor({ id }) {
    this.id = id;
  }

  detach(organizationIds) {
    this.organizationIdsToDetach = _.uniq(organizationIds);
  }
}

export { TargetProfile };
