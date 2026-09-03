import { expect, test } from '@playwright/test';

import { AssistantPage } from './AssistantPage.js';
import { VALID_VALUES, createCsvFile, uniqueSuffix } from './fixtures/csv.js';

test("le nom du fichier joint apparaît dans le message utilisateur dès l'envoi", async ({
  page,
}) => {
  const suffix = uniqueSuffix();
  const csvPath = createCsvFile([
    {
      nom: `Test Org ${suffix}`,
      type: VALID_VALUES.type.sco,
      equipe: VALID_VALUES.team.alpha,
      public: VALID_VALUES.learnerType.sco,
      pays: VALID_VALUES.country,
      externalId: `AUTO-ATTACH-${suffix}`,
    },
  ]);

  const assistant = new AssistantPage(page);
  await assistant.loginAndOpen();
  await assistant.attachFile(csvPath);

  // Capture the filename that will be sent with the message
  const expectedFilename = csvPath.split('/').pop();

  // Intercept the outgoing request to inspect the message body
  let capturedMessageId = null;
  let capturedAttachmentInBody = false;
  page.on('request', (req) => {
    if (req.url().includes('/llm-assistant/conversations/messages') && req.method() === 'POST') {
      try {
        const body = JSON.parse(req.postData() ?? '{}');
        const msgs = body.messages ?? [];
        const last = msgs[msgs.length - 1];
        if (last?.role === 'user') {
          capturedMessageId = last.id;
          // Check whether the filename was injected into the parts
          capturedAttachmentInBody = (last.parts ?? []).some(
            (p) => p.type === 'text' && p.text?.includes(expectedFilename),
          );
        }
      } catch {
        // ignore parse errors
      }
    }
  });

  await assistant.sendMessage('Crée les organisations à partir du document joint');

  // Diagnostics (always logged to help debug failures)
  console.log('capturedMessageId:', capturedMessageId);
  console.log('capturedAttachmentInBody:', capturedAttachmentInBody);

  const userBubble = page.locator('.message--user .message__bubble').first();
  await expect(userBubble).toBeVisible({ timeout: 10_000 });

  // Log the actual DOM for diagnosis
  const bubbleHTML = await userBubble.innerHTML();
  console.log('user bubble innerHTML:', bubbleHTML);

  // The filename pill must be visible in the user message
  const attachmentRef = userBubble.locator('.message__attachment-ref');
  await expect(attachmentRef).toBeVisible({ timeout: 5_000 });
  await expect(attachmentRef).toContainText(expectedFilename);
});
