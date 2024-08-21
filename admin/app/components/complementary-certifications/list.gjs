import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';

export default class List extends Component {
  get sortedComplementaryCertifications() {
    return this.args.complementaryCertifications.sortBy('label');
  }

  <template>
    <div class="content-text content-text--small">
      <div class="table-admin">
        <table>
          <thead>
            <tr>
              <th class="table__column--id">ID</th>
              <th>Nom</th>
            </tr>
          </thead>

          <tbody>
            {{#each this.sortedComplementaryCertifications as |complementaryCertification|}}
              <tr>
                <td class="table__column--id">{{complementaryCertification.id}}</td>
                <td>
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
