import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    id:{
        type: String,
        required: true,
        unique: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    products: [{
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
    total_amount: {
        type: Number,
        required: true,
        min: 0,
    },
    transaction_date: {
        type: Date,
        default: Date.now,
    },

});

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);