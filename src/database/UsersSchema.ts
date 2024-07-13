import mongoose from "mongoose"

const {Schema} = mongoose

const UsersSchema = new Schema({
    username: {
        type: String,
        required: false
    },
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: false
    },
    userStatus: {
        type: Number,
        min: 0,
        max: 3,
        required: true
    },
    picture: {
        type: String,
        required: false
    },
    userCreatedType: {
        type: String,
        required: true
    },
    userActivationToken: {
        type: String,
        optional: true
    },
    userResetToken: {
        type: String,
        optional: true
    },
    userActivationTokenValidDate: {
        type: Date,
        optional: true,
    },
    userResetTokenValidDate: {
        type: Date,
        optional: true,
    }
}, 
{
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
})

export default UsersSchema;