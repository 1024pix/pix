import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class Level extends Component {
  @service intl;

  get moduleLevel() {
    return this.intl.t(`pages.modulix.details.levels.${this.args.level}`);
  }

  <template>
    <dl>
      <dt>
        <PixIcon @name="barsUp" class="level__icon" @ariaHidden={{true}} />
      </dt>
      <dd>
        <span aria-label={{t "pages.combined-courses.items.aria-label-level" level=this.moduleLevel}}>
          {{this.moduleLevel}}
        </span>
      </dd>
    </dl>
  </template>
}
