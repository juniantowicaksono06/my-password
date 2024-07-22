import mongoose, {Connection} from "mongoose";
import UserKeysSchema from "./dbkeys-schema/UserKeysSchema";

const userKeysCollection: mongoose.Model<Database.IUserKeys> = mongoose.models.userKeys || mongoose.model('userKeys', UserKeysSchema, 'userKeys');

const MONGODB_URI = process.env.MONGODB_KEYS_URL_STRING as string;

interface Cached {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  }
  
  declare global {
    // eslint-disable-next-line no-var
    var mongoose: Cached;
  }
  
  let cached: Cached = global.mongoose;
  
  if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
  }

async function ConnectDBKeys(): Promise<Connection> {
    if (cached.conn) {
      return cached.conn;
    }
  
    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
      };
  
      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        return mongoose.connection;
      });
    }
  
    cached.conn = await cached.promise;
    return cached.conn;
}

export {
    ConnectDBKeys,
    userKeysCollection
}