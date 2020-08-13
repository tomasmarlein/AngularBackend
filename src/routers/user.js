const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')
const jwt = require('jsonwebtoken')

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const router = express.Router()

router.get('/users', (req, res, next) => {
    try {
        User.find().exec((err, users) => {
            res.json(users);
        });
    } catch (error) {
        res.status(400).send(error)
    }
});

router.get('/user/:email', function (req, res) {
    try {
        User.find({email: { $regex: '.*' + req.params.email + '.*', $options: 'i' } }).exec((err, users) => {
            res.json(users);
        });
    } catch (error) {
        res.status(400).send(error)
    }
});


router.post('/register', async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/user/login', async(req, res) => {
    //Login a registered user
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }

})

router.post('/sendmail', async (req, res) => {
    // Create a new user
    try {
        // const user = new User(req.body)
        const msg = {
            to: req.body.email,
            from: "support@pollmaster.be",
            templateId: 'd-8f1cd5f9702b4533903f9342b0d4cef4',
            subject: 'Join your Friend on PollMaster',
            dynamic_template_data: {
                email: req.body.email,
                subject: 'Join your Friend on PollMaster',
                link: "https://www.ajaxshowtime.com",
            },
        };
        sgMail.send(msg);
        // await user.save()

        res.status(201).send("mail send");
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/friendrequest/:token', async (req, res) => {
    // Get friendrequest
    const decode = jwt.decode(req.params.token, {complete: true});
    const senderId = decode.payload._id;
    var userids = [];
    try {
        User.find({_id: senderId }).select('requestReceived').exec((err, requests) => {
            for (x in requests[0].requestReceived) {
                userids.push(requests[0].requestReceived[x].userId);
            }
            User.find({_id : userids}).exec((err, users) => {
                res.json(users);
            });
        });
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/friends/:token', async (req, res) => {
    // Get friendrequest
    const decode = jwt.decode(req.params.token, {complete: true});
    const senderId = decode.payload._id;
    var userids = [];
    try {
        User.find({_id: senderId }).select('friends').exec((err, requests) => {
            for (x in requests[0].friends) {
                userids.push(requests[0].friends[x].userId);
            }
            User.find({_id : userids}).exec((err, users) => {
                res.json(users);
            });
        });
    } catch (error) {
        res.status(400).send(error)
    }
})

router.put('/friend', async (req, res) => {
    // Create a new friendship
    const decode = jwt.decode(req.body.sender, {complete: true});
    const sender = decode.payload._id;
    const receiver = req.body.receiver;
    try {User.findAn
        User.findOneAndUpdate({_id: sender }, {$push: {requestSend: { "userId" :receiver}}}).exec((err, user) => {
        });
        User.findOneAndUpdate({_id: receiver }, {$push: {requestReceived: { "userId" :sender}}}).exec((err, user) => {
        });
        res.status(201).send("Friend request");
    } catch (error) {
        res.status(400).send(error)
    }
})


router.put('/friendaccepted', async (req, res) => {
    // Create a new friendship
    const decode = jwt.decode(req.body.sender, {complete: true});
    const receiver = decode.payload._id;
    const sender = req.body.receiver;
    try {
        User.findOneAndUpdate({_id: sender }, {$push:{friends: { "userId" :receiver}}}).exec((err, user) => {
        });
        User.findOneAndUpdate({_id: receiver }, {$push: {friends: { "userId" :sender}}}).exec((err, user) => {
        });
        User.findOneAndUpdate({_id: receiver }, {$pull:{requestReceived: { "userId" :sender}}}).exec((err, user) => {
        });
        User.findOneAndUpdate({_id: sender }, {$pull:{requestSend: { "userId" :receiver}}}).exec((err, user) => {
        });
        res.status(201).send("Friends");
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/user/me', auth, async(req, res) => {
    // View logged in user profile
    res.send(req.user)
})

module.exports = router