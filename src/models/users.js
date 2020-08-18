const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Sales = require('./sales')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        require:true,
        trim: true
    },
    email:{
        type: String,
        require:true,
        unique:true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is invalid")
            }

        }
    },
    password:{
        type:String,
        require:true,
        validate(value){
            if(value.length<6){
                throw new Error("Email is too short")
            }else if(value.includes("password")){
                throw new Error("Password must not include the word")
            }
        }
    },
    items:[{
        product:{
            type:String,
            trim:true
        },
        unitcost:{
            type:Number,
            validate(value){
                if(value<0){
                    throw new Error("It cannot be negative")
                }
            }
        },
        quantity:{
            type:Number,
            validate(value){
                if(value<0){
                    throw new Error("It cannot be negative")
                }
            }
        }
    }    
    ], 
    tokens:[{
        token:{
            type:String,
            require:true
        }
    }]

}, {
    timestamps:true
})

//Remove unnecesary details when showing user profile
userSchema.methods.toJSON = function(){
    const user = this
    const userObject =user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

//Establish the connection between the user and his sales
userSchema.virtual('sales', {
    ref:'Sales',
    localField:'_id',
    foreignField:'owner'
})
//Hash the passwords
userSchema.pre('save', async function(next){
    const user=this
    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password, 8)
    }
    next()
})
//Generate authentication token
userSchema.methods.genAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id:user._id.toString()}, process.env.JSONWEBTOKEN)
    user.tokens =user.tokens.concat({token})
    await user.save()
    return token
}
//Login user
userSchema.statics.findByCredentials = async(email, password)=>{
    const user = await User.findOne({email})
    if(!user){
         throw new Error("Unable to login!")
    }
    const isMatch= await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error("Unable to login!")
    }
    return user
}

//Remove all sales when user deletes profile
userSchema.pre('remove', async function(next){
    const user= this
    await Sales.deleteMany({owner:user._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports=User