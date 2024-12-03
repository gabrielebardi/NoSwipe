import { apiService } from '../api'

// Mock fetch
global.fetch = jest.fn()

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('login', () => {
    it('successfully logs in user', async () => {
      const mockToken = 'fake-token'
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: mockToken }),
      })

      const result = await apiService.login('test@example.com', 'password123')

      expect(result).toBe(mockToken)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login/'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      )
    })

    it('handles login failure', async () => {
      const errorMessage = 'Invalid credentials'
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: errorMessage }),
      })

      await expect(
        apiService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow(errorMessage)
    })
  })

  describe('checkAuth', () => {
    it('returns true when user is authenticated', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ username: 'testuser' }),
      })

      const result = await apiService.checkAuth()

      expect(result).toBe(true)
    })

    it('returns false when user is not authenticated', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      })

      const result = await apiService.checkAuth()

      expect(result).toBe(false)
    })
  })
}) 