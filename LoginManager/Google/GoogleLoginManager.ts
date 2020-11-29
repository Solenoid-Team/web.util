/*
 Dependencies:
    QueryString.ts
*/

export default class GoogleLoginManager {
    private static URL_PREFIXES:{ [key : string] : string } = {
        "logIn":    "https://accounts.google.com/o/oauth2/v2/auth?response_type=token&scope=https://www.googleapis.com/auth/userinfo.email&",
        "logOut":   "https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=",
        "userInfo": "https://www.googleapis.com/oauth2/v3/userinfo?access_token="
    };

    private settings:{ [key : string] : string } = {};

    /**
     * Inizializza una istanza di questa classe e, opzionalmente, da la possibilità di definire un oggetto di impostazioni
     * (settings come oggetto di coppie chiave-valore)
     * @param settings 
    */
    constructor (settings:{ [key : string] : string } = {}) {
        this.settings = settings;
    }

    /**
     * Reindirizza alla pagina di Log-In di Google
    */
    public logIn () : void {
        let url:string = GoogleLoginManager.URL_PREFIXES.logIn;
        
        url += QueryString.stringify(this.settings);
        
        window.location.href = url;
    }

    /**
     * Reindirizza alla pagina di Log-Out di Google
    */
    public logOut () : void { //toglie il metodo
        let messagePrefix:string = "\n\nCannot log-out:\n";
        let message:string = messagePrefix;

        if(this.settings["redirect_uri"] === undefined || this.settings["redirect_uri"] === null) {
            message += "\nProperty 'redirect_uri':";
            message += "\nMust be defined";
            message += "\n\n";

            throw new Error(message);
        }

        let url:string = GoogleLoginManager.URL_PREFIXES.logOut;

        url += this.settings["redirect_uri"];

        window.location.href = url;
    }

    /**
     * Restituisce la stringa contenente il token fornito da Google dopo l'autenticazione oppure un valore null (se il token non esiste)
    */
    public static getToken () : string {
        let fragment:string = window.location.hash;

        if(fragment.length === 0) {
            return null;
        }

        fragment = fragment.substring(1);

        let parsed:{ [key : string] : string } = QueryString.parse(fragment);

        if(parsed["access_token"] === undefined || parsed["access_token"] === null) {
            return null;
        }

        return parsed["access_token"];
    }

    /**
     * Richiede la stringa del token fornito da Google dopo l'autenticazione e restituisce in modo asincrono i dati dell'utente
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
        
        let url:string = GoogleLoginManager.URL_PREFIXES.userInfo;

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

        if(response.status === 401) {// Token is not valid
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

            if(e.ctrlKey && e.altKey && e.shiftKey && key === 71) {// CTRL + ALT + SHIFT + G
                let settings = {
                    "client_id":    "client_id_of_my_google_cloud_platform",
                    "redirect_uri": "https://www.my-website.com/login"
                };

                let googleLM = new GoogleLoginManager(settings);

                googleLM.logIn();
            }
        };

        let token = GoogleLoginManager.getToken();

        if(token !== null) {
            let info = GoogleLoginManager.getInfo(token);

            info.then(function(data) {
                console.debug("\n\n<TEST 'GoogleLoginManager.getInfo'>\n\n");

                console.debug("User-Info:");
                console.debug(data);

                console.debug("\n\n</TEST>\n\n");
            });
        }
    }
}

/*

logIn                                 <=>  Reindirizza alla pagina di log-in di Google

logOut                                <=>  Reindirizza alla pagina di log-out di Google

getToken                              <=>  Ottiene il token interpretando il fragment della pagina corrente come Query-String:
                                           Viene interpretato il fragment appartenente all'URL che Google invia in risposta alla pagina di login
                                    
                                           Questa funzione ritorna
                                             * Una stringa del token se è presente nel fragment dell'URL
                                             * Un valore null se non è presente nel fragment dell'URL

getInfo                               <=>  Richiede un token e restituisce un oggetto contenente lo stato del login e i dati dell'utente prelevati da Google
                                           L'oggetto contiene:
                                             * status (stato del login) che può essere:
                                               * IN  => autenticato
                                               * OUT => non autenticato
                                             * user (dati dell'utente)
*/
