import { PixButtonLink } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import DeleteModal from './places/delete-modal';
import List from './places/list';
import Statistics from './places/statistics';

export default class Places extends Component {
  @service accessControl;

  @tracked displayDeletePlacesLotModal = false;
  @tracked organizationPlacesLotToDelete = null;

  @action
  async toggleDisplayDeletePlacesLotModal(placeLot) {
    this.displayDeletePlacesLotModal = !this.displayDeletePlacesLotModal;

    if (this.displayDeletePlacesLotModal) {
      this.organizationPlacesLotToDelete = placeLot;
    } else {
      this.organizationPlacesLotToDelete = null;
    }
  }

  <template>
    <section class="page-section">
      <h2 class="page-section__title page-section__title--sub">Places</h2>
      <Statistics @statistics={{@placesStatistics}} />
      <div class="places__resume">
        {{#if this.accessControl.hasAccessToOrganizationPlacesActionsScope}}
          <PixButtonLink
            class="places__button"
            @variant="primary"
            @route="authenticated.organizations.get.places.new"
            @model={{@model}}
            @iconBefore="add"
          >
            Ajouter des places
          </PixButtonLink>
        {{/if}}
      </div>

      <h3 class="page-section__title page-section__title--sub">Historique des lots</h3>

      {{#if @places}}
        <List @places={{@places}} @onDelete={{this.toggleDisplayDeletePlacesLotModal}} />
      {{/if}}

      {{#unless @places}}
        <div class="table__empty">Aucun lot de places saisi</div>
      {{/unless}}

      <DeleteModal
        @organizationId={{@organizationId}}
        @organizationPlacesLot={{this.organizationPlacesLotToDelete}}
        @show={{this.displayDeletePlacesLotModal}}
        @toggle={{this.toggleDisplayDeletePlacesLotModal}}
        @refreshModel={{@refreshModel}}
      />
    </section>
  </template>
}
