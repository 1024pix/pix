import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import set from 'lodash/set';

import { optionsLocaleList, optionsTypeList } from '../../models/training';

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

  constructor({ title, link, type, duration, locale, editorLogoUrl, editorName } = {}) {
    this.title = title || null;
    this.link = link || null;
    this.type = type || null;
    this.duration = duration || { days: 0, hours: 0, minutes: 0 };
    this.locale = locale || null;
    this.editorLogoUrl = editorLogoUrl?.split('/').at(-1) || null;
    this.editorName = editorName || null;
  }
}

export default class CreateOrUpdateTrainingForm extends Component {
  @service notifications;

  @tracked submitting = false;

  constructor() {
    super(...arguments);
    this.optionsTypeList = optionsTypeList;
    this.optionsLocaleList = optionsLocaleList;
    this.form = new Form(this.args.model);
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
