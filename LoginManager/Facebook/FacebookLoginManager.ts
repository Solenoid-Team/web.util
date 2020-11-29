/*
 Dependencies:
    QueryString.ts
*/

export default class FacebookLoginManager {
    private static URL_PREFIXES:{ [key : string] : string } = {
        "logIn":    "https://www.facebook.com/v9.0/dialog/oauth?response_type=token&state=s",
        "logOut":   "https://www.facebook.com/logout.php?",
        "userInfo": "https://graph.facebook.com/me?fields=email&access_token="
    };

    private settings:{ [key : string] : string } = {};

    /*private static random (
        min:number,
        max:number
    ) : number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }*/

    /**
     * Inizializza una istanza di questa classe e, opzionalmente, da la possibilità di definire un oggetto di impostazioni
     * (settings di coppie chiave-valore)
     * @param settings 
    */
    constructor (settings:{ [key : string] : string } = {}) {
        this.settings = settings;
    }

    /*public static generateState () : string {
        let chars:string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-%$!";

        let min:number = 64;
        let max:number = 128;

        let length:number = FacebookLoginManager.random(
            min,
            max
        );

        let state:string = "";

        for(let i:number = 0; i < length; i++) {
            state += chars.charAt(
                FacebookLoginManager.random(
                    0,
                    chars.length
                )
            );
        }

        return state;
    }*/

    /**
     * Reindirizza alla pagina di Log-In di Facebook
    */
    public logIn () : void {
        let url:string = FacebookLoginManager.URL_PREFIXES.logIn;

        url += QueryString.stringify(this.settings);

        window.location.href = url;
    }

    /**
     * Richiede la stringa del token fornito da Facebook e reindirizza alla pagina di Log-Out di Facebook
    */
    public logOut (token:string) : void {
        let messagePrefix:string = "\n\nCannot log-out:\n";
        let message:string = messagePrefix;

        if(token === undefined || token === null) {
            message += "\nArgument 'token':";
            message += "\nMust be defined";
            message += "\n\n";

            throw new Error(message);
        }

        if(this.settings["redirect_uri"] === undefined || this.settings["redirect_uri"] === null) {
            message += "\nProperty 'redirect_uri':";
            message += "\nMust be defined";
            message += "\n\n";

            throw new Error(message);
        }

        let url:string = FacebookLoginManager.URL_PREFIXES.logOut;

        url += QueryString.stringify({
            "access_token": token,
            "next":         this.settings["redirect_uri"]
        });

        window.location.href = url;
    }

    /**
     * Restituisce la stringa contenente il token fornito da Facebook dopo l'autenticazione oppure un valore null (se il token non esiste)
    */
    public static getToken (/*state:string*/) : string {
        /*let messagePrefix:string = "\n\nCannot get token:\n";
        let message:string = messagePrefix;

        if(state === undefined || state === null) {
            message += "\nArgument 'state':";
            message += "\nMust be defined";
            message += "\n\n";

            throw new Error(message);
        }*/

        let fragment:string = window.location.hash;

        if(fragment.length === 0) {
            return null;
        }

        fragment = fragment.substring(1);

        let parsed = QueryString.parse(fragment);

        /*if(parsed["state"] === undefined || parsed["state"] === null || state !== parsed["state"]) {
            return null;
        }*/

        if(parsed["access_token"] === undefined || parsed["access_token"] === null) {
            return null;
        }

        return parsed["access_token"];
    }

    /**
     * Richiede la stringa del token fornito da Facebook dopo l'autenticazione e restituisce in modo asincrono i dati dell'utente
     * @param token 
    */
    public static async getInfo (token:string) : Promise<any> {
        let message_prefix:string = "\n\nCannot get User-Info:\n";
        let message:string = message_prefix;

        if(token === undefined || token === null) {
            message += "\nArgument 'token':";
            message += "\nMust be defined";
            message += "\n\n";

            throw new Error(message);
        }

        let info:{ [key : string] : any } = {
            "status": null,
            "user":   null
        };
        
        let url:string = FacebookLoginManager.URL_PREFIXES.userInfo;

        //url += token;

        let response:any = await fetch(
            url,
            {
                "method":         "GET",
                "mode":           "cors",
                "cache":          "no-cache",
                "credentials":    "same-origin",
                "headers": {
                    "Content-Type":  "application/json",
                    "Authorization": "Bearer " + token
                },
                "redirect":       "follow",
                "referrerPolicy": "no-referrer"
            }
        );

        if(response.status === 400) {// Token is not valid
            info.status = "OUT";

            return info;
        }

        if(response.status !== 200) {// There is an error
            message += "\nUnable to make this request";
            message += "\n\n";

            throw new Error(message);
        }

        info.status = "IN";

        let parsed:any = await response.json();

        /*info.user = {
            "id":             parsed["id"],
            "email":          parsed["email"],
            "verified_email": parsed["verified_email"],
            "name":           parsed["name"],
            "given_name":     parsed["given_name"],
            "family_name":    parsed["family_name"],
            "picture":        parsed["picture"],
            "gender":         parsed["gender"],
            "locale":         parsed["locale"]
        };*/

        info.user = {
            "email": parsed["email"]
        };

        return info;
    }

    /**
     * Offre la possibilità di effettuare dei test e debug su questa classe
     */
    public static main () : void {
        window.onkeyup = function(e) {
            let key = (e.keyCode ? e.keyCode : e.which);

            if(e.ctrlKey && e.altKey && e.shiftKey && key === 70) {// CTRL + ALT + SHIFT + F
                let settings = {
                    "client_id":    "client_id_of_my_facebook_for_developers",
                    "redirect_uri": "https://www.my-website.com/login"
                };

                let facebookLM = new FacebookLoginManager(settings);

                facebookLM.logIn();
            }
        };

        let token = FacebookLoginManager.getToken();

        if(token !== null) {
            let info = FacebookLoginManager.getInfo(token);

            info.then(function(data) {
                console.debug("\n\n<TEST 'FacebookLoginManager.getInfo'>\n\n");

                console.debug("User-Info:");
                console.debug(data);

                console.debug("\n\n</TEST>\n\n");
            });
        }
    }
}

/*

logIn                                 <=>  Reindirizza alla pagina di log-in di Facebook

logOut                                <=>  Richiede la stringa del token fornito da Facebook e reindirizza alla pagina di log-out di Facebook

getToken                              <=>  Ottiene il token interpretando il fragment della pagina corrente come Query-String:
                                           Viene interpretato il fragment appartenente all'URL che Facebook invia in risposta alla pagina di login
                                    
                                           Questa funzione ritorna
                                             * Una stringa del token se è presente nel fragment dell'URL
                                             * Un valore null se non è presente nel fragment dell'URL

getInfo                               <=>  Richiede un token e restituisce un oggetto contenente lo stato del login e i dati dell'utente prelevati da Facebook
                                           L'oggetto contiene:
                                             * status (stato del login) che può essere:
                                               * IN  => autenticato
                                               * OUT => non autenticato
                                             * user (dati dell'utente)
*/

