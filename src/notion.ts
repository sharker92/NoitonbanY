import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const BASE_NOTION_URL = 'https://api.notion.com';

const notion = new Client({ auth: process.env.NOTION_KEY });

// const listUsersResponse = await notion.users.list({});
// console.log(listUsersResponse);
async function getHabits(dateArray: Date[]): Promise<void> {
  for (const date of dateArray) {
    const doneHabits = await pullDoneHabits(date);
    const habitPage = await pullHabitPage(date);
    console.log('notion end');
    for (const habit of doneHabits) {
      // console.log(habit.properties);
      // console.log(habit.properties.Task.title);
      const habitName = habit.properties.Task.title[0].plain_text.trim();
      console.log(habitName);
      const habitProp = habitPage.properties[habitName];
      console.log(habitProp);
      if (!habitProp) {
        console.error(`Habit ${habitName} not found on Habit Tracker database`);
      }
      //TODO:https://developers.notion.com/reference/update-a-database
      //TODO: Sigue cambiar el valor a true y guardarlo en la base de datos.
      //TODO: Seguiria hacer el two way. Cambio el Tracker creo/borro algo en el main ?? revisar si combiene o no.
    }
  }
}
const dateArray = [new Date()];
getHabits(dateArray);

//TODO: la fecha que mandas define desde donde empiezas a jalar datoss

function dateToYYYYMMDDFormat(date: Date) {
  return date.toISOString().split('T')[0];
}

async function pullDoneHabits(date: Date) {
  const formatedDate = dateToYYYYMMDDFormat(date);
  console.log(formatedDate);
  const habits = await notion.databases.query({
    database_id: process.env.NOTION_MAIN_DATABASE_ID,
    filter: {
      and: [
        {
          property: 'Completed',
          date: { equals: formatedDate }, // TODO: ahora sigue hacer el check en el reporte. Jalar la página del día y hacer checks.
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
  return habits.results;
}

async function pullHabitPage(date: Date) {
  const formatedDate = dateToYYYYMMDDFormat(date);
  console.log(formatedDate);
  const habitPage = await notion.databases.query({
    database_id: process.env.NOTION_HABIT_TRACKER_DATABASE_ID,
    filter: {
      and: [
        {
          property: 'Created time',
          date: { equals: formatedDate },
        },
      ],
    },
  });
  console.log(habitPage);
  console.log(habitPage.results[0].properties);
  return habitPage.results[0];
}
// INFO: To be able to query a database you need to give access to the Connection.
// INFO: El nobmre del habit y la columna del Habit Tracker DEBEN ser iguales.

