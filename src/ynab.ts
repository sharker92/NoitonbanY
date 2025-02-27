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
  console.log(transactions[0]);
  console.log(transactions.length);
  console.log(transactionsServerKnowledge);
  const notion = new Client({ auth: process.env.NOTION_KEY });
  const response = await notion.pages.create({
    parent: { database_id: process.env.NOTION_YNAB_DATABASE_ID }, //TODO: me quede aquí aaaah voy a ver si puedo crear una pagina en notion
    properties: {
      Name: {
        type: 'title',
        title: [
          {
            type: 'text',
            text: { content: 'Smoethign', link: null },
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
    },
  });
  console.log(response);
  // Get budgets data
  // const budgetsResponse = await ynabAPI.budgets.getBudgets();
  // const budgets = budgetsResponse.data.budgets;
  // console.log(budgetsResponse);
})();
// TODO: load everything in notion and do a process to get the last server_knowledge to just pull every day the last transactions.
// INFO: DEEPSEEK EXAMPLE
// const { Client } = require('@notionhq/client');
//
// // Initialize the Notion client with your integration token
// const notion = new Client({
//   auth: process.env.NOTION_TOKEN || 'your_integration_token_here',
// });
//
// // Function to create a page in a Notion database
// async function createNotionPage() {
//   try {
//     const response = await notion.pages.create({
//       parent: {
//         database_id: 'YOUR_DATABASE_ID', // Replace with your database ID
//       },
//       properties: {
//         // Map properties based on your database schema
//         // Example properties (adjust to match your database):
//         'Title': {
//           title: [
//             {
//               text: {
//                 content: 'Sample Page Title',
//               },
//             },
//           ],
//         },
//         'Status': {
//           select: {
//             name: 'In Progress',
//           },
//         },
//         'Priority': {
//           select: {
//             name: 'High',
//           },
//         },
//         'Due Date': {
//           date: {
//             start: '2023-12-31',
//           },
//         },
//         'Description': {
//           rich_text: [
//             {
//               text: {
//                 content: 'This is a sample description for the Notion page.',
//               },
//             },
//           ],
//         },
//         'Points': {
//           number: 5,
//         },
//       },
//     });
//
//     console.log('Page created:', response);
//   } catch (error) {
//     console.error('Error creating page:', error);
//   }
// }
//
// // Run the function
// createNotionPage();

