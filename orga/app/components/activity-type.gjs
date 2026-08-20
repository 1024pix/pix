import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { service } from '@ember/service';
import Component from '@glimmer/component';

const types = {
  ASSESSMENT: {
    icon: 'speed',
    class: 'assessment',
  },
  campaign: {
    icon: 'speed',
    class: 'assessment',
  },
  PROFILES_COLLECTION: {
    icon: 'profileShare',
    class: 'profiles-collection',
  },
  EXAM: {
    icon: 'school',
    class: 'exam',
  },
  COMBINED_COURSE: {
    icon: 'studyLesson',
    class: 'combined-course',
  },
  module: {
    icon: 'book',
    class: 'module',
  },
  formation: {
    icon: 'lock',
    class: 'formation',
  },
};

export default class ActivityType extends Component {
  @service intl;

  get icon() {
    return types[this.args.type].icon;
  }

  get pictoCssClass() {
    const classes = ['activity-type__icon'];
    classes.push('activity-type__icon--' + types[this.args.type].class);
    if (this.args.big) {
      classes.push(classes[0] + '--big');
    }
    return classes.join(' ');
  }

  get pictoAriaHidden() {
    return !this.args.hideLabel;
  }

  get pictoTitle() {
    return this.args.hideLabel ? this.label : null;
  }

  get label() {
    const { type, displayInformationLabel } = this.args;
    const i18nKey = displayInformationLabel ? 'information' : 'explanation';
    return this.intl.t(`components.activity-type.${i18nKey}.${type}`);
  }

  <template>
    <span class="activity-type">
      <PixIcon
        class={{this.pictoCssClass}}
        @name={{this.icon}}
        @ariaHidden={{this.pictoAriaHidden}}
        @title={{this.pictoTitle}}
        ...attributes
      />
      {{#unless @hideLabel}}
        <span class="activity-type__label">{{this.label}}</span>
      {{/unless}}
    </span>
  </template>
}
