import * as fastFile from "fastfile";
import ejs from "ejs";

import exportVerificationKey from "./zkey_export_verificationkey.js";
//import { bn256MillerPrecalc } from "./bn256-miller-precalc.js";
import { initialize } from "zokrates-js-scrypt";
// Not ready yet
// module.exports.generateVerifier_kimleeoh = generateVerifier_kimleeoh;



export default async function exportScryptVerifier(zKeyName, templates, logger) {

    const vKey = await exportVerificationKey(zKeyName, logger);
    
    if (vKey.curve == "bn128" && vKey.protocol == "groth16") {
        // Precalculate miller(alpha, beta) for sCrypt verifier.
        // We use zokrates-js because the default miller functions results from 
        // ffjavascript aren't compatible with sCrypts verifier.
        const defaultProvider = await initialize();

        let zokratesProvider = defaultProvider.withOptions({ 
          backend: "bellman",
          curve: "bn128",
          scheme: "g16"
        });
        
        let alphastr = BigInt(vKey.vk_alpha_1[0]).toString(16);

        let zeroEl = "0x0000000000000000000000000000000000000000000000000000000000000000";

        let alpha = [
              BigInt(vKey.vk_alpha_1[0]).toString(16),
              BigInt(vKey.vk_alpha_1[1]).toString(16),
            ];
        let beta = [
               BigInt(vKey.vk_beta_2[0][0]).toString(16),
               BigInt(vKey.vk_beta_2[0][1]).toString(16),
               BigInt(vKey.vk_beta_2[1][0]).toString(16),
               BigInt(vKey.vk_beta_2[1][1]).toString(16),
            ];

        let zokrates_vk = {
          scheme: 'g16',
          curve: 'bn128',
          alpha: [
            '0x' + alpha[0].padStart(64, '0'),
            '0x' + alpha[1].padStart(64, '0'),
          ],
          beta: [
            [
              '0x' + beta[0].padStart(64, '0'),
              '0x' + beta[1].padStart(64, '0'),
            ],
            [
              '0x' + beta[2].padStart(64, '0'),
              '0x' + beta[3].padStart(64, '0'),
            ]
          ],
          // The rest doesn't matter for this calculation.
          gamma: [[zeroEl, zeroEl],[zeroEl, zeroEl]],
          delta: [[zeroEl, zeroEl],[zeroEl, zeroEl]],
          gamma_abc: Array(vKey.IC.length).fill([zeroEl, zeroEl])
        }

        let resStr = zokratesProvider.computeMillerBetaAlpha(zokrates_vk);
        
        vKey.vk_miller_alphabeta_12 = resStr;
    }

    let template = templates[vKey.protocol];

    return ejs.render(template,  vKey);
}
