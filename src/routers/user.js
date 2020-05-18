const express = require('express')
const router  = new express.Router()
const auth    = require('../middlewares/auth')
const multer  = require('multer')
const sharp   = require('sharp')
const { sendWelcomeEmail, sendByeByeEmail } = require('../email/account')

require('../db/mongoose')

//Import models for database manipulations
const User = require('../models/user')

router.post('/users', async (req,res)=>{
    const user = new User(req.body)

    try{
        await user.save()
        await sendWelcomeEmail(user.email,user.name)
        const token = await user.getAuthToken()
        res.status(201).send({user,token})
    }catch(e){
        res.status(400).send()
    }

})

router.post('/users/login', async (req,res)=>{

    try{
        const user = await User.findUserByCredentials(req.body.email,req.body.password)
        const token = await user.getAuthToken()
        res.send({user,token})
    }catch(e){
        res.status(404).send(e.message)
    }

})

router.post('/users/logout',auth, async (req,res)=>{

    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })

        await req.user.save()
        res.send()

    }catch{
        res.status(500).send()
    }

})

router.post('/users/logout-all', auth, async (req,res) =>{

    try{

        req.user.tokens = []

        await req.user.save()
        req.send()

    }catch(e){
        res.status(500).send()
    }

})

router.get('/users/me', auth, async (req,res)=>{
    res.send(req.user)
})

router.patch('/users/me', auth, async (req ,res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ["name","email","password","age"]
    const isValidUpdateOperation = updates.every((update)=>allowedUpdates.includes(update))

    if(!isValidUpdateOperation)
    {
        return res.status(400).send()
    }

    try {
        const user = req.user
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()        
        res.send(user)
    }
    catch(e) {
        res.send(e)
    }
})

router.delete('/users/me', auth, async (req,res)=>{

    try{
        await req.user.remove()
        await sendByeByeEmail(req.user.email,req.user.name) 
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
})


const upload  = multer({
    // dest:'avatars',
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(png|jpg|jpeg)$/)){
            return cb(new Error('Please upload a valid image file.'))
        }
        cb(undefined,true)
    }
})

router.post('/users/me/avatar',auth ,upload.single('avatar'), async (req, res)=>{

    const buffer    = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer() 
    req.user.avatar = buffer
    await  req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar',auth, async(req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router