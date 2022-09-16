const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('please enter password.\n For example\nnode mongo.js psswo4d\nIf password contains special characters use % coding please');
  process.exit(1);
}

const password = process.argv[2];
const url = `mongodb+srv://fullstack-ryan:${password}@cluster0.snn0vgc.mongodb.net/phonebook?retryWrites=true&w=majority`;

const personSchema = mongoose.Schema({
  name: String,
  number: String,
});
const Person = mongoose.model('Person', personSchema);

if (process.argv.length === 3) {
  mongoose.connect(url).then(() => Person.find({}).then((result) => {
    if (result.length > 0) {
      console.log('phonebook:');
      result.forEach((note) => {
        console.log(note.name, ' ', note.number);
      });
    } else {
      console.log('phonebook is empty');
    }
    return mongoose.connection.close();
  })).catch((err) => { console.log(err); });
} else if (process.argv.length === 5) {
  mongoose.connect(url).then(() => {
    const person = new Person({ name: process.argv[3], number: process.argv[4] });
    return person.save();
  }).then(() => {
    console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`);
    return mongoose.connection.close();
  }).catch((err) => { console.log(err); });
} else {
  console.log('Please make sure name of person is in quotes if it has two or more words.');
  process.exit(1);
}
