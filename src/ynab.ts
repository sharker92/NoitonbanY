import * as ynab from 'ynab';
import { Client } from '@notionhq/client';
import { writeFile } from 'fs/promises';

import dotenv from 'dotenv';

dotenv.config();
const ynabAPI = new ynab.API(process.env.YNAB_KEY);
(async function () {
  const transactionsResponse = await ynabAPI.transactions.getTransactions(
    process.env.YNAB_BUDGET_ID,
    // '2025-02-01',
  );
  const transactions = transactionsResponse.data.transactions;
  saveObjectToJsonFile(transactions, 'transactions');
  const transactionsServerKnowledge =
    transactionsResponse.data.server_knowledge;
  console.log(transactions[10]);
  console.log(transactions[11]);
  console.log(transactions.length);
  console.log(transactionsServerKnowledge);
  const notion = new Client({ auth: process.env.NOTION_KEY });
  const transaction = transactions[11];
  const notionCreateRequest = {
    parent: { database_id: process.env.NOTION_YNAB_DATABASE_ID },
    properties: {
      transaction_id: {
        rich_text: [{ text: { content: transaction.id } }],
      },
      'Transaction Date': {
        date: {
          start: transaction.date,
        },
      },
      Amount: {
        number: transaction.amount / 1000,
      },
      Cleared: {
        select: { name: transaction.cleared },
      },
      Approved: {
        checkbox: transaction.approved,
      },
      account_id: {
        rich_text: [{ text: { content: transaction.account_id } }],
      },
      Deleted: {
        checkbox: transaction.deleted,
      },
      Account: { select: { name: transaction.account_name } },
      // Non required
      Memo: {
        type: 'title',
        title: [
          {
            type: 'text',
            text: { content: transaction.memo, link: null },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              code: false,
              color: 'default',
            },
          },
        ],
      },
      Category: { select: { name: transaction.category_name } },
      Payee: { select: { name: transaction.payee_name } }, //TODO: Revisa si el color se pone por defecto o cambia.
      payee_id: {
        rich_text: [{ text: { content: transaction.payee_id } }],
      },
      category_id: {
        rich_text: [{ text: { content: transaction.category_id } }],
      },
      transfer_account_id: {
        rich_text: [{ text: { content: transaction.transfer_account_id } }],
      },
      transfer_transaction_id: {
        rich_text: [{ text: { content: transaction.transfer_transaction_id } }],
      },
      matched_transaction_id: {
        rich_text: [{ text: { content: transaction.matched_transaction_id } }],
      },
      import_id: {
        rich_text: [{ text: { content: transaction.import_id } }],
      },
      import_payee_name: {
        rich_text: [{ text: { content: transaction.import_payee_name } }],
      },
      import_payee_name_original: {
        rich_text: [
          { text: { content: transaction.import_payee_name_original } },
        ],
      },
      debt_transaction_type: {
        select: { name: transaction.debt_transaction_type },
      },
    },
  };

  if (transaction?.flag_name) {
    notionCreateRequest['Flag'] = {
      select: {
        name: transaction.flag_name,
        color: transaction?.flag_color,
      },
    };
  }

  const response = await notion.pages.create(notionCreateRequest);
  console.log(response);
  // Get budgets data
  // const budgetsResponse = await ynabAPI.budgets.getBudgets();
  // const budgets = budgetsResponse.data.budgets;
  // console.log(budgetsResponse);
})();
// TODO: load everything in notion and do a process to get the last server_knowledge to just pull every day the last transactions.
// TODO: 27/03/25 review all ynab api data so I can match it in notion database. Continue creating columns and pushing data.
// TODO: 04/03/25 the non required data, if missing, notion complains. I probably need a function to trim them, if empty, before sending them to notion.
// TODO: Substransactions should be childs in notion.
// {
//   id: '01028d15-32ec-473a-a096-84bbfe83bc06', NOTE: ✅ https://api.ynab.com/v1#/
//   date: '2023-09-02', NOTE: ✅
//   amount: -990080, NOTE: ✅
//   memo: '', NOTE: ✅
//   cleared: 'reconciled', NOTE: ✅
//   approved: true, NOTE: ✅
//   flag_color: undefined, NOTE: ✅
//   flag_name: undefined, NOTE: ✅
//   account_id: '5afbbcbc-fca0-4404-bd06-d914cd21e9f5', NOTE: ✅
//   payee_id: '5f77e6dd-09ec-40fc-8a01-6d2bcabf8b74', NOTE: ✅
//   category_id: 'fad59901-5dc1-4108-8ff2-14b4fa39bdb5', NOTE: ✅
//   transfer_account_id: undefined,
//   transfer_transaction_id: undefined,
//   matched_transaction_id: undefined,
//   import_id: undefined,
//   import_payee_name: undefined,
//   import_payee_name_original: undefined,
//   debt_transaction_type: undefined,
//   deleted: false,
//   account_name: 'Platino',NOTE: ✅
//   payee_name: 'SAMS',NOTE: ✅
//   category_name: '🫒 Alacena',NOTE: ✅
//   subtransactions: []
// }
// {
//   id: 'efa245d0-8af3-4782-bfc9-32cfeb17788b',
//   date: '2023-09-02',
//   amount: -392830,
//   memo: '',
//   cleared: 'reconciled',
//   approved: true,
//   flag_color: undefined,
//   flag_name: undefined,
//   account_id: '5afbbcbc-fca0-4404-bd06-d914cd21e9f5',
//   payee_id: '754cbec3-319a-48f6-95dd-91bddd527667',
//   category_id: 'fad59901-5dc1-4108-8ff2-14b4fa39bdb5',
//   transfer_account_id: undefined,
//   transfer_transaction_id: undefined,
//   matched_transaction_id: undefined,
//   import_id: undefined,
//   import_payee_name: undefined,
//   import_payee_name_original: undefined,
//   debt_transaction_type: undefined,
//   deleted: false,
//   account_name: 'Platino',
//   payee_name: 'Costco',
//   category_name: '🫒 Alacena',
//   subtransactions: []
// }

async function saveObjectToJsonFile(
  myObject: object,
  fileName: string = 'myFile',
) {
  try {
    // Convert the object to a JSON string
    const jsonString = JSON.stringify(myObject, null, 2); // Pretty format with indentation

    // Write the JSON string to a file
    await writeFile(fileName + '.json', jsonString);

    console.log('File has been saved successfully!');
  } catch (err) {
    console.error('Error writing to file:', err);
  }
}

