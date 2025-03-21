import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const BASE_NOTION_URL = 'https://api.notion.com';

const notion = new Client({ auth: process.env.NOTION_KEY });

// const listUsersResponse = await notion.users.list({});
// console.log(listUsersResponse);
async function getHabits(dateArray: Date[]): Promise<void> {
  for (const date of dateArray) {
    console.log(date.toISOString());
    const habits = await notion.databases.query({
      database_id: process.env.NOTION_MAIN_DATABASE_ID,
      filter: {
        and: [
          {
            property: 'Completed',
            date: { equals: date.toISOString().split('T')[0] }, // TODO: ahora sigue hacer el check en el reporte. Jalar la página del día y hacer checks.
          },
          { property: 'Recur Unit', select: { is_empty: true } },
          { property: 'Recur Interval', number: { is_empty: true } },
          { property: 'Recurrent Parent', relation: { is_not_empty: true } },
          // { property: 'Task', title: { equals: 'Fuerza' } },
        ],
      },
    });
    console.log(habits);
    // console.log(habits.results[0].properties['Occurrences History']);
    // console.log(habits.results[0].properties['Occurrences History'].relation);
    console.log(habits.results.length);
    console.log('notion end');
  }
}
const dateArray = [new Date()];
getHabits(dateArray);

//TODO: la fecha que mandas define desde donde empiezas a jalar datoss

