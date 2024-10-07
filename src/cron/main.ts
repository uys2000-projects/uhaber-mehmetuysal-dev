import cron from "node-cron";
import { getJournals, sumJournal } from "../bot/main";

export const getJournalScheduler = () => {
  const options = { scheduled: true, timezone: "Europe/Istanbul" };
  const task = cron.schedule("* */6 * * *", getJournals, options);
  setTimeout(() => {
    task.start();
    task.now();
  });
  return true;
};

export const sumJournalScheduler = () => {
  const options = { scheduled: true, timezone: "Europe/Istanbul" };
  const task = cron.schedule("* * * * *", sumJournal, options);
  setTimeout(() => {
    task.start();
    task.now();
  });
  return true;
};
