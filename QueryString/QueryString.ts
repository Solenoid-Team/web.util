export default class QueryString {
    /**
     * Richiede e interpreta la stringa rappresentativa di una Query-String che inizia con o senza '?' e restituisce un oggetto contenente coppie chiave-valore
     * @param text
    */
    public static parse (text:string) : { [key : string] : string } {
        let messagePrefix:string = "\n\nCannot parse text as QueryString:\n";
        let message:string = messagePrefix;

        if(text === undefined || text === null) {
            message += "\nArgument 'text':";
            message += "\nMust be defined";
            message += "\n\n";

            throw new Error(message);
        }

        if(text.length === 0) {
            return null;
        }

        let parsed:{ [key : string] : string } = {};

        let splitterM:Array<string> = text.split("?");

        let qs:string = (splitterM.length === 2 ? splitterM[1] : splitterM[0]);

        let splitterS:Array<string> = qs.split("&");

        for(let i:number = 0; i < splitterS.length; i++) {
            let splitterKV:Array<string> = splitterS[i].split("=");
            
            if(splitterKV.length === 2 && splitterKV[0].length === 0) {
                return null;
            }

            parsed[splitterKV[0]] = (splitterKV[1] === undefined ? null : splitterKV[1]);
        }

        return parsed;
    }

    /**
     * Trasforma un oggetto formato da coppie chiave-valore in una stringa rappresentativa per le Query-String che inizia senza '?'
     * @param object 
    */
    public static stringify (object:{ [key : string] : string }) : string {
        let messagePrefix:string = "\n\nCannot convert object to string:\n";
        let message:string = messagePrefix;
        
        if(object === undefined || object === null) {
            message += "\nArgument 'object':";
            message += "\nMust be defined";
            message += "\n\n";

            throw new Error(message);
        }

        let key:string = null;

        let a:Array<string> = [];

        for(key in object) {
            a.push(
                (object[key] === null ? key : (key + "=" + object[key]))
            );
        }
        
        return a.join("&");
    }
}