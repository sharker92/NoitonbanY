import * as ynab from 'ynab';
import { Client } from '@notionhq/client';

import dotenv from 'dotenv';

dotenv.config();
const ynabAPI = new ynab.API(process.env.YNAB_KEY);
(async function () {
  const transactionsResponse = await ynabAPI.transactions.getTransactions(
    process.env.YNAB_BUDGET_ID,
    // '2025-02-01',
  );
  const transactions = transactionsResponse.data.transactions;
  const transactionsServerKnowledge =
    transactionsResponse.data.server_knowledge;
  // console.log(transactions);
  console.log(transactions[10]);
  console.log(transactions[11]);
  console.log(transactions.length);
  console.log(transactionsServerKnowledge);
  const notion = new Client({ auth: process.env.NOTION_KEY });
  const response = await notion.pages.create({
    parent: { database_id: process.env.NOTION_YNAB_DATABASE_ID },
    properties: {
      Name: {
        type: 'title',
        title: [
          {
            type: 'text',
            text: { content: transactions[10].memo, link: null }, //TODO: SIgue mandar el transactions[0] hehe ya logre crear la pagina en notion :) https://developers.notion.com/reference/post-page
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
      'Transaction Date': {
        date: {
          start: transactions[10].date,
        },
      },
      Amount: {
        number: transactions[10].amount / 1000,
      },
      Payee: { select: { name: transactions[10].payee_name } }, //TODO: Revisa si el color se pone por defecto o cambia.
      Category: { select: { name: transactions[10].category_name } },
      Account: { select: { name: transactions[10].account_name } },
    },
  });
  console.log(response);
  // Get budgets data
  // const budgetsResponse = await ynabAPI.budgets.getBudgets();
  // const budgets = budgetsResponse.data.budgets;
  // console.log(budgetsResponse);
})();
// TODO: load everything in notion and do a process to get the last server_knowledge to just pull every day the last transactions.
// {
//   id: 'a1b71d00-6158-4e7d-b9e0-ad7c79e66516',
//   cleared: 'reconciled',
//   approved: true,
//   flag_color: undefined,
//   flag_name: undefined,
//   account_id: '5afbbcbc-fca0-4404-bd06-d914cd21e9f5',
//   payee_id: '0e3f890b-021f-43a3-82b4-5b2144314aa2',
//   category_id: '53ce3b8f-6cc0-4db6-8c64-eac6238ef7d6',
//   transfer_account_id: undefined,
//   transfer_transaction_id: undefined,
//   matched_transaction_id: undefined,
//   import_id: undefined,
//   import_payee_name: undefined,
//   import_payee_name_original: undefined,
//   debt_transaction_type: undefined,
//   deleted: false,
//   account_name: 'Platino',
//   payee_name: 'Starting Balance',
//   category_name: 'Inflow: Ready to Assign',
//   subtransactions: []
// }

