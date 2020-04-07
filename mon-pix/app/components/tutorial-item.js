import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const statusTypes = {
  unsaved: 'unsaved',
  saving: 'saving',
  saved: 'saved',
};

export default class TutorialItemComponent extends Component {
  @service store;
  @service currentUser;

  imageForFormat = {
    'vidéo': 'video',
    'son': 'son',
    'page': 'page'
  };
  @tracked status = statusTypes.unsaved;

  constructor(owner, args) {
    super(owner, args);
    this.status = this.tutorial.isSaved ? statusTypes.saved : statusTypes.unsaved;
  }

  get tutorial() {
    return this.args.tutorial;
  }

  get formatImageName() {
    const format = this.args.tutorial.format;
    if (this.imageForFormat[format]) {
      return this.imageForFormat[format];
    }
    return 'page';
  }

  get isSaved() {
    return this.status === 'saved';
  }

  get buttonText() {
    return this.status === statusTypes.saved ? 'Retirer' : 'Enregistrer';
  }

  get buttonTitle() {
    return this.status === statusTypes.saved ? 'Retirer' : 'Enregistrer dans ma liste de tutos';
  }

  get isButtonDisabled() {
    return this.status === statusTypes.saving;
  }

  @action
  async saveTutorial() {
    this.status = statusTypes.saving;
    const userTutorial = this.store.createRecord('userTutorial', { tutorial: this.tutorial });
    try {
      await userTutorial.save({ adapterOptions: { tutorialId: this.tutorial.id } });
      userTutorial.tutorial = this.tutorial;
      this.status = statusTypes.saved;
    } catch (e) {
      this.status = statusTypes.unsaved;
    }
  }

  @action
  async removeTutorial() {
    this.status = statusTypes.saving;
    try {
      await this.tutorial.userTutorial.destroyRecord({ adapterOptions: { tutorialId: this.tutorial.id } });
      this.status = statusTypes.unsaved;
    } catch (e) {
      this.status = statusTypes.saved;
    }
  }

}
