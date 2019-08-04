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
        * [.indexSize(index)](#Redis+indexSize) ⇒ <code>Promise.&lt;(null\|\*)&gt;</code>
        * [.indexExists(index)](#Redis+indexExists) ⇒ <code>Promise.&lt;boolean&gt;</code>
        * [.createIndex(index, schema, [options&#x3D;{
    ttl: false,
    highlighting: true,
    noStopwords: false,
  }])](#Redis+createIndex) ⇒ <code>Promise.&lt;void&gt;</code>
        * [.addToIndex(index, id, document, [options])](#Redis+addToIndex) ⇒ <code>Promise.&lt;\*&gt;</code>
        * [.search(index, query, [options])](#Redis+search) ⇒ <code>Promise.&lt;{total: \*, ids: \*, page: \*}&gt;</code>
        * [.removeFromIndex(index, id)](#Redis+removeFromIndex) ⇒ <code>Promise.&lt;\*&gt;</code>
        * [.deleteIndex(index)](#Redis+deleteIndex) ⇒ <code>Promise.&lt;void&gt;</code>
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

<a name="Redis+indexSize"></a>

### redis.indexSize(index) ⇒ <code>Promise.&lt;(null\|\*)&gt;</code>
Get size of search index

**Kind**: instance method of [<code>Redis</code>](#Redis)  

| Param | Type |
| --- | --- |
| index | <code>string</code> | 

<a name="Redis+indexExists"></a>

### redis.indexExists(index) ⇒ <code>Promise.&lt;boolean&gt;</code>
Check if search index exists

**Kind**: instance method of [<code>Redis</code>](#Redis)  

| Param | Type |
| --- | --- |
| index | <code>string</code> | 

<a name="Redis+createIndex"></a>

### redis.createIndex(index, schema, [options&#x3D;{
    ttl: false,
    highlighting: true,
    noStopwords: false,
  }]) ⇒ <code>Promise.&lt;void&gt;</code>
Create a search index

**Kind**: instance method of [<code>Redis</code>](#Redis)  

| Param | Type |
| --- | --- |
| index | <code>string</code> | 
| schema | <code>object</code> | 
| [options={
    ttl: false,
    highlighting: true,
    noStopwords: false,
  }] | <code>object</code> | 

<a name="Redis+addToIndex"></a>

### redis.addToIndex(index, id, document, [options]) ⇒ <code>Promise.&lt;\*&gt;</code>
Add document to index

**Kind**: instance method of [<code>Redis</code>](#Redis)  

| Param | Type | Default |
| --- | --- | --- |
| index | <code>string</code> |  | 
| id | <code>string</code> |  | 
| document | <code>object</code> |  | 
| [options] | <code>object</code> | <code>{ replace: true, noSave: true }</code> | 

<a name="Redis+search"></a>

### redis.search(index, query, [options]) ⇒ <code>Promise.&lt;{total: \*, ids: \*, page: \*}&gt;</code>
Search index using query

**Kind**: instance method of [<code>Redis</code>](#Redis)  

| Param | Type | Default |
| --- | --- | --- |
| index | <code>string</code> |  | 
| query | <code>string</code> |  | 
| [options] | <code>object</code> | <code>{ idOnly: true, sortBy: null, sortDirection: &#x27;ASC&#x27;, limit: 100, page: 0 }</code> | 

<a name="Redis+removeFromIndex"></a>

### redis.removeFromIndex(index, id) ⇒ <code>Promise.&lt;\*&gt;</code>
Remove document from index

**Kind**: instance method of [<code>Redis</code>](#Redis)  

| Param | Type |
| --- | --- |
| index | <code>string</code> | 
| id | <code>string</code> | 

<a name="Redis+deleteIndex"></a>

### redis.deleteIndex(index) ⇒ <code>Promise.&lt;void&gt;</code>
Delete index

**Kind**: instance method of [<code>Redis</code>](#Redis)  

| Param | Type |
| --- | --- |
| index | <code>string</code> | 

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
    * [new Cached(redis, prefix, ttlSec, [resetOnReconnection])](#new_Cached_new)
    * [.cache.set(key, value, [overrideTtlSec])](#Cached.cache.set) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.cache.get(key)](#Cached.cache.get) ⇒ <code>Promise.&lt;\*&gt;</code>
    * [.cache.del(key)](#Cached.cache.del) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.cache.invalidate()](#Cached.cache.invalidate) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="new_Cached_new"></a>

### new Cached(redis, prefix, ttlSec, [resetOnReconnection])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| redis | [<code>Redis</code>](#Redis) |  |  |
| prefix | <code>string</code> |  |  |
| ttlSec | <code>number</code> |  |  |
| [resetOnReconnection] | <code>boolean</code> | <code>true</code> | clear the cache when a new connection is made |

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
