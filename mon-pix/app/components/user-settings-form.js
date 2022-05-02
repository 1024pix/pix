import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class UserSettingsFormComponent extends Component {
  @tracked selectedColor;

  constructor() {
    super(...arguments);

    this.selectedColor = this.args.userSettings.color;
  }

  get options() {
    return [
      { value: 'red', label: 'red' },
      { value: 'blue', label: 'blue' },
      { value: 'green', label: 'green' },
      { value: 'yellow', label: 'yellow' },
    ];
  }

  get lastModified() {
    return this.args.userSettings.updatedAt;
  }

  @action
  onChange(e) {
    this.selectedColor = e.target.value;
  }

  @action
  onSubmit() {
    this.args.userSettings.color = this.selectedColor;
    this.args.userSettings.save();
  }
}
