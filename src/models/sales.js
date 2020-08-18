const mongoose = require('mongoose')
const validator = require('validator')

const salesSchema = new mongoose.Schema({
    item:{
        type:String,
        trim:true,
        require:true,
    },
    quantity:{
        type:Number,
        default:1
    },
    unitcost:{
        type:Number,
        default:1
    },
    total:{
        type:Number,
        default:0
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        require: true,
        ref:'User'
    }
}, {
    timestamps:true
})

const Sales = mongoose.model('Sales', salesSchema)

module.exports=Sales