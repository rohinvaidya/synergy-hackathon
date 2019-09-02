const express = require('express');
const router = express.Router();
const user = require('../../public/config/default');

router.get('/',(req,res) => {
    user.logged = false;
    user.name = "";
    user.rollNo = "";
    user.dept = "";
    user.year = "";
    user.admin = false;

    try {
        res.render('index.ejs',{logged: user.logged, amdin:user.admin});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;