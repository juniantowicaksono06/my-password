import mongoose from "mongoose";
import UsersSchema from "./main-schema/UsersSchema";
import UserTokenSchema from "./main-schema/UserTokenSchema";
import AppMenuSchema from "./main-schema/AppMenuSchema";
import PasswordsSchema from "./main-schema/PasswordsSchema";
import LoginOTPSchema from "./main-schema/LoginOTPSchema";
import UserKeysSchema from "./dbkeys-schema/UserKeysSchema";

interface ModelType {
    userCollection?: mongoose.Model<Database.IUserData>;
    userTokenCollection?: mongoose.Model<Database.IUserToken>;
    appMenuCollection?: mongoose.Model<Database.IAppMenu>;
    passwordsCollection?: mongoose.Model<Database.IPasswords>;
    loginOTPCollection?: mongoose.Model<Database.ILoginOTP>;
    userKeysCollection?: mongoose.Model<Database.IUserKeys>;
}

class Database {
    private connection: string | null = null;
    private connectionType: "main" | "keys" = "main";
    private db: mongoose.Connection | null = null;
    private listModels: ModelType = {};

    constructor(connection: "main" | "keys" | "" = "") {
        if(connection !== "") {
            this.createConnection(connection);
        }
    }

    createConnection(connection: "main" | "keys") {
        switch (connection) {
            case "main":
                this.connection = process.env.MONGO_URL_STRING as string;
                this.connectionType = "main";
                break;
            case "keys":
                this.connection = process.env.MONGODB_KEYS_URL_STRING as string;
                this.connectionType = "keys";
                break;
            default:
                throw new Error("Invalid connection type");
        }
        this.db = mongoose.createConnection(this.connection, {
            minPoolSize: 3,
        });
        return this;
    }

    initModel() {
        switch(this.connectionType) {
            case "main":
                this.listModels = {
                    userCollection: this.db?.models.users || this.db?.model('users', UsersSchema, 'users'),
                    userTokenCollection: this.db?.models.userToken || this.db?.model('userToken', UserTokenSchema, 'userTokens'),
                    appMenuCollection: this.db?.models.appMenu || this.db?.model('appMenu', AppMenuSchema, 'appMenus'),
                    passwordsCollection: this.db?.models.passwords as unknown as mongoose.Model<Database.IPasswords> || this.db?.model('passwords', PasswordsSchema, 'passwords') as unknown as mongoose.Model<Database.IPasswords>,
                    loginOTPCollection: this.db?.models.loginOTP as unknown as mongoose.Model<Database.ILoginOTP> || this.db?.model('loginOTP', LoginOTPSchema, 'loginOTP') as unknown as mongoose.Model<Database.ILoginOTP>,
                }
                break;
            case "keys":
                this.listModels = {
                    userKeysCollection: this.db?.models.userKeys as unknown as mongoose.Model<Database.IUserKeys> || this.db?.model('userKeys', UserKeysSchema, 'userKeys') as unknown as mongoose.Model<Database.IUserKeys>,
                }
                break;
            default:
                throw new Error("Invalid connection type");
        }
        return this;
    }

    getModels() {
        return this.listModels;
    }
}

export default Database;