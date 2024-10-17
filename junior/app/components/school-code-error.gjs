import { service } from '@ember/service';
import Component from '@glimmer/component';

import Issue from './issue';

export default class SchoolCodeError extends Component {
  @service intl;

  get messages() {
    return [this.intl.t('pages.school.not-found.sentence-1'), this.intl.t('pages.school.not-found.sentence-2')];
  }

  <template>
    <Issue @message={{this.messages}} @class="hint" @blobType="warning" @refreshAction={{@refreshAction}} />
  </template>
}
