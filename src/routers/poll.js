const express = require('express')
const Poll = require('../models/Poll')
const jwt = require('jsonwebtoken')
const router = express.Router()

router.get('/polls/:token', (req, res, next) => {
    try {
        UserId = jwt.decode(req.params.token, {complete: true});
        
        Poll.find({userId: UserId.payload._id}).exec((err, polls) => {
            res.json(polls);
        });
    } catch (error) {
        res.status(400).send(error)
    }
});

router.put('/vote', (req, res, next) => {
    try {
        UserId = jwt.decode(req.body.id, {complete: true});

        Poll.update({'choices._id': req.body.value}, {$push: {'choices.$.voted' : { "votedUserId": UserId.payload._id }}}).exec((err, polls) => {
            res.json(polls);
        });
    } catch (error) {
        res.status(400).send(error)
    }
});

router.put('/invite', (req, res, next) => {
    try {
        Poll.update({_id: req.body.value}, {$push: {invited : { "idInvitedUser": req.body.id , "userVoted": false}}}).exec((err, polls) => {
            res.json(polls);
        });
    } catch (error) {
        res.status(400).send(error)
    }
});

router.get('/checkVoted', (req, res, next) => {
    try {
        UserId = jwt.decode(req.body.id, {complete: true});
        var test = "";
        // 'choices.$.voted' : { "votedUserId": UserId.payload._id }
        Poll.find({_id: req.body.value}).select('choices').exec((err, count) => {
            if(count.includes(UserId.payload._id)){
                res.json(count);
            }else{
                res.send("fout");
            }

        });
    } catch (error) {
        res.status(400).send(error)
    }
});


router.get('/pollfriends/:token', (req, res, next) => {
    try {
        UserId = jwt.decode(req.params.token, {complete: true});
        
        Poll.find({"invited.idInvitedUser": UserId.payload._id}).exec((err, polls) => {
            res.json(polls);
        });
    } catch (error) {
        res.status(400).send(error)
    }
});

router.post('/poll', async (req, res) => {
    // Create a new poll
    try {
        UserId = jwt.decode(req.body.userId, {complete: true});
        req.body.userId = UserId.payload._id;
        const poll = new Poll(req.body)
        await poll.save()
        res.status(201).send({ poll, userId })
    } catch (error) {
        res.status(400).send(error)
    }
})



router.delete('/poll/:id', function (req, res) {
    Poll.findByIdAndRemove(req.params.id, function(err, deletedPoll) {
        if(err){
            res.send("Error deleting video");
        }else {
            res.json(deletedPoll);
        }
    });

});

module.exports = router