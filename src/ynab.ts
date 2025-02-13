import * as ynab from 'ynab';

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
  console.log(transactions.length);
  console.log(transactionsServerKnowledge);
  // const budgetsResponse = await ynabAPI.budgets.getBudgets();
  // const budgets = budgetsResponse.data.budgets;
  // console.log(budgetsResponse);
})();

