import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { fn } from '@ember/helper';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { eq } from 'ember-truth-helpers';

export default class List extends Component {
  @service accessControl;

  <template>
    <table
      class="table-admin"
      summary="Affichage des lots de place disponible triés par ordre anti-chronologique d'activation puis d'expiration"
    >
      <thead>
        <tr>
          <th scope="col">Nombre</th>
          <th scope="col">Catégorie</th>
          <th scope="col">Date d'activation</th>
          <th scope="col">Statut</th>
          <th scope="col">Référence</th>
          <th scope="col">Créé par</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {{#each @places as |place|}}
          <tr aria-label="Lot de Places">
            <td class="td--bold">{{place.count}}</td>
            <td class="td--bold">{{place.categoryLabel}}</td>
            <td>
              Du:
              {{dayjsFormat place.activationDate "DD/MM/YYYY"}}
              {{#if place.hasExpirationDate}}
                <br />
                Au:
                {{dayjsFormat place.expirationDate "DD/MM/YYYY"}}
              {{/if}}
            </td>
            <td class="table__column table__column--center">
              <PixTag @color={{if (eq place.status "ACTIVE") "blue" "grey"}}>{{place.displayStatus}}</PixTag>
            </td>
            <td>{{place.reference}}</td>
            <td>{{place.creatorFullName}}</td>
            <td>
              {{#if this.accessControl.hasAccessToOrganizationPlacesActionsScope}}
                <PixButton @size="small" @variant="error" @triggerAction={{fn @onDelete place}} @iconBefore="delete">
                  Supprimer
                </PixButton>
              {{/if}}
            </td>
          </tr>
        {{/each}}
      </tbody>
    </table>
  </template>
}
