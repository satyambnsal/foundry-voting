import { UltraHonkBackend, splitHonkProof } from '@aztec/bb.js'
import fs from 'fs'
// import circuit from '../circuits/target/circuits.json'
import path from 'path'

const NUMBER_OF_FIELDS_IN_HONK_PROOF = 447
console.log(__dirname)
const readPublicInputs = (proofAsFields: any) => {
  const publicInputs = []
  // Compute the number of public inputs, not accounted  for in the constant NUMBER_OF_FIELDS_IN_PROOF
  const numPublicInputs = proofAsFields.length - NUMBER_OF_FIELDS_IN_HONK_PROOF
  let publicInputsOffset = 3

  for (let i = 0; i < numPublicInputs; i++) {
    publicInputs.push(proofAsFields[publicInputsOffset + i])
  }
  return [numPublicInputs, publicInputs]
}

;(async () => {
  const proofW = fs.readFileSync(path.join(__dirname, '../circuits/target/proof'))
  const proofAsFields = fs.readFileSync(
    path.join(__dirname, '../circuits/target/proof_fields.json')
  )

  // const { proof } = splitHonkProof(new Uint8Array(proofW));
  // console.log("proof:", proof);
  // console.log("publicInputs:", publicInputs);

  // const honk = new UltraHonkBackend(circuit.bytecode);

  // const verified = await honk.verifyProof({ proof, publicInputs: deflattenFields(publicInputs) });

  // console.log("verified:", verified);

  const [numPublicInputs, publicInputs] = readPublicInputs(JSON.parse(proofAsFields.toString()))

  // const numPublicInputs = 1;

  console.log('numPublicInputs:', numPublicInputs)
  // console.log("publicInputs:", publicInputs);

  // Cut the number of public inputs out of the proof string
  let proofStr = proofW.toString('hex')
  // Cut off the serialised buffer size at start
  proofStr = proofStr.substring(8)
  // Get the part before and after the public inputs
  const proofStart = proofStr.slice(0, 64 * 3)
  const proofEnd = proofStr.substring(64 * 3 + 64 * (numPublicInputs as number))
  proofStr = proofStart + proofEnd

  // proofStr = "0x" + proofStr;
  console.log('proofStr:', Buffer.from(proofStr, 'hex').byteLength)

  fs.writeFileSync(
    path.join(__dirname, '../circuits/target/proof-clean'),
    Buffer.from(proofStr, 'hex')
  )
  console.log('Proof written to ../circuits/target/proof-clean')

  fs.writeFileSync(
    path.join(__dirname, '../circuits/target/public-inputs'),
    JSON.stringify(publicInputs)
  )
  console.log('Public inputs written to ../circuits/target/public-inputs')
})()

// taken from @aztec/bb.js/proof
function uint8ArrayToHex(buffer: Uint8Array): string {
  const hex: string[] = []

  buffer.forEach(function (i) {
    let h = i.toString(16)
    if (h.length % 2) {
      h = '0' + h
    }
    hex.push(h)
  })

  return '0x' + hex.join('')
}

export function deflattenFields(flattenedFields: Uint8Array): string[] {
  const publicInputSize = 32
  const chunkedFlattenedPublicInputs: Uint8Array[] = []

  for (let i = 0; i < flattenedFields.length; i += publicInputSize) {
    const publicInput = flattenedFields.slice(i, i + publicInputSize)
    chunkedFlattenedPublicInputs.push(publicInput)
  }

  return chunkedFlattenedPublicInputs.map(uint8ArrayToHex)
}
