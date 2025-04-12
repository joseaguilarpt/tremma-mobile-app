// database.ts
import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

import schema from "./schema";
import { Message, User, Roadmap, Return, Order, Payment } from "./model";

// Crear el adaptador SQLite
const adapter = new SQLiteAdapter({
  schema,
});

// Crear la base de datos
export const database = new Database({
  adapter,
  modelClasses: [Message, User, Roadmap, Return, Order, Payment],
});
