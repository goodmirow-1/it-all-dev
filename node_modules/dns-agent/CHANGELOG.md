#   dns-agent Change Log

Notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning 2.0.0](http://semver.org/).

##  [0.1.1] - Apr 24th, 2018

*   Dependencies upgraded to fix bugs.

##  [0.1.0] - Mar 18th, 2018 - RISKY

*   __The performance on cocurrency lookups for same domain name is significantly improved.__  
    In previous version, every `DnsAgent.lookup4("example.com")` invocation before the resolving result on *example.com* has been cached successfully will really trigger an invocation of `dns.lookup()` or `dns.resolve()`. Now, only the first one will trigger such an invocation, while the following ones will be pended and waiting to share the result.

*   The default ttl is downgraded to 60 seconds (1 minute) from 86400 seconds (24 hours).

##  [0.0.2] - Dec 14, 2017

*   Fixed the bug that the option *ttl* does not work. This bug makes __dns_agent__ to re-resolve the hostname whether or not it is expired.

##	[0.0.1] - Dec 7, 2017

Released.

---
This CHANGELOG.md follows [*Keep a CHANGELOG*](http://keepachangelog.com/).
