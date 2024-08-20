import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import Capacity from './places/capacity';
import DeleteModal from './places/delete-modal';
import List from './places/list';

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
      <header class="page-section__header">
        <h2 class="page-section__title">Places</h2>
      </header>
      <div class="places__resume">
        <h3 class="page-section__title page-section__title--sub">Nombre de places actives</h3>
        <Capacity @placesCapacity={{@placesCapacity}} />

        {{#if this.accessControl.hasAccessToOrganizationPlacesActionsScope}}
          <PixButtonLink
            class="places__button"
            @variant="primary"
            @route="authenticated.organizations.get.places.new"
            @model={{@model}}
            @iconBefore="plus"
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
        <div class="table-admin-empty">Aucun lot de places saisi</div>
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
