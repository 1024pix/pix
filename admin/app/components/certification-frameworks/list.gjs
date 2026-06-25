import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';

export default class List extends Component {
  get frameworks() {
    return this.args.certificationFrameworks.map((framework) => {
      return {
        id: framework.id,
        name: framework.name,
        label: `components.certification-frameworks.labels.${framework.id}`,
        activeVersionStartDate: framework.activeVersionStartDate,
        frameworkKey: framework.id,
      };
    });
  }

  <template>
    <PixTable
      @variant="admin"
      @data={{this.frameworks}}
      @caption={{t "components.certification-frameworks.list.caption"}}
    >
      <:columns as |framework context|>
        <PixTableColumn @context={{context}} class="table__column--wide">
          <:header>
            {{t "components.certification-frameworks.list.name"}}
          </:header>
          <:cell>
            <LinkTo
              @route="authenticated.certification-frameworks.certification-framework"
              @model={{framework.frameworkKey}}
            >
              {{t framework.label}}
            </LinkTo>
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>
            {{t "components.certification-frameworks.list.active-version-start-date"}}
          </:header>
          <:cell>
            {{#if framework.activeVersionStartDate}}
              {{formatDate framework.activeVersionStartDate}}
            {{else}}
              -
            {{/if}}
          </:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>
  </template>
}
