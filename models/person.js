require('dotenv').config()

const mongoose=require('mongoose')

mongoose.connect(process.env.MONGODB_URI).catch(err=>{
    console.log('Couldnt connect to URL: ', err.message)
})

const personSchema=mongoose.Schema({
    name:{
        type:String,
        minLength:3,
        required:true
    },
    number:{
        type:String,
        minLength:8,
        validate:{
            validator:num=> /^\d+$/.test(num) || /^\d{2,3}-\d+$/.test(num),
            message:props=>`${props.value} is not a valid number.`
        }
    }
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
