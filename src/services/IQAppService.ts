import EventEmitter from "events";
import {Logger, LogLevel} from "@asmtechno/service-lib";
import {IQManager} from "@asmtechno/iqlib";

const log = (msg: string, level: LogLevel = LogLevel.info, metadata:any = undefined) =>
    IQAppService.getInstance().log(msg, level, metadata);

export interface IQAppServiceConfig {
    iqMngInstance: IQManager
}

export class IQAppService extends EventEmitter {
    private config = <IQAppServiceConfig>{};
    private static instance: any;
    private isInitialized: boolean;

    protected constructor() {
        super();
        IQAppService.instance = this;
        this.isInitialized = false;
    }

    static getInstance(): IQAppService {
        if (!this.instance)
            this.instance = new IQAppService();
        return <IQAppService>this.instance;
    }


    log(msg: string, level: LogLevel = LogLevel.info, metadata?: any) {
        this.emit("log", msg, level, metadata);
    }

    isInit = () => this.isInitialized;

    async init(config: IQAppServiceConfig): Promise<boolean> {
        try {
            this.config = config;

            config.iqMngInstance.on("log", (...args: any[]) => {
                const [message, logLevel, metadata] = args;
                log(message, logLevel, metadata);
            });

            config.iqMngInstance.on('queued', (...args: any[]) => {
                const [metadata] = args;
                log('queued', LogLevel.trace, metadata);
            });

            this.isInitialized = true;
            return true;
        } catch (err: any) {
            log(err.message, LogLevel.error, err);
            return false;
        }
    }

    public async getActiveQueues(req) {
        return "OK";
    }
}
