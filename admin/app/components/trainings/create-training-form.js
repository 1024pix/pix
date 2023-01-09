import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { optionsLocaleList, optionsTypeList } from '../../models/training';
import { tracked } from '@glimmer/tracking';
import set from 'lodash/set';

export default class CreateTrainingForm extends Component {
  @service notifications;

  @tracked submitting = false;

  @tracked form = { duration: { days: 0, hours: 0, minutes: 0 } };

  constructor() {
    super(...arguments);
    this.optionsTypeList = optionsTypeList;
    this.optionsLocaleList = optionsLocaleList;
  }

  @action
  updateForm(key, event) {
    set(this.form, key, event.target.value);
  }

  @action
  updateEditorLogoUrl(event) {
    this.form.editorLogoUrl = `https://images.pix.fr/contenu-formatif/editeur/${event.target.value}`;
  }

  @action
  async onSubmit(event) {
    event.preventDefault();
    const training = { ...this.form };
    try {
      this.submitting = true;
      await this.args.onSubmit(training);
    } finally {
      this.submitting = false;
    }
  }
}
