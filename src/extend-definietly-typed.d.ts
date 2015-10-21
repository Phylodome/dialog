
declare module angular {

    interface IPromise<T> {
        then(Function): IPromise<any>;
        then(success:Function, Function): IPromise<any>;
        then(success:Function, error:Function, Function): IPromise<any>;
        catch(Function): IPromise<any>;
        finally(Function): IPromise<any>;
    }

    interface IAttributes {
        $normalize(name:string): string;
    }

}

interface Date {
    toGMTString(...args: any[]): any;
}

interface Console {
    group(groupTitle?: string, ...optionalParams: any[]): void;
    groupCollapsed(groupTitle?: string, ...optionalParams: any[]): void;
}

interface JQuery {
    off(event: string, handler: (e: Event) => void): JQuery;
    on(event: string, handler: (e: Event) => void): JQuery;
    data<T>(key: string): T;
}