import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Replace extends Component {
  @tracked displayModal = false;
  @service intl;

  get acceptedFileType() {
    const types = this.args.supportedFormats.join(
      this.intl.t('pages.organization-participants-import.file-type-separator'),
    );
    return this.intl.t('pages.organization-participants-import.supported-formats', { types });
  }

  @action
  toggleModal() {
    this.displayModal = !this.displayModal;
  }
}
