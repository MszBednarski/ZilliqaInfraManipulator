export declare class Logger {
    private static buffer;
    static log(message?: any, ...optionalParams: any[]): void;
    static flush(path: string): void;
}
