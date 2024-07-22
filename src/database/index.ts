import mongoose, {Connection} from "mongoose";
import UsersSchema from "./main-schema/UsersSchema";
import UserTokenSchema from "./main-schema/UserTokenSchema";
import AppMenuSchema from "./main-schema/AppMenuSchema";
import PasswordsSchema from "./main-schema/PasswordsSchema";
import LoginOTPSchema from "./main-schema/LoginOTPSchema";
import UserKeysSchema from "./dbkeys-schema/UserKeysSchema";

mongoose.pluralize(null);
const userCollection: mongoose.Model<Database.IUserData> = mongoose.models.users || mongoose.model('users', UsersSchema, 'users');
const userTokenCollection: mongoose.Model<Database.IUserToken> = mongoose.models.userToken || mongoose.model('userToken', UserTokenSchema, 'userTokens');
const appMenuCollection: mongoose.Model<Database.IAppMenu> = mongoose.models.appMenu || mongoose.model('appMenu', AppMenuSchema, 'appMenus');
const passwordsCollection: mongoose.Model<Database.IPasswords> = mongoose.models.passwords || mongoose.model('passwords', PasswordsSchema, 'passwords');
const loginOTPCollection: mongoose.Model<Database.ILoginOTP> = mongoose.models.loginOTP || mongoose.model('loginOTP', LoginOTPSchema, 'loginOTP');

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
    userTokenCollection,
    appMenuCollection,
    passwordsCollection,
    loginOTPCollection
}