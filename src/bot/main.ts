import { get } from "../axios";
import {
  CATEGORY,
  JOURNAL,
  ORGANIZATION,
  RAWJOURNAL,
  SOURCE,
} from "../constant";
import {
  addUDocument,
  getFirstURDocument,
  getURDocuments,
  getWhereDocuments,
  removeDocument,
  setUDocument,
} from "../firebase";
import { generateContent } from "../gemini/main";
import { UCategory, UJournal, UOrganization, USource } from "../types/main";

import Parser from "rss-parser";

export const fakePromise = (t: number) =>
  new Promise((resolve) => setTimeout(() => resolve(true), t));

export const getRawJournal = (
  rssItem: Parser.Item,
  sourceId: string,
  categoryId?: string,
  organizationId?: string
): UJournal | undefined => {
  if (
    !rssItem.pubDate ||
    !rssItem.link ||
    !rssItem.title ||
    !rssItem.content ||
    !categoryId ||
    !organizationId
  )
    return;
  return {
    rss: {
      url: rssItem.link,
      title: rssItem.title,
      content: rssItem.content,
      pubDate: rssItem.pubDate,
    },
    result: {
      title: "",
      summary: "",
      ptimestamp: Date.parse(rssItem.pubDate),
    },
    source: sourceId,
    category: categoryId,
    organization: organizationId,
  };
};

export const hasRawJournal = async (url: string) => {
  const snapshot = await getWhereDocuments(RAWJOURNAL, [["data.rss.url", url]]);
  return snapshot.length != 0;
};

export const hasJournal = async (url: string) => {
  const snapshot = await getWhereDocuments(JOURNAL, [["data.rss.url", url]]);
  return snapshot.length != 0;
};

export const getJournals = async () => {
  const sources = await getURDocuments<USource>(SOURCE);

  const parser = new Parser();
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    const feed = await parser.parseURL(source.data.url);
    for (let index = 0; index < feed.items.length; index++) {
      await fakePromise(1000);
      const item = feed.items[index];
      const journal = getRawJournal(
        item,
        source.id,
        source.data.category,
        source.data.organization
      );
      if (journal) {
        const [journalExist, rawJournalExist] = await Promise.all([
          hasJournal(journal.rss.url),
          hasRawJournal(journal.rss.url),
        ]);
        if (!journalExist && !rawJournalExist)
          await setUDocument.pLogger(RAWJOURNAL, Date.now().toString(), {
            data: journal,
            timestamp: Date.now(),
            utimestamp: Date.now(),
          });
      }
    }
  }
};

export const sumJournal = async () => {
  const journal = await getFirstURDocument<UJournal>(RAWJOURNAL);
  if (journal) {
    const page = await get(journal.data.rss.url);
    const content = await generateContent.pLogger(
      `bu sayfada ki haberi ozetleyip ve yeni bir baslik olusturarak {title, summary} seklinde json olarak cevap ver, haber: \n\n ${page.data}`
    );
    const result = JSON.parse(
      content.response.text().replace("```json", "").replace("```", "")
    );
    await removeDocument.pLogger(RAWJOURNAL, journal.id);
    journal.data.result.title = result.title;
    journal.data.result.summary = result.summary;
    await setUDocument.pLogger(JOURNAL, journal.id, {
      timestamp: journal.timestamp,
      utimestamp: Date.now(),
      data: journal.data,
    });
  }
};
