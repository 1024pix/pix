import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixIndicatorCard from '@1024pix/pix-ui/components/pix-indicator-card';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { t } from 'ember-intl';

<template>
  <section class="organization-statistics-page-section">
    <PixIndicatorCard
      class="organization-statistics__card"
      @title={{t "components.organizations.statistics.total-participants-count.title"}}
      @color="tertiary"
      @iconName="users"
      @info={{t "components.organizations.statistics.total-participants-count.info"}}
    >
      {{@statistics.totalParticipantsCount}}

    </PixIndicatorCard>
    <PixTable
      @variant="admin"
      @data={{@statistics.totalParticipantsCountByYear}}
      @caption={{t "components.organizations.statistics.total-participants-count-by-year.caption"}}
      @displayCaption={{true}}
    >
      <:columns as |row context|>
        <PixTableColumn @context={{context}}>
          <:header>{{t "components.organizations.statistics.total-participants-count-by-year.headers.year"}}</:header>
          <:cell>{{row.year}}</:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}}>
          <:header>{{t "components.organizations.statistics.total-participants-count-by-year.headers.count"}}
            <PixTooltip @isWide={{true}} @id="participants-count-by-year-tooltip" @position="top">
              <:triggerElement>
                <PixIcon
                  @name="help"
                  @plainIcon={{true}}
                  @ariaHidden={{true}}
                  aria-describedby="participants-count-by-year-tooltip"
                />
              </:triggerElement>
              <:tooltip>
                {{t "components.organizations.statistics.total-participants-count-by-year.headers.count-tooltip"}}
              </:tooltip>
            </PixTooltip>
          </:header>
          <:cell>{{row.count}}</:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>
  </section>
</template>
