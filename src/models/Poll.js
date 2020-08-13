var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pollSchema = new Schema({
    topic: String,
    userId: String,
    choices: [
            {
                value: String,
                voted: [{
                    votedUserId: String
                    }
                ]
            }
        ],
    invited: [{
        idInvitedUser: String,
        userVoted: Boolean
    }]
});

module.exports = mongoose.model('Poll', pollSchema);