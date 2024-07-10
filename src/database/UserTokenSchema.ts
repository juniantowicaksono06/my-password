import mongoose from "mongoose"

const {Schema} = mongoose;

const UserTokenSchema = new Schema({
    userID: {
        type: Schema.Types.ObjectId,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    validDate: {
        type: Date,
        required: true,
        default: Date.now()
    }
}, 
{
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

export default UserTokenSchema;