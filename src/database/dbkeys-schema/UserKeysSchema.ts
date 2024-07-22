import { string } from "@hapi/joi"
import mongoose, { Types } from "mongoose"

const {Schema} = mongoose

const UserKeysSchema = new Schema({
    userID: {
        type: Types.ObjectId,
        required: true
    },
    publicKey: {
        type: String,
        required: true
    },
    privateKey: {
        type: String,
        required: true
    }
}, 
{
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
})

export default UserKeysSchema;