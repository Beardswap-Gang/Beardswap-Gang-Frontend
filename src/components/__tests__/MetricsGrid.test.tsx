import { render, screen } from '@testing-library/react'
import { MetricsGrid } from '../MetricsGrid'

describe('MetricsGrid', () => {
  it('renders nothing when metrics is null', () => {
    const { container } = render(<MetricsGrid metrics={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders all metric cards when metrics are provided', () => {
    const metrics = {
      totalProposals: 100,
      activeProposals: 25,
      passedProposals: 70,
      rejectedProposals: 5,
      totalVotes: 1000,
      totalVoters: 150,
    }

    render(<MetricsGrid metrics={metrics} />)

    expect(screen.getByText('Total Proposals')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('Active Proposals')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('Total Votes')).toBeInTheDocument()
    expect(screen.getByText('1,000')).toBeInTheDocument()
  })

  it('formats large numbers with locale string', () => {
    const metrics = {
      totalProposals: 1000000,
      activeProposals: 0,
      passedProposals: 0,
      rejectedProposals: 0,
      totalVotes: 0,
      totalVoters: 0,
    }

    render(<MetricsGrid metrics={metrics} />)
    expect(screen.getByText('1,000,000')).toBeInTheDocument()
  })
})
