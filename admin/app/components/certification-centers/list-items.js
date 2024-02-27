import Component from '@glimmer/component';

export default class CertificationCenterListItems extends Component {
  searchedId = this.args.id;
  searchedName = this.args.name;
  searchedType = this.args.type;
  searchedExternalId = this.args.externalId;
}
