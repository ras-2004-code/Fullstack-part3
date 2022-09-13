require('dotenv').config()

const mongoose=require('mongoose')

mongoose.connect(process.env.MONGODB_URI).catch(err=>{
    console.log('Couldnt connect to URL: ', err.message)
})

const personSchema=mongoose.Schema({
    name:String,
    name_lower:String,
    number:String
})

personSchema.set('toJSON',{
    transform: (document,returnedObject)=>{
        returnedObject.id=returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.name_lower
    }
})

module.exports=mongoose.model('Person',personSchema)
