var _      = require('lodash'),
    api    = require('../../../api'),
    urlService = require('../../../services/url'),
    validator        = require('validator'),
    BaseMapGenerator = require('./base-generator'),
    // @TODO: figure out a way to get rid of this
    activeStates   = ['active', 'warn-1', 'warn-2', 'warn-3', 'warn-4', 'locked'];

// A class responsible for generating a sitemap from posts and keeping it updated
function UserMapGenerator(opts) {
    _.extend(this, opts);

    BaseMapGenerator.apply(this, arguments);
}

// Inherit from the base generator class
_.extend(UserMapGenerator.prototype, BaseMapGenerator.prototype);

_.extend(UserMapGenerator.prototype, {
    bindEvents: function () {
        var self = this;
        this.dataEvents.on('user.activated', self.addOrUpdateUrl.bind(self));
        this.dataEvents.on('user.activated.edited', self.addOrUpdateUrl.bind(self));
        this.dataEvents.on('user.deactivated', self.removeUrl.bind(self));
    },

    getData: function () {
        return api.users.browse({
            context: {
                internal: true
            },
            filter: 'visibility:public',
            status: 'active',
            limit: 'all'
        }).then(function (resp) {
            return resp.users;
        });
    },

    validateDatum: function (datum) {
        return datum.visibility === 'public' && _.includes(activeStates, datum.status);
    },

    getUrlForDatum: function (user) {
        return urlService.utils.urlFor('author', {author: user}, true);
    },

    getPriorityForDatum: function () {
        // TODO: We could influence this with meta information
        return 0.6;
    },

    validateImageUrl: function (imageUrl) {
        return imageUrl && validator.isURL(imageUrl, {protocols: ['http', 'https'], require_protocol: true});
    }
});

module.exports = UserMapGenerator;
