import Component from '@glimmer/component';

export default class OrganizationAllTags extends Component {

  get allTags() {

    const organizationTags = this.args.model.organizationTags;
    const allTags = this.args.model.allTags;

    const organizationTagsName = [];
    organizationTags.forEach((tag) => {
      organizationTagsName.push(tag.name);
    });

    const allTagsAssociatedToCurrentOrganization = [];
    allTags.forEach((tag) => {
      if (organizationTagsName.includes(tag.name)) {
        allTagsAssociatedToCurrentOrganization.push({ name: tag.name, isTagAssociateToOrganization: true });
      }
      else {
        allTagsAssociatedToCurrentOrganization.push({ name: tag.name, isTagAssociateToOrganization: false });
      }
    });

    return allTagsAssociatedToCurrentOrganization;
  }
}
