import Controller from '@ember/controller';

const LINK_SCO = 'http://cloud.pix.fr/s/GqwW6dFDDrHezfS';
const LINK_OTHER = 'http://cloud.pix.fr/s/fLSG4mYCcX7GDRF';

export default class AuthenticatedController extends Controller {
  get documentationLink() {
    if (this.model.isSco) {
      return LINK_SCO;
    }
    return LINK_OTHER;
  }
}
