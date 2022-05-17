import React from 'react'

import { Caip10Link } from '@ceramicnetwork/stream-caip10-link'
import { usePublicRecord } from '@self.id/framework'
import { render, screen } from '@testing-library/react'

import { ScoreResultView } from './ScoreResultView'

jest.mock('@self.id/framework', () => ({
  usePublicRecord: jest.fn()
}))

const mockedUsePublicRecord = usePublicRecord as jest.Mock

describe('the score result view', () => {
  beforeEach(() => {
    jest
      .spyOn(Caip10Link, 'fromAccount')
      .mockResolvedValue({ did: 'did:3:myCeramicAccount' } as Caip10Link)
  })

  it('should render a good score for a passport with stamps', async () => {
    mockedUsePublicRecord.mockImplementation(() => ({
      isLoading: false,
      content: {
        issuanceDate: 'someDate',
        expiryDate: 'someDate',
        stamps: ['a stamp!'],
      },
    }))

    render(<ScoreResultView address={"abd123"}/>)
    expect(await screen.findByTestId("passport-score--good")).toBeInTheDocument();
  })

  it('should render a bad score for a passport with no stamps', async () => {
    mockedUsePublicRecord.mockImplementation(() => ({
      isLoading: false,
      content: {
        issuanceDate: 'someDate',
        expiryDate: 'someDate',
        stamps: [],
      },
    }))

    render(<ScoreResultView address={'abd123'} />)
    expect(await screen.findByTestId('passport-score--bad')).toBeInTheDocument()
  })
})

describe('the score result view, when an address does not have a linked ceramic account', () => {
  beforeEach(() => {
    jest
      .spyOn(Caip10Link, 'fromAccount')
      .mockResolvedValue({ did: null } as Caip10Link)
  })

  it('should render a prompt to create a passport', async () => {
    mockedUsePublicRecord.mockImplementation(() => null)

    render(<ScoreResultView address={'abd123'} />)
    expect(
      await screen.findByText('Please create a dpopp passport')
    ).toBeInTheDocument()
  })
})
