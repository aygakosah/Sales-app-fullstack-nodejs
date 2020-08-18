const User = require("../models/users")
const jwt = require('jsonwebtoken')

const auth = async (req, res, next)=>{
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        // const token = req.header('token')
        const decoded = jwt.verify(token, process.env.JSONWEBTOKEN)
        const user = await User.findOne({_id:decoded._id, 'tokens.token':token})

        if(!user){
            throw new Error()
        }
        req.token=token
        req.user=user
        next() 
    } catch (error) {
        res.status(404).send({'Error':"Please Authenticate"})
    }
    
}

module.exports=auth