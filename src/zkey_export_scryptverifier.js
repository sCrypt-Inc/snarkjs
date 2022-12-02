import * as fastFile from "fastfile";
import ejs from "ejs";

import exportVerificationKey from "./zkey_export_verificationkey.js";
// Not ready yet
// module.exports.generateVerifier_kimleeoh = generateVerifier_kimleeoh;



export default async function exportScryptVerifier(zKeyName, templates, logger) {

    const verificationKey = await exportVerificationKey(zKeyName, logger);
    
    let template;
    if (verificationKey.protocol == "groth16") {
        if (verificationKey.curve == "bn128") {
            template = templates[verificationKey.protocol];
        } else if (verificationKey.curve == "bls12381") {
            template = templates[verificationKey.curve];
        } else {
            throw new Error("unkown curve");
        }
    } else if (verificationKey.protocol == "plonk") {
        template = templates[verificationKey.protocol];
    }

    return ejs.render(template,  verificationKey);
}
