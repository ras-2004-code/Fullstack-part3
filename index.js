const morgan=require('morgan')
require('dotenv').config()
const express=require('express')
const cors=require('cors')
const Person=require('./models/person')
const { request } = require('express')

const app=express()

morgan.token('postlog',(request,response)=>{
    if(request.method==='POST')return JSON.stringify(request.body)
    else return ''
})


app.use(express.json())
app.use(express.static('build'))

app.use(cors())

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postlog'))



app.get('/api/persons',(request,response)=>{
    Person.find({}).then(persons=>{
        response.json(persons)
    }).catch(err=>{
        console.log('Error ',err.message)
        response.status(400).json({error:err.message})
    })
})

app.get('/info',(request,response)=>{
    Person.countDocuments({}).then(count=>{
        response.send(`<div>Phonebook has info for ${count} people <br/>
        ${new Date()}</div>`)
    }).catch(err=>{
        response.status(400).json({error:err.message})
    })
})

app.get('/api/persons/:id',(request,response)=>{
    Person.findById(request.params.id).then(person=>{
        if(person)response.json(person)
        else response.status(404).end()
    }).catch(err=>{
        response.status(400).json({error:err.message})
    })
})

app.delete('/api/persons/:id',(request,response)=>{
    Person.findByIdAndDelete(request.params.id).then(delPerson=>{
        if(delPerson){
            response.status(204).json(delPerson)
        }
        else response.status(404).end()
    })
})

app.post('/api/persons',(request,response)=>{
    const body=request.body
    if(!body.name || !body.number){
        response.status(400).json({
            error:'A person needs a name and a number',
        })
    }
    Person.findOne({name_lower:body.name.toLowerCase()}).then(person=>{
        if(person)
            response.status(400).json({
                error:`An entry with name ${body.name} already exists id: ${person._id}`,
                id:person._id.toString()
            })
        else{
            const newPerson=new Person({
                name:body.name,
                name_lower:body.name.toLowerCase(),
                number:body.number
            })
            return newPerson.save()
        }
    }).then(savedPerson=>{
        if(savedPerson) response.status(201).json(savedPerson)
    }).catch(err=>{
        response.status(400).json({error:err.message+" hello"})
    })
})

app.put('api/persons/:id',(request,response)=>{
    const body=request.body
    if(!request.name && !request.number){
        return response.status(400).json({error:"Need a new name or number."})
    }
    Person.findById(request.params.id).then(person=>{

    })
})

const unknownEndPoint=(request,response)=>{
    response.status(404).send({error:'Unknown endpoint'})
}

app.use(unknownEndPoint)

const PORT=process.env.PORT || 3001
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})