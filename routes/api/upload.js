const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Project = require('../../models/Project');
const User = require('../../models/User');
const user = require('../../public/config/default');
const fs = require('fs');


//Set Storage engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, next){
        next(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
});
//Init Upload
const upload = multer({
    storage: storage,
    limits: {fileSize: 1000000}
}).array('project',2);

//Call Upload page
router.get('/', async (req, res) => {
    let teachers = await User.find({role:"teacher"});
    let students = await User.find({role:"student"});
    if(user.logged && user.role != 'admin'){
        let teachers = await User.find({role:"teacher"});
        let students = await User.find({role:"student"});
        console.log(students);
        return res.render('upload.ejs',{msg:'', name:user.name, logged:user.logged, role:user.role, teachers, students});
    }
    else{
        res.render('index.ejs',{logged:user.logged, role:user.role, name:user.name, teachers, students})
    }
});


//Make An Upload
router.post('/', (req, res)=>{
    upload(req, res, async (err) =>{
        if(!err){
            console.log('Success');
            
            //Project Details in Project Obj
            const newUpload = {};
            const {p_title, githubRepo, youtubeLink, desc, published, domain, keywords, mentors, members} = req.body;
            let file1 = req.files[0];
            let teachers = await User.find({role:"teacher"});
            let students = await User.find({role:"student"});
            if(req.files.length >= 2){
                let file2 = req.files[1];
                if(file1.mimetype == 'application/pdf'){
                    newUpload.reportName = file1.filename;
                    newUpload.pptName = file2.filename;
                }else if(file2.mimetype == 'application/pdf'){
                    newUpload.reportName = file2.filename;
                    newUpload.pptName = file1.filename;
                }
                else{
                    
                    fs.unlinkSync(path.join(__dirname,'/../../public/uploads/',file1.filename), (err) => {});
                    fs.unlinkSync(path.join(__dirname,'/../../public/uploads/',file2.filename), (err) => {});
                    return res.render('upload.ejs',{msg: 'Report of .pdf type required', teachers, students, name:user.name,logged:user.logged, role:user.role});
                }
            }else{
                if(file1.mimetype == 'application/pdf'){
                    newUpload.reportName = file1.filename;
                }else{
                    fs.unlinkSync(path.join(__dirname,'/../../public/uploads/',file1.filename), (err) => {});
                    return res.render('upload.ejs',{msg: 'Report of .pdf type required', teachers, students, name:user.name,logged:user.logged, role:user.role})
                }
                
            }


            let student = await User.findOne({username:user.username})
            newUpload.uploader = student._id
            newUpload.title = p_title;
            newUpload.desc = desc;
            newUpload.keywords = keywords.split(',').map(word => word.trim());
            newkeywords = [domain, user.username, user.dept, user.year];
            newUpload.keywords = newUpload.keywords.concat(newkeywords);
            newUpload.published = published;
            newUpload.domain = domain;
            newUpload.githubRepo = githubRepo;
            if(mentors){
                newUpload.mentor = mentors;
            }
            if(members){
                newUpload.team = members;
            } 
            if(youtubeLink){
                if(youtubeLink.includes('https://www.youtube.com/embed/')){
                    newUpload.youtubeLink = youtubeLink;    
                }else{
                    
                    fs.unlinkSync(path.join(__dirname,'/../../public/uploads/',newUpload.reportName), (err) => {});
                    if(newUpload.pptName){
                        fs.unlinkSync(path.join(__dirname,'/../../public/uploads/',toDelete.pptName), (err) => {});
                    };
                    return res.render('upload.ejs',{msg:'Only youtube embed links allowed', teachers, students, name:user.name,logged:user.logged, role:user.role});
                }        
            };

            try {

                let existing = await Project.findOne({title: req.body.p_title, uploader: student._id});
                if(existing){
                    console.log('Updating Record...')
                    updatedEntry = await Project.findOneAndUpdate({_id: existing._id}, newUpload, {new:true});
                    if(newUpload.reportName){
                        fs.unlinkSync(path.join(__dirname,'/../../public/uploads/',existing.reportName), (err) => {});
                    }
                    if(newUpload.pptName && existing.pptName){
                        fs.unlinkSync(path.join(__dirname,'/../../public/uploads/',existing.pptName), (err) => {});
                    };

                }else{
                    console.log('Creating Record...')
                    newEntry = new Project(newUpload);
                    await newEntry.save();    
                }

            } catch (err) {
                console.error(err.message);
            }

            return res.render('upload.ejs',{msg:'Upload Successful', teachers, students, name:user.name, logged:user.logged, role:user.role});
            
        }else{
            return res.render('upload.ejs', {msg:err.message, teachers, students, name:user.name, logged:user.logged, role:user.role})
        }
    });
});




module.exports = router;