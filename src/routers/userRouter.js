const express = require('express')
const router = new express.Router()
const User = require('../models/users')
const auth = require('../middleware/auth')

router.post('/user', async(req, res)=>{
    const user = new User(req.body)
    try {
        const token = await user.genAuthToken()
        res.status(200).send({user, token})
        await user.save()
    } catch (error) {
        res.status(404).send(error)
    }
})

router.post('/userlogin', async(req, res)=>{
    try {
        const user =await User.findByCredentials(req.body.email, req.body.password)
        const token =await user.genAuthToken()
        res.status(200).send({user, token})
    } catch (error) {
        res.status(400).send(error)
        
    }
})
router.post('/userlogout', auth, async(req, res)=>{
    try {
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token!=req.token
        })
        await req.user.save()
        res.status(200).send()
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/userlogoutall', auth, async(req, res)=>{
    try {
        req.user.tokens=[]
        await req.user.save()
        res.status(200).send()
    } catch (error) {
        res.status(400).send()
    }
})

router.post('/useritems', auth,  async(req, res)=>{
    let not_inside =true
    try {
        req.user.items.forEach(item => {
            if(item.product==req.body.product){
                not_inside=false
                item.product=req.body.product
                if(req.body.unitcost){
                    item.unitcost=req.body.unitcost
                }
                if(item.quantity<0){
                    item.quantity=0
                }
                item.quantity+=req.body.quantity
            }
        });
        if(not_inside){
            req.user.items.push(req.body)
        }
        await req.user.save()
        res.status(200).send(req.user)
    } catch (error) {
        res.status(400).send(error)
        
    }
})

router.patch('/userupdate', auth, async(req, res)=>{
    const updates = Object.keys(req.body)
    const updateAllowed =['name', 'password', 'email']
    const isValid = updates.every((update)=>{
        return updateAllowed.includes(update)
    })
    if(!isValid){
        res.status(400).send({error:"Invalid operation"})
    }
    try {
        updates.forEach(update => {
            req.user[update]=req.body[update]
        });
        await req.user.save()
        res.status(200).send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})


router.delete('/userdelete', auth, async(req, res)=>{
    try {
        await req.user.remove()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})


module.exports = router