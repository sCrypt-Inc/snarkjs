import * as fastFile from "fastfile";
import ejs from "ejs";

import exportVerificationKey from "./zkey_export_verificationkey.js";
// Not ready yet
// module.exports.generateVerifier_kimleeoh = generateVerifier_kimleeoh;


export default async function exportScryptTSVerifier(zKeyName, templates, logger) {

    const vKey = await exportVerificationKey(zKeyName, logger);
  
    let template = templates[vKey.protocol][vKey.curve];

    return ejs.render(template,  vKey);
}
