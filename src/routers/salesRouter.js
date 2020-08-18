const express = require('express')
const router = new express.Router();
const Sales = require('../models/sales')
const auth = require('../middleware/auth')


router.post('/sales', auth, async(req, res)=>{
    const item = req.user.items.filter(item => {
        return item.product==req.body.item
    });
    let index=-1;
    let found=false
    var value =0
    req.user.items.forEach(item => {
        index++;
        if(item.product==req.body.item){
            found=true
            if(found){
                value=index
            }
            return
        }
    });
    const cost=item[0].unitcost
    req.user.items[value].quantity-=req.body.quantity
    await req.user.save()
    const total = cost * req.body.quantity
    const sale = new Sales({...req.body, owner:req.user._id, unitcost:cost, total})
    try {
        await sale.save()
        res.status(200).send(sale)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/sales', auth, async(req, res)=>{
    try{
        dates={}
        if(req.query.sortBy=='week'){
            dates.currentDate = new Date(Date.now())
            dates.endDate = new Date(Date.now()-604800000)
        }else if(req.query.sortBy=='day'){
            dates.currentDate = new Date(Date.now())
            dates.endDate = new Date(Date.now()-86400000)
        }else{
            dates.currentDate = new Date(Date.now())
            dates.endDate = new Date(Date.now()-43200000)
        }
        const sales=await Sales.find({createdAt:{'$gte':dates.endDate.toISOString(), '$lte':dates.currentDate.toISOString()}, owner:req.user._id})
        res.status(200).send(sales)
    } catch (error) {
        res.status(500).send(error)
    }
    
   
})

router.get('/sales/:items', auth, async(req, res)=>{
    try {
        const sales = await Sales.find({item:req.params.items, owner:req.user._id})
        sales.length==0?res.status(200).send({error:"No such items"}):res.status(200).send(sales)
    } catch (error) {
        res.status(500).send(error)
    }
})


module.exports=router