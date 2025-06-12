import * as ynab from 'ynab';
import { Client } from '@notionhq/client';
import { writeFile } from 'fs/promises';

import dotenv from 'dotenv';

dotenv.config();
const ynabAPI = new ynab.API(process.env.YNAB_KEY);

interface YnabTransaction {
  id: string;
  date: string;
  amount: number;
  memo?: string;
  cleared: 'cleared' | 'uncleared' | 'reconciled';
  approved: boolean;
  flag_color?: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';
  flag_name?: string;
  account_id: string;
  payee_id?: string;
  category_id?: string;
  transfer_account_id?: string;
  transfer_transaction_id?: string;
  matched_transaction_id?: string;
  import_id?: string;
  import_payee_name?: string;
  import_payee_name_original?: string;
  debt_transaction_type?:
    | 'payment'
    | 'refund'
    | 'fee'
    | 'interest'
    | 'escrow'
    | 'balanceAdjustment'
    | 'credit'
    | 'charge';
  deleted: boolean;
  account_name: string;
  payee_name?: string;
  category_name?: string;
  subtransactions: YnabSubTransaction[];
}

interface YnabSubTransaction {
  id: string;
  transaction_id: string;
  amount: number;
  memo?: string;
  payee_id?: string;
  payee_name?: string;
  category_id?: string;
  category_name?: string;
  transfer_account_id?: string;
  transfer_transaction_id?: string;
  deleted: boolean;
}

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
  const transaction: YnabTransaction = {
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
  const parentPageId =
    await createNotionPageFromTransaction(notionRequestObject);
  if (transaction.subtransactions.length > 0) {
    await createNotionChildPage(parentPageId, transaction.subtransactions);
  }
  // Get budgets data
  // const budgetsResponse = await ynabAPI.budgets.getBudgets();
  // const budgets = budgetsResponse.data.budgets;
  // console.log(budgetsResponse);
})();
// TODO: load everything in notion and do a process to get the last server_knowledge to just pull every day the last transactions.
// TODO: The only data missin is Substransactions [] should be childs in notion.
// WARN: THIS IS NEXT, SUBTRANSACTIONS NEED A LOOP OR SOMETHING NESTED BUT IS THE SAME DATA.
// NOTE: ✅ https://api.ynab.com/v1#/
// NEXT: https://copilot.microsoft.com/chats/iwq3nvwZW8MBiEdYMKyTT
// Fix the undefined for optional data and make a common function for sub and transactions

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

function createRequestObject(transaction: YnabTransaction) {
  const notionRequestObject = {
    parent: { database_id: process.env.NOTION_YNAB_DATABASE_ID },
    properties: {
      // ynab_id: {
      //   rich_text: [{ text: { content: transaction.id } }],
      // },
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
      // account_id: {
      //   rich_text: [{ text: { content: transaction.account_id } }],
      // },
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
      // payee_id: {
      //   rich_text: [{ text: { content: transaction.payee_id } }],
      // },
      // category_id: {
      //   rich_text: [{ text: { content: transaction.category_id } }],
      // },
      Flag: {
        select: {
          name: transaction.flag_name,
          color: transaction?.flag_color,
        },
      },
      debt_transaction_type: {
        select: { name: transaction.debt_transaction_type },
      },
    },
  };
  // if (transaction?.flag_name) {
  //   notionRequestObject.properties.Flag = {
  //     select: {
  //       name: transaction.flag_name,
  //       color: transaction?.flag_color,
  //     },
  //   };
  // }
  // if (transaction?.debt_transaction_type) {
  //   notionRequestObject.properties.debt_transaction_type = {
  //     select: { name: transaction.debt_transaction_type },
  //   };
  // }
  //TODO: Research how to send the create request with childs
  const notionTextProperties = addTextProperties(transaction);
  notionRequestObject.properties = {
    ...notionRequestObject.properties,
    ...notionTextProperties,
  };
  console.log(notionRequestObject);
  const cleanNotionRequestObject = cleanObject(notionRequestObject);
  return cleanNotionRequestObject;
}

function addTextProperties(transaction: YnabTransaction) {
  const textProperties = [
    'ynab_id',
    'account_id',
    'payee_id',
    'category_id',
    'transfer_account_id',
    'transfer_transaction_id',
    'matched_transaction_id',
    'import_id',
    'import_payee_name',
    'import_payee_name_original',
  ];
  const notionTextProperties = {};
  for (const textProp of textProperties) {
    if (transaction?.[textProp]) {
      //INFO: Incluir en la función de limpieza?
      notionTextProperties[textProp] = {
        rich_text: [{ text: { content: transaction[textProp] } }],
      };
    }
  }
  return notionTextProperties;
}

async function createNotionPageFromTransaction(notionCreateRequest) {
  // TODO: CReate notion type
  const notion = new Client({ auth: process.env.NOTION_KEY });
  const pageResponse = await notion.pages.create(notionCreateRequest);
  console.log(pageResponse);
  return pageResponse.id;
}

async function createNotionChildPage(
  parentPageId: string,
  subTransactions: YnabSubTransaction[],
) {
  const notion = new Client({ auth: process.env.NOTION_KEY });
  console.log('parentId', parentPageId);
  for (const subTransaction of subTransactions) {
    const childPageResponse = await notion.pages.create({
      parent: { database_id: process.env.NOTION_YNAB_DATABASE_ID },
      properties: {
        Parent: {
          relation: [{ id: parentPageId }],
        },
        ynab_id: {
          rich_text: [{ text: { content: subTransaction.id } }],
        },
        transaction_id: {
          rich_text: [{ text: { content: subTransaction.transaction_id } }],
        },
        Amount: {
          number: subTransaction.amount / 1000,
        },
        Deleted: {
          checkbox: subTransaction.deleted,
        },
        // Non required properties
        Memo: {
          type: 'title',
          title: [
            {
              type: 'text',
              text: { content: subTransaction.memo, link: null },
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
        Category: { select: { name: subTransaction.category_name } },
        Payee: { select: { name: subTransaction.payee_name } }, //TODO: Revisa si el color se pone por defecto o cambia.
        payee_id: {
          rich_text: [{ text: { content: subTransaction.payee_id } }],
        },
        category_id: {
          rich_text: [{ text: { content: subTransaction.category_id } }],
        },
      },
      //create a function to create the requests in an array
    });
    console.log(childPageResponse);
  }
  //INFO: https://chat.deepseek.com/a/chat/s/b329d24e-479f-4ec4-be4a-c96e2d3675b1
  // https://developers.notion.com/reference/property-object#relation
  // me quede creando la función para los child, estoy viendo si puedo reutilizar algo (el id del subtransaction es subtransaciton id)
  // no el transaction id.
  // 05/29/25 -> cree los tipos a seguirle con lo de arriba (subtransactions)
}
// TODO create a jest test that test that the function creates a request with all data

function cleanObject(obj: object) {
  const newObj = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const cleanedValue = cleanObject(value);
      if (Object.keys(cleanedValue).length > 0) {
        newObj[key] = cleanedValue;
      }
    } else if (value !== undefined) {
      newObj[key] = value;
    }
  }
  return newObj;
}

