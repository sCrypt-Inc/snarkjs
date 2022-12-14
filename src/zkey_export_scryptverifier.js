import * as fastFile from "fastfile";
import ejs from "ejs";

import exportVerificationKey from "./zkey_export_verificationkey.js";
import { bn256MillerPrecalc } from "./bn256-miller-precalc.js";
// Not ready yet
// module.exports.generateVerifier_kimleeoh = generateVerifier_kimleeoh;



export default async function exportScryptVerifier(zKeyName, templates, logger) {

    const verificationKey = await exportVerificationKey(zKeyName, logger);
    
    if (verificationKey.curve == "bn128" && verificationKey.protocol == "groth16") {
        // Precalculate miller(alpha, beta) for sCrypt verifier.
        // TODO: This is currently using transpiled Golang code because I 
        //       couldn't get ffjavascripts miller function to return the 
        //       correct values we need.
        //       This should be replaced by more optimal code.
        
        let alpha = [
              vKey.vk_alpha_1[0],
              vKey.vk_alpha_1[1],
            ];
        let beta = [
               vKey.vk_beta_2[0][0],
               vKey.vk_beta_2[0][1],
               vKey.vk_beta_2[1][0],
               vKey.vk_beta_2[1][1],
            ];
        const millerAlphaBeta = bn256MillerPrecalc(alpha, beta);
        
        verificationKey.vk_miller_alphabeta_12 = [[
                [
                 millerAlphaBeta[0],
                 millerAlphaBeta[1],
                ],
                [
                 millerAlphaBeta[2],
                 millerAlphaBeta[3],
                ],
                [
                 millerAlphaBeta[4],
                 millerAlphaBeta[5],
                ]
               ],
               [
                [
                 millerAlphaBeta[6],
                 millerAlphaBeta[7],
                ],
                [
                 millerAlphaBeta[8],
                 millerAlphaBeta[9],
                ],
                [
                 millerAlphaBeta[10],
                 millerAlphaBeta[11],
                ]
               ]
            ];
    }

    let template = templates[verificationKey.protocol];

    return ejs.render(template,  verificationKey);
}
