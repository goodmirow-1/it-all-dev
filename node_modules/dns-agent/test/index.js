'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    , assert = require('assert')

    /* NPM */

    /* in-package */
    , DnsAgent = require('../DnsAgent')
    ;

describe('DnsAgent', () => {
    it('lookup4', (done) => {
        let agent = new DnsAgent({ ttl: 10 });
        agent.lookup4('localhost', (err, ipv4) => {
            if (err) throw err;
            assert.equal(ipv4, '127.0.0.1');
            done();
        });
    });

    it('lookup4 IP', (done) => {
        let agent = new DnsAgent({ ttl: 10 });
        agent.lookup4('127.0.0.1', (err, ipv4) => {
            if (err) throw err;
            assert.equal(ipv4, '127.0.0.1');
            done();
        });
    });

    it('resolve via network', (done) => {
        let agent = new DnsAgent({ ttl: 10, source: 'network' });
        agent.lookup4('youngoat.github.io', (err, ipv4) => {
            if (err) throw err;
            assert(ipv4);
            done();
        });
    });
    
    it('use customised server', (done) => {
        let agent = new DnsAgent({ ttl: 10, source: '8.8.8.8' });
        agent.lookup4('youngoat.github.io', (err, ipv4) => {
            if (err) throw err;
            assert(ipv4);
            done();
        });
    });

    it('ttl', (done) => {
        let t1 = Date.now(), times = 0;
        let agent = new DnsAgent({ ttl: 1000, source: '8.8.8.8' });
        let run = () => {
            agent.lookup4('youngoat.github.io', (err, ipv4) => {
                if (times++ < 100) {
                    run();
                }
                else {
                    let t2 = Date.now();
                    // 解析结果仍在生命周期内，应即时返回。
                    assert(t2 - t1 < 1000);
                    done();
                }
            });
        };
        run();
    });
});