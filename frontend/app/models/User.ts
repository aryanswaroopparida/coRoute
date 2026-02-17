import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
    },
    optionalPhoneNumber: {
        type: String,
        unique: true,
    },
    role: {
        type: String,
        enum: ['Customer', 'Seller', 'Admin'],
        default: 'Customer',
    },
    address: {
        type: [String],
    },
    defaultAddressIndex: {
        type: Number,
        default: 0,
    },
    cart: [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        Quantity: {
            type: Number,
            required: true,
            min: 1,
        }
    }],
    transaction_history: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Transaction',
    },
    timeStamp: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);