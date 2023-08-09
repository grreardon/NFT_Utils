import Redis, { RedisOptions } from "ioredis";

export default class CacheManager {
  public cache: Redis;

  constructor(connectionObject: RedisOptions) {
    this.cache = new Redis(connectionObject);
  } 
}
