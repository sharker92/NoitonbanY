import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_YNAB_URL = 'https://api.ynab.com/v1';

async function getYnabData(endpoint = '') {
  try {
    const { data } = await axios.get(BASE_YNAB_URL + endpoint, {
      headers: {
        Authorization: `Bearer ${process.env.YNAB_KEY}`,
      },
    });
    return data;
  } catch ({ response: { data, status, statusText } }) {
    // } catch (err) {
    console.error(status, statusText, data);
    // console.error(err);
    return { status, statusText, data };
  }
}
const userUrl = '/user';
const userData = await getYnabData(userUrl);
console.log(userData);
const budgetsUrl = '/budgets';
const budgetsData = await getYnabData(budgetsUrl);
console.log(JSON.stringify(budgetsData, null, 2));
const budgetId = 'e4cfb304-256e-4a9c-8a7c-9f4e23950ba8';
const categoriesUrl = `/budgets/${budgetId}/categories`;
const categoriesData = await getYnabData(categoriesUrl);
console.log(JSON.stringify(categoriesData, null, 2));
console.log('You rock');
// TODO: Search budgets, in base of an inputed name, search for the specified budget.

