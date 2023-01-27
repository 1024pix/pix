import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { optionsLocaleList, optionsTypeList } from '../../models/training';
import { tracked } from '@glimmer/tracking';
import set from 'lodash/set';

class Form {
  @tracked title;
  @tracked link;
  @tracked type;
  @tracked duration = {
    days: 0,
    hours: 0,
    minutes: 0,
  };
  @tracked locale;
  @tracked editorLogoUrl;
  @tracked editorName;
}

export default class CreateTrainingForm extends Component {
  @service notifications;

  @tracked submitting = false;

  constructor() {
    super(...arguments);
    this.optionsTypeList = optionsTypeList;
    this.optionsLocaleList = optionsLocaleList;
    this.form = new Form();
  }

  @action
  updateForm(key, event) {
    set(this.form, key, event.target.value.trim());
  }

  @action
  updateSelect(key, value) {
    set(this.form, key, value);
  }

  @action
  async onSubmit(event) {
    event.preventDefault();

    const training = {
      title: this.form.title,
      link: this.form.link,
      type: this.form.type,
      duration: this.form.duration,
      locale: this.form.locale,
      editorName: this.form.editorName,
    };
    training.editorLogoUrl = `https://images.pix.fr/contenu-formatif/editeur/${this.form.editorLogoUrl}`;

    try {
      this.submitting = true;
      await this.args.onSubmit(training);
    } finally {
      this.submitting = false;
    }
  }
}
