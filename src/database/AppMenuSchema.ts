import mongoose from "mongoose"

const {Schema} = mongoose

const AppMenuSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true
    }
})

export default AppMenuSchema;