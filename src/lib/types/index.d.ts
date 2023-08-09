import { ColorResolvable, Snowflake} from "discord.js"
import { RedisOptions} from "ioredis"
import { MongoClientOptions } from "mongodb"

interface guildSettings {
    _id: Snowflake
    collection_slug?: string,
    salesChannel?: string,
    disabled?: boolean,
    hex?: ColorResolvable
  }

  interface connectionObject {
    uri: string;
    mongoData: MongoClientOptions;
    redisData: RedisOptions;
  }