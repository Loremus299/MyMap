import { createId } from "@paralleldrive/cuid2";
import Dexie, { Table } from "dexie";

const db = new Dexie("List of all maps");
db.version(1).stores({
  table: "++id, name, date, cuid",
});

const mapTable: Table<{
  id?: number;
  name: string;
  date: string;
  cuid: string;
}> = db.table("table");

export function createMap(name: string) {
  const date = new Date();
  const id = createId();
  mapTable.add({
    name: name,
    date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
    cuid: id,
  });
  return id;
}

export async function readMap(id: string) {
  return (await mapTable.where("cuid").equals(id).first())?.name;
}

export async function readMaps() {
  return mapTable.toArray();
}

export async function verifyMap(cuid: string) {
  return await mapTable.where("cuid").equals(cuid).count();
}

export async function updateMapName(id: number, name: string) {
  mapTable.where("id").equals(id).modify({ name: name });
}

export async function deleteMap(id: number, cuid: string) {
  mapTable.where("id").equals(id).delete();
  const db = new Dexie(cuid);
  return await db.delete();
}
