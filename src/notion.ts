import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const BASE_NOTION_URL = 'https://api.notion.com';

const notion = new Client({ auth: process.env.NOTION_KEY });

// const listUsersResponse = await notion.users.list({});
// console.log(listUsersResponse);
async function getHabits(
  startDate: Date = new Date(),
  endDate: Date = new Date(),
): Promise<void> {
  //       TODO: give default values to start and end Date. Input will be string, not date type and then convert it to Date
  //       function logDate(date?: Date | string): void {
  //   if (!date || date === '') {
  //     date = new Date(); // Default value
  //   }
  //   console.log(date instanceof Date ? date.toISOString() : new Date(date).toISOString());
  // }

  const currentDate = startDate;
  while (currentDate <= endDate) {
    const doneHabits = await pullDoneHabits(currentDate);
    const habitPage = await pullHabitPage(currentDate);
    await updateDoneHabits(doneHabits, habitPage);
    console.log('notion end');
    currentDate.setDate(startDate.getDate() + 1); // Increment the date by 1 day
  }
}
// const dateArray = [new Date()];
const startDate = new Date();
const endDate = new Date(); // TODO: Should be a string in format 'YYYY-MM-DD'

getHabits(startDate, endDate);

//TODO: la fecha que mandas define desde donde empiezas a jalar datoss

async function updateDoneHabits(doneHabits, habitPage) {
  const properties = {};
  for (const habit of doneHabits) {
    // console.log(habit.properties);
    // console.log(habit.properties.Task.title);
    const habitName = habit.properties.Task.title[0].plain_text.trim();
    // console.log(habitName);
    const habitProp = habitPage.properties[habitName];
    // console.log(habitProp);
    if (!habitProp) {
      console.error(`Habit '${habitName}' not found on Habit Tracker database`);
      continue;
    }
    properties[habitName] = { checkbox: true };
    //INFO:https://developers.notion.com/reference/update-a-database
    //TODO: Seguiria hacer el two way. Cambio el Tracker creo/borro algo en el main ?? revisar si combiene o no.
  }
  console.log(properties);

  await notion.pages.update({
    page_id: habitPage.id,
    properties,
  });
}

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

