import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const BASE_NOTION_URL = 'https://api.notion.com';

console.log(process.env.NOTION_KEY);
console.log('notion key');
const notion = new Client({ auth: process.env.NOTION_KEY });

const listUsersResponse = await notion.users.list({});

console.log(listUsersResponse);
console.log('notion end');

