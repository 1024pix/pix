import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';

import { CREATED, FINALIZED, PROCESSED } from '../../models/session-management';

export default class SessionSummaryRow extends Component {
  @service intl;

  get statusLabel() {
    const { status } = this.args.sessionSummary;
    if (status === FINALIZED) return this.intl.t(`pages.sessions.list.status.${FINALIZED}`);
    if (status === PROCESSED) return this.intl.t(`pages.sessions.list.status.${PROCESSED}`);
    return this.intl.t(`pages.sessions.list.status.${CREATED}`);
  }

  <template>
    <tr
      aria-label='{{t "pages.sessions.list.table.row.label"}}'
      {{on 'click' (fn @goToSessionDetails @sessionSummary.id)}}
      class='tr--clickable'
    >
      <td>
        <LinkTo
          @route='authenticated.sessions.details'
          @model={{@sessionSummary.id}}
          class='session-summary-list__link'
          aria-label='{{t "pages.sessions.list.table.row.session-and-id" sessionId=@sessionSummary.id}}'
        >
          {{@sessionSummary.id}}
        </LinkTo>
      </td>
      <td>{{@sessionSummary.address}}</td>
      <td>{{@sessionSummary.room}}</td>
      <td>{{dayjsFormat @sessionSummary.date 'DD/MM/YYYY' allow-empty=true}}</td>
      <td>{{dayjsFormat @sessionSummary.time 'HH:mm' inputFormat='HH:mm:ss' allow-empty=true}}</td>
      <td>{{@sessionSummary.examiner}}</td>
      <td>{{@sessionSummary.enrolledCandidatesCount}}</td>
      <td>{{@sessionSummary.effectiveCandidatesCount}}</td>
      <td>{{this.statusLabel}}</td>
      <td>
        <div class='session-summary-list__delete'>
          {{#if @sessionSummary.hasEffectiveCandidates}}
            <PixTooltip @position='left' @isInline={{true}} @id='tooltip-delete-session-button'>
              <:triggerElement>
                <PixIconButton
                  @icon='trash-alt'
                  aria-label={{t
                    'pages.sessions.list.actions.delete-session.label'
                    sessionSummaryId=@sessionSummary.id
                  }}
                  disabled={{true}}
                  aria-describedby='tooltip-delete-session-button'
                  @withBackground={{true}}
                />
              </:triggerElement>
              <:tooltip>{{t 'pages.sessions.list.actions.delete-session.disabled'}}</:tooltip>
            </PixTooltip>
          {{else}}
            <PixIconButton
              @icon='trash-alt'
              aria-label={{t 'pages.sessions.list.actions.delete-session.label' sessionSummaryId=@sessionSummary.id}}
              disabled={{false}}
              @withBackground={{true}}
              @triggerAction={{fn
                @openSessionDeletionConfirmModal
                @sessionSummary.id
                @sessionSummary.enrolledCandidatesCount
              }}
            />
          {{/if}}
        </div>
      </td>
    </tr>
  </template>
}
