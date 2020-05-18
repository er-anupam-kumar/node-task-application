const express = require('express')
const router  = new express.Router()
const auth    = require('../middlewares/auth')
require('../db/mongoose')

//Import models for database manipulations
const Task = require('../models/task')

router.post('/tasks', auth, async (req,res)=>{
    const task = new Task({
        ...req.body,
        creator:req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }

})

router.get('/tasks', auth, async (req,res)=>{

    const match = {}
    const sort  = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1]==='desc'?-1:1
    }

    try{
        
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        
        res.send(req.user.tasks)
    }catch(e){
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req,res)=>{
    const _id = req.params.id

    try{

        const task = await Task.findOne({_id,creator:req.user._id})
        if(!task){
            res.status(404).send()
        }

        res.send(task)
    }catch(e){
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req,res)=>{

    const updates = Object.keys(req.body)
    const allowedUpdates = ["description","completed"]
    const isValidUpdateOperation = updates.every((update)=>allowedUpdates.includes(update))

    if(!isValidUpdateOperation){
        res.status(400).send()
    }

    try{
        const task = await Task.findOne({_id:req.params.id,creator:req.user._id})
        if(!task)
        {
            res.status(404).send()
        }
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

router.delete('/tasks/:id', auth, async(req,res)=>{

    try{
        const task = await Task.findOneAndDelete({_id:req.params.id,creator:req.user._id})

        if(!task){
            res.status(404).send()
        }

        res.send({
            message : "Task deleted",
            task
        })

    }catch(e){
        res.status(500).send()
    }
})

module.exports = router