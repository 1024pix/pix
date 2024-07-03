import { env, exit } from 'node:process';

import generate from '@babel/generator';
import t from '@babel/types';
import { parse } from 'node-html-parser';

const PROBLEMATIC_PAGES = [
  'Data - table "" (page template)',
  'Data - table "features"',
  'Data - table "view-active-organization-learners"',
  'Data - table "memberships"',
  'Data - table "target-profiles_skills"',
];

async function main() {
  const config = getConfigFromEnv();
  const confluence = new Confluence(config.confluence.url, config.confluence.token);

  const pageId = 3428155424;
  const pages = await confluence.getChildPages(pageId);

  const generator = new MigrationGenerator();

  const usefulPages = pages.filter((page) => {
    return !PROBLEMATIC_PAGES.includes(page.title);
  });

  for (const page of usefulPages) {
    const tableName = page.title.split('"')[1];
    const columns = await confluence.getTableContent(page.id);

    columns
      .map((column) => ({
        name: column.name,
        description: column.Description,
      }))
      .filter(({ description, name }) => name !== '' && description !== '')
      .forEach(({ description, name }) => {
        generator.addComment(description, name, tableName);
      });
  }

  const { code } = generator.generate();
  console.log(code);
}

function getConfigFromEnv() {
  const config = {
    confluence: {
      url: env.CONFLUENCE_URL,
      token: env.CONFLUENCE_TOKEN,
    },
  };
  if (!config.confluence.url || !config.confluence.token) {
    console.error('Missing configuration. Please provide CONFLUENCE_URL and CONFLUENCE_TOKEN environment variables.');
    exit(1);
  }
  return config;
}

function htmlToStructuredText(html) {
  let text = '';

  html.childNodes.forEach((child) => {
    if (child.nodeType === 3) {
      text += child.rawText;
    } else if (child.nodeType === 1) {
      switch (child.tagName.toLowerCase()) {
        case 'li':
          text += '- ' + htmlToStructuredText(child) + '\n';
          break;
        case 'ul':
        case 'ol':
          text += htmlToStructuredText(child) + '\n';
          break;
        case 'br':
          text += '\n';
          break;
        case 'p':
          text += htmlToStructuredText(child) + '\n\n';
          break;
        default:
          text += htmlToStructuredText(child);
          break;
      }
    }
  });

  return text;
}

class Confluence {
  constructor(url, token) {
    this.url = url;
    this.token = token;
  }

  async getChildPages(id) {
    const content = await this._getPageContent(id);
    const root = parse(content);
    const links = root.querySelectorAll('ul li a');
    return links.map((link) => {
      return {
        id: link.getAttribute('data-linked-resource-id'),
        title: link.text,
      };
    });
  }

  async _getPageContent(id) {
    // eslint-disable-next-line no-restricted-globals,n/no-unsupported-features/node-builtins
    const response = await fetch(`${this.url}/api/v2/pages/${id}?body-format=export_view`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${this.token}`,
        Accept: 'application/json',
      },
    });
    const page = await response.json();
    return page.body.export_view.value;
  }

  async getTableContent(id) {
    const content = await this._getPageContent(id);
    const root = parse(content);
    const rows = root.querySelectorAll('table tbody tr');
    const table = [];

    const headers = rows[0].querySelectorAll('td').map((cell) => cell.text);
    const columns = root.querySelectorAll('table tbody th');

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const cells = row.querySelectorAll('td');
      const rowData = {};

      rowData.name = columns[i].text;

      cells.forEach((cell, i) => {
        rowData[headers[i]] = htmlToStructuredText(cell).trim();
      });

      table.push(rowData);
    }

    return table;
  }
}

class MigrationGenerator {
  up = [];
  down = [];

  generate() {
    const ast = t.program([
      t.variableDeclaration('const', [
        t.variableDeclarator(
          t.identifier('up'),
          t.functionExpression(null, [t.identifier('knex')], t.blockStatement(this.up), false, true),
        ),
      ]),
      t.variableDeclaration('const', [
        t.variableDeclarator(
          t.identifier('down'),
          t.functionExpression(null, [t.identifier('knex')], t.blockStatement(this.down), false, true),
        ),
      ]),

      t.exportNamedDeclaration(
        null,
        [
          t.exportSpecifier(t.identifier('down'), t.identifier('down')),
          t.exportSpecifier(t.identifier('up'), t.identifier('up')),
        ],
        null,
      ),
    ]);

    return generate.default(ast, {
      jsescOption: {
        minimal: true,
      },
    });
  }

  addComment(comment, column, table) {
    const preparedComment = comment.replace(/"/g, '\\"').replace(/'/g, "''");
    this.up.push(this._rawKnexExpression(`COMMENT ON COLUMN "${table}"."${column}" IS '${preparedComment}'`));
    this.down.push(this._rawKnexExpression(`COMMENT ON COLUMN "${table}"."${column}" IS NULL`));
  }

  _rawKnexExpression(raw) {
    const expression = t.awaitExpression(
      t.callExpression(t.memberExpression(t.identifier('knex'), t.identifier('raw')), [t.stringLiteral(raw)]),
    );

    return t.expressionStatement(expression);
  }
}

main();
