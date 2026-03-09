import mongoose from 'mongoose';

const entitySchema = new mongoose.Schema({
    entityType: { type: String, required: true, index: true },
    user_id: { type: String, required: false, index: true }
}, {
    timestamps: true,
    strict: false // Allows arbitrary fields sent from the frontend to be saved without defining them
});

// Format the object to match what the frontend expects (id instead of _id, created_date)
entitySchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        ret.created_date = ret.createdAt;
        ret.updated_date = ret.updatedAt;
        return ret;
    }
});

const Entity = mongoose.model('Entity', entitySchema);
export default Entity;
