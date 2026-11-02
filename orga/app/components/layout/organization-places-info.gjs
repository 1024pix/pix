import { PixIcon } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';

export default class OrganizationPlacesInfo extends Component {
  @service currentUser;

  <template>
    {{#if this.currentUser.prescriber.placesManagement}}
      <div class="organization-places-info">
        {{#if (eq @placesCount 0)}}
          <span class="organization-places-info__warning">
            <PixIcon @name="warning" @plainIcon={{true}} class="warning-icon" />
            {{t "navigation.places.number" count=@placesCount}}</span>
        {{else}}
          <span>{{t "navigation.places.number" count=@placesCount}}</span>
        {{/if}}
      </div>
    {{/if}}
  </template>
}
