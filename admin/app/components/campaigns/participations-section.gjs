import { PixPagination, PixTable } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';

import ParticipationRow from './participation-row';

export default class ParticipationsSection extends Component {
  @service accessControl;

  <template>
    <section class="no-background">
      <h2 class="participations-section__title">Participations</h2>

      <p class="participations-section__subtitle">
        Attention toute modification sur une participation nécessite un accord écrit du prescripteur.
      </p>

      <PixTable @variant="admin" @data={{@participations}} @caption="Liste des participations" class="table">
        <:columns as |participation context|>
          <ParticipationRow
            @participation={{participation}}
            @context={{context}}
            @externalIdLabel={{@externalIdLabel}}
            @updateParticipantExternalId={{@updateParticipantExternalId}}
          />
        </:columns>
      </PixTable>

      {{#unless @participations}}
        <div class="table__empty">Aucune participation</div>
      {{/unless}}

      {{#if @participations}}
        <PixPagination @pagination={{@participations.meta}} />
      {{/if}}
    </section>
  </template>
}
