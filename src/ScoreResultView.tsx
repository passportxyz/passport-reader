import React, { useState } from 'react'
import type { ModelTypeAliases } from '@glazed/types'
import { usePublicRecord } from '@self.id/framework'
import { useEffect } from 'react'

import { CeramicClient } from '@ceramicnetwork/http-client'
import { Caip10Link } from '@ceramicnetwork/stream-caip10-link'

type VerifiableCredential = {
  '@context': string[]
  type: string[]
  credentialSubject: {
    id: string
    '@context': { [key: string]: string }[]
    root?: string
    address?: string
    challenge?: string
  }
  issuer: string
  issuanceDate: string
  expirationDate: string
  proof: {
    type: string
    proofPurpose: string
    verificationMethod: string
    created: string
    jws: string
  }
}

type CeramicStamp = {
  provider: string
  credential: string
}

type CeramicPassport = {
  issuanceDate: string
  expiryDate: string
  stamps: CeramicStamp[]
}

export type ModelTypes = ModelTypeAliases<
  {
    Passport: CeramicPassport
    VerifiableCredential: VerifiableCredential
  },
  {
    Passport: 'Passport'
    VerifiableCredential: 'VerifiableCredential'
  },
  {}
>

export type ScoreResultViewProps = {
  address: string
}

const ceramic = new CeramicClient("https://ceramic-clay.3boxlabs.com");

function useDIDRecord(address: string): string | null {
  const [did, setDID] = useState<string | null>(null)

  Caip10Link.fromAccount(
    ceramic,
    `${address}@eip155:1`,
  ).then((link) => setDID(link.did));

  return did
}

function usePublicDIDRecord(did: string) {
  const record = usePublicRecord<ModelTypes, 'Passport'>('Passport', did)

  // The `did` property of the loaded link will contain the DID string value if set
  return {
    record: record
  }
}

export const ScoreResultView = ({ address }: ScoreResultViewProps): JSX.Element => {
  // convert the provided address to a ceramic DID link
  const did = useDIDRecord(address) || '' // TODO - avoid usePublicRecord call if did is empty/null
  const { record } = usePublicDIDRecord(did)

  useEffect(() => {
    console.log(record)
  }, [record])

  return (
    <div className="border-2 p-10 text-center">
      {did.length == 0 && (
        <div>
          <span>Please create a dpopp passport</span>
        </div>
      )}
      {record?.isLoading ? (
        <div>
          <p>LOADING</p>
        </div>
      ) : (
        <div className={'flex flex-col'}>
          <div className="mb-20 underline">Your Score</div>
          <p className="text-2xl">
            {((record?.content as CeramicPassport)?.stamps || []).length > 0
                ? <span data-testid="passport-score--good">'GOOD 👍'</span>
                : <span data-testid="passport-score--bad">'BAD 👎'</span>}
          </p>
        </div>
      )}
    </div>
  )
}
