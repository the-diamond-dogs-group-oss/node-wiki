var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Page = new Schema({
    title : { type : String, required : true},
    content : { type : String, required : true },
    path : { type : String, required : true},
    tags : [String],

    lastModified : Date,
    created : Date
});

Page.pre('save', function(next) {
    if (!this.created) {
        this.created = new Date();
    }

    this.lastModified = new Date();

    next();
});

Page.path('tags').set(function(tags) {
    return tags.split(',').map(function(tag) { return tag.trim(); });
});

// Pre-defined Queries
Page.statics.all = function(cb) {
    return this
        .find({})
        .select('title path')
        .sort('title')
        .exec(cb);
}

Page.statics.latest = function(count, cb) {
    return this
        .find({})
        .limit(count)
        .sort('-created')
        .select('title path')
        .exec(cb);
}

Page.statics.recentChanges = function(count, cb) {
    return this
        .find({})
        .limit(count)
        .sort('-lastModified')
        .select('title path')
        .exec(cb);
}

Page.statics.search = function(query, count, cb) {
    if (typeof(count) == 'function') {
        cb = count;
        count = 100;
    }

    return this
        .find({ $or : [ { title : { $regex : query }}, { content:  { $regex : query }} ]})
        .limit(count)
        .sort('title')
        .select('title path')
        .exec(cb);
}

module.exports = mongoose.model('Page', Page);
