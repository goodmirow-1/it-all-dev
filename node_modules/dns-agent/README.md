#	dns-agent
__DNS agent__

##	Table of contents

*	[Get Started](#get-started)
*	[API](#api)
*	[Why dns-agent](#why-dns-agent)
*	[Honorable Dependents](#honorable-dependents)
*   [About](#about)

##	Links

*	[CHANGE LOG](./CHANGELOG.md)
*	[Homepage](https://github.com/YounGoat/dns-agent)

##	Get Started

```javascript
// The main entrance of package *dns-agent* is a class.
const DnsAgent = require('dns-agent');

// Create an instance.
const agent = new DnsAgent({
    // Time-To-Live of resolved address (in seconds).
    ttl: 86400,

    // Method to execute name resolving.
    // . "system"   means to use dns.lookup / getaddrinfo(3).
    // . "network"  means to perform a DNS query on the network.
    // . <IP>       DNS server to be used.
    // The default value is "system".
    source: 'system'
});

agent.lookup4('localhost', (err, ipv4) => {
    // ...
});
```

##	API

### class DnsAgent

The main entrance of __dns-agent__ is a class (named `DnsAgent` in following code snippets).

*   class __DnsAgent__(object *options*)  
    The only argument may be passed to the constructor is an option object. 
    ```javascript
    const DnsAgent = require('dns-agent');
    const agent = new DnsAgent({ ttl, source });
    ```

    -   __ttl__ *number* DEFAULT `86400` (unit: seconds)  
        Time-To-Live of resolved address.

    -   __source__ *string* DEFAULT `"system"`  
        Acceptable values may be `"system"` | `"network"` | `"<IP_address>"`.  
        
        When __source__ has a value of `"system"`, __dns-agent__ will use `dns.lookup()` to find the responding IP address of hostname. It is actually, according to [Node.js Documentation, DNS](https://nodejs.org/dist/latest-v8.x/docs/api/dns.html#dns_implementation_considerations), implemented as a synchronous call to [getaddrinfo(3)](http://man7.org/linux/man-pages/man3/getaddrinfo.3.html).  
        
        When the value is `"network"`, `dns.resolve()` will be used. That means to *always perform a DNS query on the network*. However, if there is some name resolving result not expired, whether or not it is stored in current instance of __dns-agent__, it will be returned whitout querying the DNS server.

        Else if `"<IP_address>"` set, __dns-agent__ behaves like what it does on `"network"` but using the specified DNS server.

*   Promise | void __agent.lookup4__(string *hostname* [, Function __callback__ ])  
    Resolve the *hostname* into the first found A(IPV4) address. This is a [PoC](https://www.npmjs.com/package/jinang#poc) function that will return an instance of `Promise` if no `callback` passed, or return void and invoke the passed `callback`. 

    -   __hostname__ *string*
    -   __callback__(Error *error*, String *ipv4*) *Function* OPTIONAL

##  Examples

##  Why *dns-agent*

On designing another package [__htp__](https://www.npmjs.com/package/htp), I think it maybe helpful for those developing with __htp__ to be informed how many time an HTTP/HTTPs request spends on each step including (host)name resolving. So, I will try `dns.lookup()` before really launching the request. It works as expected in unit test. However, when hundreds of, even thousands of requests happen in very short time, repeatedly invoking of `dns.lookup()` may lead to unexpected exception. Maybe it is regarded as something like [DoS attack](https://en.wikipedia.org/wiki/Denial-of-service_attack) by system or DNS server. So, I write __dns-agent__ and delegate the actions on dns to it.

##  Honorable Dependents

Of course, [__htp__](https://www.npmjs.com/package/htp) is the first dependent.

##  About

For convenience, this package has following names (alias):
*   [dns-agent](https://www.npmjs.com/package/dns-agent)
*   [dns.agent](https://www.npmjs.com/package/dns.agent)
*   [dnsagent](https://www.npmjs.com/package/dnsagent)