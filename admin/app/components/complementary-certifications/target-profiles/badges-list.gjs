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
      <div class="content-text content-text--small">
        <h2 class="complementary-certification-details__badges-title">
          {{t "components.complementary-certifications.target-profiles.badges-list.title"}}
        </h2>
        <div class="table-admin">
          <table>
            <thead>
              <tr>
                <th>{{t "components.complementary-certifications.target-profiles.badges-list.header.image-url"}}</th>
                <th class="complementary-certification-details-table__complementary-certification-badge-name">
                  {{t "components.complementary-certifications.target-profiles.badges-list.header.name"}}
                </th>
                <th>{{t "components.complementary-certifications.target-profiles.badges-list.header.level"}}</th>
                <th>
                  {{t "components.complementary-certifications.target-profiles.badges-list.header.minimum-earned-pix"}}
                </th>
                <th>{{t "components.complementary-certifications.target-profiles.badges-list.header.id"}}</th>
              </tr>
            </thead>

            <tbody>
              {{#each this.currentTargetProfileBadges as |badge|}}
                <tr>
                  <td>
                    <img
                      class="complementary-certification-details-table__complementary-certification-badge-image-url"
                      src={{badge.imageUrl}}
                      alt="{{badge.label}}"
                    />
                  </td>
                  <td>{{badge.label}}</td>
                  <td>{{badge.level}}</td>
                  <td>{{this.getMinimumEarnedPixValue badge.minimumEarnedPix}}</td>
                  <td>
                    <LinkTo
                      @route="authenticated.target-profiles.target-profile.badges.badge"
                      @models={{array @currentTargetProfile.id badge.id}}
                      target="_blank"
                    >
                      {{badge.id}}
                    </LinkTo>
                  </td>
                </tr>
              {{/each}}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </template>
}
