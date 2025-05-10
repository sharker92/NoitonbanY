import * as ynab from 'ynab';
import { Client } from '@notionhq/client';
import { writeFile } from 'fs/promises';

import dotenv from 'dotenv';

dotenv.config();
const ynabAPI = new ynab.API(process.env.YNAB_KEY);
(async function () {
  const transactionsResponse = await ynabAPI.transactions.getTransactions(
    process.env.YNAB_BUDGET_ID,
    '2025-02-01',
  );
  const transactions = transactionsResponse.data.transactions;
  await saveObjectToJsonFile(transactions, 'transactions');
  const transactionsServerKnowledge =
    transactionsResponse.data.server_knowledge;
  // console.log(transactions[10]);
  // console.log(transactions[11]);
  // console.log(transactions.length);
  // console.log(transactionsServerKnowledge);
  //
  // const transaction = transactions[11];
  const transaction = {
    id: 'c38fb781-dd16-4a3d-afb5-ea6bb7d6f7da',
    date: '2023-09-23',
    amount: -79000,
    memo: 'Regalo Emma y Rodri y Loceta ciega',
    cleared: 'reconciled',
    approved: true,
    account_id: '5afbbcbc-fca0-4404-bd06-d914cd21e9f5',
    payee_id: 'd939b666-d8ae-49e3-ae27-dc9516ffc91f',
    category_id: 'c3d3efcf-c509-4555-8128-145b489d8caf',
    deleted: false,
    account_name: 'Platino',
    payee_name: 'Walmart',
    category_name: 'Split',
    subtransactions: [
      {
        id: 'e31b3a1f-3e36-4ec5-bcd6-1d151202b6c6',
        transaction_id: 'c38fb781-dd16-4a3d-afb5-ea6bb7d6f7da',
        amount: -44000,
        memo: 'Regalo Emma y Rodri',
        category_id: '43812954-7a3f-4655-adcc-a6bda3250dd7',
        category_name: '🎁 Gifts',
        deleted: false,
      },
      {
        id: 'e111e2cf-1960-4b44-a13d-9dffd68fb901',
        transaction_id: 'c38fb781-dd16-4a3d-afb5-ea6bb7d6f7da',
        amount: -35000,
        memo: 'Loceta ciega cuarto de Anya',
        category_id: 'a3957f62-7f65-476e-81fb-8a71fb12ce96',
        category_name: '🏚️ House maintenance',
        deleted: false,
      },
    ],
  };
  const notionRequestObject = createRequestObject(transaction);
  await createNotionPageFromTransaction(notionRequestObject);

  // Get budgets data
  // const budgetsResponse = await ynabAPI.budgets.getBudgets();
  // const budgets = budgetsResponse.data.budgets;
  // console.log(budgetsResponse);
})();
// TODO: load everything in notion and do a process to get the last server_knowledge to just pull every day the last transactions.
// TODO: The only data missin is Substransactions [] should be childs in notion.
// WARN: THIS IS NEXT, SUBTRANSACTIONS NEED A LOOP OR SOMETHING NESTED BUT IS THE SAME DATA.
// Substransaction data INFO:
// id
// transaction_id
// amount -> int64
// memo
// payee_id
// payee_name
// category_id
// transfer_account_id
// transfer_transaction_id
// deleted -> bool
//
// {
//   parent: { database_id: '1a0f80c2a4fc80f19a6dcf3eb2d9ec89' },
//   properties: {
//     transaction_id: { rich_text: [Array] },
//     'Transaction Date': { date: [Object] },
//     Amount: { number: -392.83 },
//     Cleared: { select: [Object] },
//     Approved: { checkbox: true },
//     account_id: { rich_text: [Array] },
//     Deleted: { checkbox: false },
//     Account: { select: [Object] },
//     Memo: { type: 'title', title: [Array] },
//     Category: { select: [Object] },
//     Payee: { select: [Object] },
//     payee_id: { rich_text: [Array] },
//     category_id: { rich_text: [Array] },
//     Flag: { select: [Object] },
//     debt_transaction_type: { select: [Object] },
//     transfer_account_id: { rich_text: [Array] },
//     transfer_transaction_id: { rich_text: [Array] },
//     matched_transaction_id: { rich_text: [Array] },
//     import_id: { rich_text: [Array] },
//     import_payee_name: { rich_text: [Array] },
//     import_payee_name_original: { rich_text: [Array] }
//   }
// }
//
//
// Ejemplo con subtransactions
// {
//   "id": "cc6166e7-d6d6-430d-8d37-b1e53bbe3962_2023-09-22",
//   "date": "2023-09-22",
//   "amount": 48597500,
//   "memo": "Sueldo + Extra ($2,900 USD)",
//   "cleared": "reconciled",
//   "approved": true,
//   "account_id": "f231a02f-77f1-448d-9912-feb8c7534d6d",
//   "payee_id": "06127126-8418-4043-9100-b10f88ee16bf",
//   "category_id": "c3d3efcf-c509-4555-8128-145b489d8caf",
//   "deleted": false,
//   "account_name": "Debito",
//   "payee_name": "Digible",
//   "category_name": "Split",
//   "subtransactions": [
//     {
//       "id": "fd0467e4-6323-4514-93c4-49aada915f55",
//       "transaction_id": "cc6166e7-d6d6-430d-8d37-b1e53bbe3962_2023-09-22",
//       "amount": 20560430,
//       "memo": "$1,226.92 USD Extra",
//       "category_id": "53ce3b8f-6cc0-4db6-8c64-eac6238ef7d6",
//       "category_name": "Inflow: Ready to Assign",
//       "deleted": false
//     },
//     {
//       "id": "e88d1af5-4578-4509-bd6b-b60584685cf0",
//       "transaction_id": "cc6166e7-d6d6-430d-8d37-b1e53bbe3962_2023-09-22",
//       "amount": 28037070,
//       "memo": "$1,673.08 USD Sueldo",
//       "category_id": "53ce3b8f-6cc0-4db6-8c64-eac6238ef7d6",
//       "category_name": "Inflow: Ready to Assign",
//       "deleted": false
//     }
//   ]
// },
//
// Ejemplo sin sub
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
//   transfer_account_id: undefined, NOTE: ✅
//   transfer_transaction_id: undefined, NOTE: ✅
//   matched_transaction_id: undefined, NOTE: ✅
//   import_id: undefined, NOTE: ✅
//   import_payee_name: undefined, NOTE: ✅
//   import_payee_name_original: undefined, NOTE: ✅
//   debt_transaction_type: undefined, NOTE: ✅
//   deleted: false, NOTE: ✅
//   account_name: 'Platino',NOTE: ✅
//   payee_name: 'SAMS',NOTE: ✅
//   category_name: '🫒 Alacena',NOTE: ✅
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

function createRequestObject(transaction) {
  const notionRequestObject = {
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
      // Non required properties
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
    },
  };
  if (transaction?.flag_name) {
    notionRequestObject.properties.Flag = {
      select: {
        name: transaction.flag_name,
        color: transaction?.flag_color,
      },
    };
  }
  if (transaction?.debt_transaction_type) {
    notionRequestObject.properties.debt_transaction_type = {
      select: { name: transaction.debt_transaction_type },
    };
  }
  //TODO: Research how to send the create request with childs
  const notionOptionalTextProperties = addOptionalTextProperties(transaction);
  notionRequestObject.properties = {
    ...notionRequestObject.properties,
    ...notionOptionalTextProperties,
  };
  console.log(notionRequestObject);
  return notionRequestObject;
}

function addOptionalTextProperties(transaction) {
  const optionalTextProperties = [
    'transfer_account_id',
    'transfer_transaction_id',
    'matched_transaction_id',
    'import_id',
    'import_payee_name',
    'import_payee_name_original',
  ];
  const notionOptionalTextProperties = {};
  for (const textProp of optionalTextProperties) {
    if (transaction?.[textProp]) {
      notionOptionalTextProperties[textProp] = {
        rich_text: [{ text: { content: transaction[textProp] } }],
      };
    }
  }
  return notionOptionalTextProperties;
}

async function createNotionPageFromTransaction(notionCreateRequest) {
  const notion = new Client({ auth: process.env.NOTION_KEY });
  const response = await notion.pages.create(notionCreateRequest);
  console.log(response);
}
// TODO create a jest test that test that the function creates a request with all data

