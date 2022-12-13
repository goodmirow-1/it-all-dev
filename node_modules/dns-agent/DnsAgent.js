'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    , dns = require('dns')
    
    /* NPM */
    , cloneObject = require('jinang/cloneObject')
    , parseOptions = require('jinang/parseOptions')
    , PoC = require('jinang/PoC')
    
    /* in-package */
    , DnsCache = require('./class/DnsCache')
    ;

/**
 * @param  {object}  options
 * @param  {number} [options.ttl]    Time-To-Live of resolved records (unit: seconds)
 * @param  {string} [options.source] "system" | "network" | <IP>  
 *                                   See READ MORE for more details.
 * 
 * -- READ MORE --
 * https://nodejs.org/dist/latest-v8.x/docs/api/dns.html#dns_implementation_considerations 
 */
const DnsAgentOptions = {
    caseSensitive: false,
    explicit: true,
    columns: [
        'ttl DEFAULT(60)', /* in seconds, default 1 minite */
        'source DEFAULT("system")',
    ]
};
function DnsAgent(options) {
    this.options = parseOptions(options, DnsAgentOptions);
    this.cache = new DnsCache( cloneObject(this.options, ['ttl']) );
    this.pending = {};
}

DnsAgent.prototype.lookup4 = function(hostname, callback) {
    return PoC((done) => {
        // ---------------------------
        // Try cache.

        for (let ipv4 = this.cache.get(hostname); ipv4; ) {
            done(null, ipv4);
            return;
        }

        // ---------------------------
        // Try pending.

        if (this.pending[hostname]) {
            this.pending[hostname].push(done);
            return;
        }

        // ---------------------------
        // Try dns.

        this.pending[hostname] = [ done ];

        let callback2 = (err, ipv4, ttl) => {
            if (!err) {
                this.cache.put(hostname, ipv4, ttl);
            }
            this.pending[hostname].forEach(done => done(err, ipv4));
            delete this.pending[hostname];
        };

        if (this.options.source == 'system') {
            dns.lookup(hostname, 4, (err, address, family /* always 4 on success */) => {
                callback2(err, address, this.options.ttl);
            });
        }
        else if (this.options.source == 'network') {
            dns.resolve4(hostname, { ttl: this.options.ttl }, (err, addresses) => {
                err ? callback2(err) : callback2(err, addresses[0].address, addresses[0].ttl);
            });
        }
        else {
            if (dns.Resolver) {
                let resolver = new dns.Resolver();
                resolver.setServers([ this.options.source ]);
                resolver.resolve4(hostname, { ttl: this.options.ttl }, (err, addresses) => {
                    err ? callback2(err) : callback2(err, addresses[0].address, addresses[0].ttl);
                });
            }
            else {
                let servers = dns.getServers();
                dns.setServers([ this.options.source ]);
                dns.resolve4(hostname, { ttl: this.options.ttl }, (err, addresses) => {
                    // Reset the DNS servers.
                    setTimeout(() => {
                        dns.setServers(servers);
                        err ? callback2(err) : callback2(err, addresses[0].address, addresses[0].ttl);
                    });
                });
            }
        }
    }, callback);    
};

module.exports = DnsAgent;