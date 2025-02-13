import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const BASE_NOTION_URL = 'https://api.notion.com';

console.log(process.env.NOTION_KEY);
console.log('notion key');
const notion = new Client({ auth: process.env.NOTION_KEY });

// const listUsersResponse = await notion.users.list({});
// console.log(listUsersResponse);
const habits = await notion.databases.query({
  database_id: '0454bd36d43345eeae35db20cbb937c8',
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
console.log('notion end');

