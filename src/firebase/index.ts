import admin, { ServiceAccount } from "firebase-admin";
import { getFirestore, Query } from "firebase-admin/firestore";
import service from "./service.json";
import { UDocument, URDocument } from "../types/main";

admin.initializeApp({
  credential: admin.credential.cert(service as ServiceAccount),
});

export const db = getFirestore();

export const addUDocument = async <T>(
  collection: string,
  data: UDocument<T>
) => {
  await db.collection(collection).add(data);
  return true;
};
export const setUDocument = async <T>(
  collection: string,
  document: string,
  data: UDocument<T>
) => {
  await db.collection(collection).doc(document).set(toUDocument(data));
  return true;
};
export const getWhereDocuments = async <T>(
  collection: string,
  conditions: Array<[key: string, value: string]>
) => {
  let query = db.collection(collection) as Query;
  conditions.forEach((condition) => {
    query = query.where(condition[0], "==", condition[1]);
  });
  const querySnapshot = await query.get();
  return toURDocuments<T>(querySnapshot);
};
export const getURDocuments = async <T>(collection: string) => {
  const querySnapshot = await db.collection(collection).get();
  return toURDocuments<T>(querySnapshot);
};

export const getFirstURDocument = async <T>(collection: string) => {
  const querySnapshot = await db
    .collection(collection)
    .orderBy("data.result.ptimestamp")
    .limit(1)
    .get();
  const snapshot = querySnapshot.docs[0];
  return toURDocument<T>(snapshot);
};
export const removeDocument = async (collection: string, document: string) => {
  await db.collection(collection).doc(document).delete();
  return true;
};

export const toURDocuments = <T>(
  querySnapshot: admin.firestore.QuerySnapshot<
    admin.firestore.DocumentData,
    admin.firestore.DocumentData
  >
) => {
  return querySnapshot.docs.map((snapshot) => {
    return {
      id: snapshot.id,
      ref: snapshot.ref,
      ...(snapshot.data() as any),
    } as URDocument<T>;
  });
};

export const toURDocument = <T>(
  snapshot: admin.firestore.QueryDocumentSnapshot<
    admin.firestore.DocumentData,
    admin.firestore.DocumentData
  >
) => {
  return {
    id: snapshot.id,
    ref: snapshot.ref,
    ...(snapshot.data() as any),
  } as URDocument<T>;
};

export const toUDocument = <T>(document: UDocument<T>): UDocument<T> => {
  return {
    data: { ...document.data },
    timestamp: document.timestamp,
    utimestamp: document.utimestamp,
  };
};
