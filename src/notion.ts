import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const BASE_NOTION_URL = 'https://api.notion.com';

const notion = new Client({ auth: process.env.NOTION_KEY });

// const listUsersResponse = await notion.users.list({});
// console.log(listUsersResponse);
const habits = await notion.databases.query({
  database_id: process.env.NOTION_MAIN_DATABASE_ID,
  filter: {
    and: [
      { property: 'Due', date: { is_not_empty: true } },
      { property: 'Recur Unit', select: { is_not_empty: true } },
      { property: 'Recur Interval', number: { is_not_empty: true } },
      { property: 'Occurrences History', relation: { is_not_empty: true } },
    ],
  },
});
console.log(habits);
console.log(habits.results.length);
console.log('notion end');

// Testing in 1 and 2 tables
// const habits = await notion.databases.query({
//   database_id: '19bf80c2a4fc80b28517f6e8daa29386',
// });
// console.log(habits);
// console.log(habits.results.length);

