import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class Level extends Component {
  get moduleLevel() {
    return this.intl.t(`pages.modulix.details.levels.${this.args.module.details.level}`);
  }
  <template>
    <dl>
      <dt>
        <PixIcon @name="barsUp" class="level__icon" @ariaHidden={{true}} />
      </dt>
      <dd>
        <span aria-label={{t "pages.combined-courses.items.aria-label-level" level=@level}}>
          {{@level}}
        </span>
      </dd>
    </dl>
  </template>
}
