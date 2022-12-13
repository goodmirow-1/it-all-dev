'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    
    /* NPM */
    , parseOptions = require('jinang/parseOptions')
    
    /* in-package */
    ;

/**
 * DNS cache manager.
 * @param  {object}  options
 * @param  {number} [options.ttl]    Time-To-Live (unit: seconds)
 * 
 */
const DnsCacheOptions = {
    caseSensitive: false,
    explicit: true,
    columns: [
        'ttl DEFAULT(60)', /* in seconds, default 1 minite */
    ]
};
function DnsCache(options) {
    this.options = parseOptions(options, DnsCacheOptions);
    this.caches = {};
}

/**
 * @param  {string} hostname
 */
DnsCache.prototype.get = function(hostname) {
    let cache = this.caches[hostname];
    if (cache && cache.expires < Date.now()) {
        cache = null;
    }
    return cache ? cache.info : null;
};

/**
 * @param  {string}  hostname
 * @param  {object}  info
 * @param  {object} [options]
 */
DnsCache.prototype.put = function(hostname, info, options) {
    if (typeof options == 'number') {
        options = { ttl: options };
    }
    else if (!options) {
        options = {};
    }

    let ttl = options.ttl ? options.ttl : this.options.ttl;
    let expires = Date.now() + ttl * 1000;
    
    delete this.caches[hostname];
    this.caches[hostname] = { info, expires };
};

module.exports = DnsCache;