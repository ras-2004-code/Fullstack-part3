const morgan=require('morgan')
const express=require('express')
const cors=require('cors')

const app=express()

morgan.token('postlog',(request,response)=>{
    if(request.method==='POST')return JSON.stringify(request.body)
    else return ''
})


app.use(express.json())
app.use(express.static('build'))

app.use(cors())

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postlog'))




const persons=[
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons',(request,response)=>{
    response.json(persons)
})

app.get('/info',(request,response)=>{
    response.send(`<div>Phonebook has info for ${persons.length} people <br/>
    ${new Date()}</div>`)
})

app.get('/api/persons/:id',(request,response)=>{
    const id=Number(request.params.id)
    const person=persons.find(n=>n.id===id)
    if(!person){
        return response.status(404).json({
            error:`no data for id ${id}`
        })
    }
    else{
        response.json(person)
    }
})

app.delete('/api/persons/:id',(request,response)=>{
    const id=Number(request.params.id)
    let index=-1;
    const person=persons.find((n,i)=>{
        if(n.id===id){
            index=i
            return true
        }
        return false
    })
    if(!person){
        return response.status(404).json({
            error:`no data for id ${id}`
        })
    }
    else{
        response.status(204).json(person)
        persons.splice(index,1)
    }
})

const generateId=()=>{
    let id=-1;
    do{
        id=Math.floor(Math.random()*Number.MAX_SAFE_INTEGER)
    }while(persons.find(p=>p.id===id))
    return id
}

app.post('/api/persons',(request,response)=>{
    const body=request.body
    if(!body.name || !body.number){
        response.status(400).json({
            error:'A person needs a name and a number'
        })
    }
    else if(persons.find(p=>p.name.toLowerCase()===body.name.toLowerCase())){
        response.status(400).json({
            error: "name must be unique"
        })
    }
    else{
        const person={
            id:generateId(),
            name:body.name,
            number:body.number
        }
        persons.push(person)
        response.status(201).json(person)
    }
})

const unknownEndPoint=(request,response)=>{
    response.status(404).send({error:'Unknown endpoint'})
}

app.use(unknownEndPoint)

const PORT=process.env.PORT || 3001
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})