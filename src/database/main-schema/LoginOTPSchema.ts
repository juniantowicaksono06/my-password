import { string } from "@hapi/joi";
import mongoose, { Types } from "mongoose"

const {Schema} = mongoose

const LoginOTPSchema = new Schema({
    userID: {
        type: Types.ObjectId,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    validUntil: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        required: true
    }
})

export default LoginOTPSchema;