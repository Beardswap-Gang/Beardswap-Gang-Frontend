import { getTimeRemaining, votePercentages } from '../format'

describe('format utilities', () => {
  describe('getTimeRemaining', () => {
    it('returns "Ended" for past timestamps', () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600
      expect(getTimeRemaining(pastTime)).toBe('Ended')
    })

    it('returns "<1h" for less than 1 hour remaining', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 1800 // 30 minutes
      expect(getTimeRemaining(futureTime)).toBe('<1h')
    })

    it('returns days and hours for longer periods', () => {
      const futureTime = Math.floor(Date.now() / 1000) + (2 * 86400) + (5 * 3600) // 2 days 5 hours
      expect(getTimeRemaining(futureTime)).toBe('2d 5h')
    })

    it('handles 0 days correctly', () => {
      const futureTime = Math.floor(Date.now() / 1000) + (5 * 3600) // 5 hours
      expect(getTimeRemaining(futureTime)).toBe('0d 5h')
    })
  })

  describe('votePercentages', () => {
    it('returns 0% for both when no votes', () => {
      const result = votePercentages(0, 0)
      expect(result.yesPct).toBe(0)
      expect(result.noPct).toBe(0)
      expect(result.hasVotes).toBe(false)
    })

    it('calculates percentages correctly', () => {
      const result = votePercentages(75, 25)
      expect(result.yesPct).toBe(75)
      expect(result.noPct).toBe(25)
      expect(result.hasVotes).toBe(true)
    })

    it('handles 100% yes votes', () => {
      const result = votePercentages(100, 0)
      expect(result.yesPct).toBe(100)
      expect(result.noPct).toBe(0)
      expect(result.hasVotes).toBe(true)
    })

    it('handles 100% no votes', () => {
      const result = votePercentages(0, 100)
      expect(result.yesPct).toBe(0)
      expect(result.noPct).toBe(100)
      expect(result.hasVotes).toBe(true)
    })

    it('handles large numbers', () => {
      const result = votePercentages(1000000, 500000)
      expect(result.yesPct).toBeCloseTo(66.67, 2)
      expect(result.noPct).toBeCloseTo(33.33, 2)
      expect(result.hasVotes).toBe(true)
    })
  })
})
