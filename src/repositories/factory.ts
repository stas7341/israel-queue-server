import {IRepoCommands, MultipleFieldsArguments, RepoCommandArgument, SingleFieldArguments} from "@asmtechno/iqlib";
import RepoRedis from "../model/redis.model";
import {throws} from "assert";

export const createRepo = (type, instance): IRepoCommands => {
        switch (type) {
                case 'redis':{
                        return new RepoRedis(instance) as IRepoCommands;
                }
                default: {
                        throw new Error(`does not support type ${type}`);
                }
        }
}

