const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    
    username:{
        type: String,
        required: true
    },
    token:{
        type: Number
    },
    name:{
        type:String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    dept:{
        type: String,
        required: true
    },
    year:{
        type: String,
    },
    about:{
        type:String
    },
    role:{
        type: String,
        default: 'student',
        required:true
    },
    logged:{
        type: Boolean,
        default: false
    },
    graded:{
        type:[mongoose.Schema.Types.ObjectId],
        ref: 'project'
    }
});

module.exports = User = mongoose.model('user', userSchema);