import mongoose from "mongoose"

const {Schema} = mongoose

const PasswordsSchema = new Schema({
    userID: {
        type: Schema.Types.ObjectId,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    url: {
        type: String,
        optional: true
    },
    itemType: {
        type: String,
        optional: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

export default PasswordsSchema;