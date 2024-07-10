import mongoose, {Connection} from "mongoose";
import UsersSchema from "./UsersSchema";
import UserTokenSchema from "./UserTokenSchema";

const userCollection: mongoose.Model<Database.IUserData> = mongoose.models.users || mongoose.model('users', UsersSchema);
const userTokenCollection: mongoose.Model<Database.IUserToken> = mongoose.models.userToken || mongoose.model('userToken', UserTokenSchema);

const MONGODB_URI = process.env.MONGO_URL_STRING as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

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

async function ConnectDB(): Promise<Connection> {
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
    ConnectDB,
    userCollection,
    userTokenCollection
}