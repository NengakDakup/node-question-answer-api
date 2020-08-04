const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');


// Load Suscribe Model
const Suscribe = require('../../models/Suscribe');


// @route   GET api/suscribe/test
// @desc    Tests Suscribe route
// @access  public
router.get('/test', (req, res) => res.json({msg: 'suscribe Works!'}));

// @route   GET api/suscribe/add
// @desc    Add a Suscriber
// @access  public
router.post('/add', (req, res) => {
    const {email} = req.body;
    if(!email){
        return res.status(400).json({error: 'Invalid email provided'})
    }

    Suscribe.findOne({email: email})
        .then(mail => {
            if(mail) return res.status(400).json({error: 'Email already Suscribed'});

            let mailFields = {};
            mailFields.email = email;
            
            new Suscribe(mailFields)
                .save()
                    .then(suscriber => res.json(suscriber))
        })
})


module.exports = router;