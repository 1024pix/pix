import Component from '@glimmer/component';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';

export default class OrganizationAllTags extends Component {

  get allTags() {

    const organizationTagsNames = map(this.args.model.organization.tags.toArray(), 'name');
    const allTags = sortBy(this.args.model.allTags.toArray(), 'name');

    return map(allTags, (tag) => {
      if (organizationTagsNames.includes(tag.name)) {
        return { name: tag.name, isTagAssignedToOrganization: true };
      }
      else {
        return { name: tag.name, isTagAssignedToOrganization: false };
      }
    });
  }
}
