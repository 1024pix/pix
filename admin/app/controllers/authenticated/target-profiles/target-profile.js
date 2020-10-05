import Controller from '@ember/controller';

export default class TargetProfileController extends Controller {
  get isPublic() {
    return this.model.isPublic ? 'Oui' : 'Non';
  }

  get isOutdated() {
    return this.model.outdated ? 'Oui' : 'Non';
  }
}
