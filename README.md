# redis

[![CircleCI](https://circleci.com/gh/xtrctio/redis.svg?style=svg)](https://circleci.com/gh/xtrctio/redis)

Redis wrapper

Wrapper for ioredis: https://github.com/luin/ioredis

Also provides Cached class, so you can do this:
```javascript
class Foo extends Cached {
    constructor() {
      super(redis, prefix, ttlSec);
    }

    async setThing(thing, value) {
      await this.cache.set(thing, value);
    }

    async getThing() {
      const result = await this.cache.get('thing');

      if (result) return result;
    }
};
```

## Classes

<dl>
<dt><a href="#Redis">Redis</a></dt>
<dd></dd>
<dt><a href="#Cached">Cached</a></dt>
<dd></dd>
</dl>

<a name="Redis"></a>

## Redis
**Kind**: global class  

* [Redis](#Redis)
    * _instance_
        * [.lock(key, ttl)](#Redis+lock) ⇒ <code>Promise.&lt;(Lock\|null)&gt;</code>
        * [.createRedlock([config])](#Redis+createRedlock) ⇒ <code>Redlock</code>
        * [.scanPromise(...args)](#Redis+scanPromise) ⇒ <code>Promise.&lt;\*&gt;</code>
        * [.debounce(callback, key, timeoutMs, [skewMs])](#Redis+debounce) ⇒ <code>Promise.&lt;void&gt;</code>
    * _static_
        * [.processMultiResults(results)](#Redis.processMultiResults) ⇒ <code>Array.&lt;object&gt;</code>

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

<a name="Redis+debounce"></a>

### redis.debounce(callback, key, timeoutMs, [skewMs]) ⇒ <code>Promise.&lt;void&gt;</code>
Debounce a callback using Redis and setTimeout locally

**Kind**: instance method of [<code>Redis</code>](#Redis)  

| Param | Type | Default |
| --- | --- | --- |
| callback | <code>function</code> |  | 
| key | <code>string</code> |  | 
| timeoutMs | <code>number</code> |  | 
| [skewMs] | <code>number</code> | <code>5</code> | 

<a name="Redis.processMultiResults"></a>

### Redis.processMultiResults(results) ⇒ <code>Array.&lt;object&gt;</code>
Process the returned array from a transaction, throwing errors if any exist

**Kind**: static method of [<code>Redis</code>](#Redis)  

| Param | Type |
| --- | --- |
| results | <code>Array.&lt;object&gt;</code> | 

<a name="Cached"></a>

## Cached
**Kind**: global class  

* [Cached](#Cached)
    * [new Cached(redis, prefix, ttlSec)](#new_Cached_new)
    * [.cache.set(key, value, [overrideTtlSec])](#Cached.cache.set) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.cache.get(key)](#Cached.cache.get) ⇒ <code>Promise.&lt;\*&gt;</code>
    * [.cache.del(key)](#Cached.cache.del) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.cache.invalidate()](#Cached.cache.invalidate) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="new_Cached_new"></a>

### new Cached(redis, prefix, ttlSec)

| Param | Type |
| --- | --- |
| redis | [<code>Redis</code>](#Redis) | 
| prefix | <code>string</code> | 
| ttlSec | <code>number</code> | 

<a name="Cached.cache.set"></a>

### Cached.cache.set(key, value, [overrideTtlSec]) ⇒ <code>Promise.&lt;void&gt;</code>
Set value in cache

**Kind**: static method of [<code>Cached</code>](#Cached)  

| Param | Type |
| --- | --- |
| key | <code>string</code> | 
| value | <code>string</code> | 
| [overrideTtlSec] | <code>number</code> | 

<a name="Cached.cache.get"></a>

### Cached.cache.get(key) ⇒ <code>Promise.&lt;\*&gt;</code>
Get value from cache by key

**Kind**: static method of [<code>Cached</code>](#Cached)  

| Param | Type |
| --- | --- |
| key | <code>string</code> | 

<a name="Cached.cache.del"></a>

### Cached.cache.del(key) ⇒ <code>Promise.&lt;void&gt;</code>
Delete value from cache by key

**Kind**: static method of [<code>Cached</code>](#Cached)  

| Param | Type |
| --- | --- |
| key | <code>string</code> | 

<a name="Cached.cache.invalidate"></a>

### Cached.cache.invalidate() ⇒ <code>Promise.&lt;void&gt;</code>
Invalidate any entries for this cache

**Kind**: static method of [<code>Cached</code>](#Cached)  
