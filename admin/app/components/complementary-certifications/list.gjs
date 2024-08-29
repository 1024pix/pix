import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class List extends Component {
  get sortedComplementaryCertifications() {
    return this.args.complementaryCertifications.sortBy('label');
  }

  <template>
    <div class="content-text content-text--small">
      <div class="table-admin">
        <table>
          <caption class="screen-reader-only">
            {{t "components.complementary-certifications.list.table-caption"}}
          </caption>
          <thead>
            <tr>
              <th scope="col" id="complementary-certification-id" class="table__column--id">{{t
                  "components.complementary-certifications.list.table-headers.id"
                }}</th>
              <th scope="col" id="complementary-certification-name">{{t
                  "components.complementary-certifications.list.table-headers.name"
                }}</th>
            </tr>
          </thead>

          <tbody>
            {{#each this.sortedComplementaryCertifications as |complementaryCertification|}}
              <tr>
                <td
                  headers="complementary-certification-id"
                  class="table__column--id"
                >{{complementaryCertification.id}}</td>
                <td headers="complementary-certification-name">
                  <LinkTo
                    @route="authenticated.complementary-certifications.complementary-certification"
                    @model={{complementaryCertification.id}}
                  >
                    {{complementaryCertification.label}}
                  </LinkTo>
                </td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </div>
    </div>
  </template>
}
