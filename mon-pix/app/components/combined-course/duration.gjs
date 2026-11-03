import { PixIcon } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { CombinedCourseDurationTypes } from 'mon-pix/models/combined-course';

export default class Duration extends Component {
  @service intl;

  get displayedDuration() {
    if (this.args.isCustomDurationFormat) {
      switch (this.args.duration) {
        case CombinedCourseDurationTypes.VERY_SHORT:
          return this.intl.t('pages.combined-courses.content.duration-options.very-short');
        case CombinedCourseDurationTypes.SHORT:
          return this.intl.t('pages.combined-courses.content.duration-options.short');
        case CombinedCourseDurationTypes.MEDIUM:
          return this.intl.t('pages.combined-courses.content.duration-options.medium');
        case CombinedCourseDurationTypes.LONG:
          return this.intl.t('pages.combined-courses.content.duration-options.long');
        case CombinedCourseDurationTypes.VERY_LONG:
          return this.intl.t('pages.combined-courses.content.duration-options.very-long');
      }
    }

    return this.intl.t('pages.combined-courses.content.duration.estimated-duration-in-minutes', {
      duration: this.args.duration,
    });
  }

  get ariaLabel() {
    if (!this.args.isCustomDurationFormat) {
      return this.intl.t('pages.combined-courses.content.duration.aria-label-estimated-in-minutes', {
        duration: this.args.duration,
      });
    }

    return this.intl.t('pages.combined-courses.content.duration.aria-label-estimated', {
      duration: this.displayedDuration,
    });
  }

  <template>
    <dl>
      <dt>
        <PixIcon @name="time" class="duration__icon" @ariaHidden={{true}} />
      </dt>
      <dd>
        <span aria-label={{this.ariaLabel}}>
          {{this.displayedDuration}}
        </span>
      </dd>
    </dl>
  </template>
}
