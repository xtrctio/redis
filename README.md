# redis

[![CircleCI](https://circleci.com/gh/xtrctio/redis.svg?style=svg)](https://circleci.com/gh/xtrctio/redis)

Redis wrapper

Wrapper for ioredis: https://github.com/luin/ioredis

<a name="Redis"></a>

## Redis
**Kind**: global class  

* [Redis](#Redis)
    * [new Redis(config)](#new_Redis_new)
    * _instance_
        * [.lock(key, ttl)](#Redis+lock) ⇒ <code>Promise.&lt;(Lock\|null)&gt;</code>
        * [.createRedlock([config])](#Redis+createRedlock) ⇒ <code>Redlock</code>
        * [.scanPromise(...args)](#Redis+scanPromise) ⇒ <code>Promise.&lt;\*&gt;</code>
    * _static_
        * [.processMultiResults(results)](#Redis.processMultiResults) ⇒ <code>Array.&lt;object&gt;</code>

<a name="new_Redis_new"></a>

### new Redis(config)

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | ioredis config |

<a name="Redis+lock"></a>

### redis.lock(key, ttl) ⇒ <code>Promise.&lt;(Lock\|null)&gt;</code>
Acquire lock in Redis

**Kind**: instance method of [<code>Redis</code>](#Redis)  

| Param | Type |
| --- | --- |
| key | <code>string</code> | 
| ttl | <code>number</code> | 

<a name="Redis+createRedlock"></a>

### redis.createRedlock([config]) ⇒ <code>Redlock</code>
Get redlock instance

**Kind**: instance method of [<code>Redis</code>](#Redis)  
**Link**: https://www.npmjs.com/package/redlock  

| Param | Type | Default |
| --- | --- | --- |
| [config] | <code>object</code> | <code>{ retryCount: 5 }</code> | 

<a name="Redis+scanPromise"></a>

### redis.scanPromise(...args) ⇒ <code>Promise.&lt;\*&gt;</code>
Wrapper for scanStream that returns a promise

**Kind**: instance method of [<code>Redis</code>](#Redis)  

| Param | Type |
| --- | --- |
| ...args | <code>\*</code> | 

<a name="Redis.processMultiResults"></a>

### Redis.processMultiResults(results) ⇒ <code>Array.&lt;object&gt;</code>
Process the returned array from a transaction, throwing errors if any exist

**Kind**: static method of [<code>Redis</code>](#Redis)  

| Param | Type |
| --- | --- |
| results | <code>Array.&lt;object&gt;</code> | 

