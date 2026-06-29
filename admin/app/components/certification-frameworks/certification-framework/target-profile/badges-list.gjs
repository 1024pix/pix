import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { array } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class BadgesList extends Component {
  get currentTargetProfileBadges() {
    return this.args.currentTargetProfile?.badges;
  }

  getMinimumEarnedPixValue(minimumEarnedPix) {
    return minimumEarnedPix <= 0 ? '' : minimumEarnedPix;
  }

  <template>
    <section class="page-section">
      <h2 class="certification-framework-details__badges-title page-section__header">
        {{t "components.certification-frameworks.target-profiles.badges-list.title"}}
      </h2>
      <PixTable
        @variant="admin"
        @data={{this.currentTargetProfileBadges}}
        @caption={{t "components.certification-frameworks.target-profiles.badges-list.caption"}}
      >
        <:columns as |row currentTargetProfileBadge|>
          <PixTableColumn @context={{currentTargetProfileBadge}}>
            <:header>
              {{t "components.certification-frameworks.target-profiles.badges-list.header.image-url"}}
            </:header>
            <:cell>
              <img
                class="certification-framework-details-table__certification-framework-badge-image-url"
                src={{row.imageUrl}}
                alt="{{row.label}}"
              />
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{currentTargetProfileBadge}} class="table__column--wide">
            <:header>
              {{t "components.certification-frameworks.target-profiles.badges-list.header.name"}}
            </:header>
            <:cell>
              {{row.label}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{currentTargetProfileBadge}}>
            <:header>
              {{t "components.certification-frameworks.target-profiles.badges-list.header.level"}}
            </:header>
            <:cell>
              {{row.level}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{currentTargetProfileBadge}}>
            <:header>
              {{t "components.certification-frameworks.target-profiles.badges-list.header.minimum-earned-pix"}}
            </:header>
            <:cell>
              {{this.getMinimumEarnedPixValue row.minimumEarnedPix}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{currentTargetProfileBadge}}>
            <:header>
              {{t "components.certification-frameworks.target-profiles.badges-list.header.id"}}
            </:header>
            <:cell>
              <LinkTo
                @route="authenticated.target-profiles.target-profile.badges.badge"
                @models={{array @currentTargetProfile.id row.id}}
                target="_blank"
              >
                {{row.id}}
              </LinkTo>
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>
    </section>
  </template>
}
