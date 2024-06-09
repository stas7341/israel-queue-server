import {IRepoCommands, MultipleFieldsArguments, RepoCommandArgument, SingleFieldArguments} from "@asmtechno/iqlib";

class RepoRedis implements IRepoCommands {
        private instance;
        constructor(redis) {
                this.instance = redis;
        }
        async addItem(key: RepoCommandArgument, value: RepoCommandArgument): Promise<boolean> {return this.instance.addItem(key, value)}
        async getItem(key: RepoCommandArgument): Promise<RepoCommandArgument | null> {return this.instance.getItem(key)}
        async deleteItem(key: RepoCommandArgument): Promise<boolean> {return this.instance.deleteItem(key)}
        async searchKeys(pattern: RepoCommandArgument): Promise<RepoCommandArgument[]> {return this.instance.searchKeys(pattern)}
        async isKeyExist(key: RepoCommandArgument): Promise<boolean> {return this.instance.isKeyExist(key)}
        async popItemFromZQ(queueName: string, zpopmin?: boolean): Promise<{ score: number, value: RepoCommandArgument } | null> {
                return this.instance.popItemFromZQ(queueName, zpopmin);
        }
        async getAllItemsFromZQ(queueName: string): Promise<RepoCommandArgument[]> {return this.instance.getAllItemsFromZQ(queueName)}
        async addItemToZQ(queueName: string, item: RepoCommandArgument | RepoCommandArgument[], priority?: number): Promise<boolean> {
                return this.instance.addItemToZQ(queueName, item, priority);
        }
        async removeItemFromZQ(queueName: string, item: RepoCommandArgument): Promise<boolean> {return this.instance.removeItemFromZQ(queueName, item)}
        async getZQLength(queueName: string): Promise<number> {return this.instance.getZQLength(queueName)}
        async setExpiration(item: RepoCommandArgument, ttl: number, mode?: "NX" | "XX" | "GT" | "LT"): Promise<boolean> {
                return this.instance.setExpiration(item, ttl, mode);
        }
        async addFieldsToHash(...[key, value, fieldValue]: SingleFieldArguments | MultipleFieldsArguments): Promise<number> {
                return this.instance.addFieldsToHash(...[key, value, fieldValue]);
        }
        async removeFieldFromHash(key: RepoCommandArgument, field: RepoCommandArgument | Array<RepoCommandArgument>): Promise<number> {
                return this.instance.removeFieldFromHash(key, field);
        }
        async isFieldExistInHash(key: RepoCommandArgument, field: RepoCommandArgument): Promise<boolean> {
                return this.instance.isFieldExistInHash(key,field);
        }
        async getFieldFromHash(key: RepoCommandArgument, field: RepoCommandArgument): Promise<RepoCommandArgument | null> {
                return this.instance.getFieldFromHash(key, field);
        }
        async getFieldsFromHash(key: RepoCommandArgument, fields: RepoCommandArgument | Array<RepoCommandArgument>): Promise<RepoCommandArgument[]> {
                return this.instance.getFieldsFromHash(key, fields);
        }
        async getAllFieldsFromHash(key: RepoCommandArgument): Promise<{ [p: string]: RepoCommandArgument}> {
                return this.instance.getAllFieldsFromHash(key);
        }
        async getFieldNamesFromHash(key: RepoCommandArgument): Promise<RepoCommandArgument[]> {return this.instance.getFieldNamesFromHash(key)}
        async getNumberOfFieldsInHash(key: RepoCommandArgument): Promise<number> {return this.instance.getNumberOfFieldsInHash(key)}
}

export default RepoRedis;
