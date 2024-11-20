// /Users/gb/Desktop/Code/noswipe-app/NoSwipeApp/NoSwipeApp/Helpers/NetworkManager.swift

import Foundation

// MARK: - NetworkManager

class NetworkManager {
    // Singleton instance
    static let shared = NetworkManager()
    
    // Base URL of the backend
    private let baseURL = "http://192.168.1.123:8000" // Update if necessary
    
    // Keychain service and account identifiers
    private let tokenService = "NoSwipeApp"
    private let tokenAccount = "authToken"
    
    // MARK: - Authentication Token
    
    var authToken: String? {
        return KeychainHelper.shared.read(service: tokenService, account: tokenAccount)
            .flatMap { String(data: $0, encoding: .utf8) }
    }
    
    // MARK: - Registration
    
    func register(username: String,
                  email: String,
                  password: String,
                  password2: String,
                  firstName: String,
                  lastName: String,
                  completion: @escaping (Result<Void, NetworkError>) -> Void) {
        
        guard let url = URL(string: "\(baseURL)/api/auth/register/") else {
            completion(.failure(.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: Any] = [
            "username": username,
            "email": email,
            "password": password,
            "password2": password2,
            "first_name": firstName,
            "last_name": lastName
        ]
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])
        } catch {
            completion(.failure(.invalidBody))
            return
        }
        
        let task = URLSession.shared.dataTask(with: request) { data, response, error in            if let error = error {
                completion(.failure(.networkError(error)))
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse else {
                completion(.failure(.invalidResponse))
                return
            }
            
            guard (200...299).contains(httpResponse.statusCode) else {
                if let data = data,
                   let serverError = try? JSONDecoder().decode(ServerError.self, from: data) {
                    completion(.failure(.serverError(message: serverError.detail)))
                } else {
                    completion(.failure(.statusCode(httpResponse.statusCode)))
                }
                return
            }
            
            completion(.success(()))
        }
        
        task.resume()
    }
    
    // MARK: - Login
    func login(email: String,
               password: String,
               completion: @escaping (Result<String, NetworkError>) -> Void) {
        guard let url = URL(string: "\(baseURL)/api/auth/login/") else {
            completion(.failure(.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: Any] = [
            "email": email,
            "password": password
        ]
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])
        } catch {
            completion(.failure(.invalidBody))
            return
        }
        
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(.networkError(error)))
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse,
                  (200...299).contains(httpResponse.statusCode),
                  let data = data else {
                completion(.failure(.invalidResponse))
                return
            }
            
            guard let loginResponse = try? JSONDecoder().decode(LoginSuccess.self, from: data) else {
                completion(.failure(.decodingFailed))
                return
            }
            
            completion(.success(loginResponse.token)) // Pass the token back
        }
        
        task.resume()
    }
    
    // MARK: - Fetch User Profile
    
    func fetchUserProfile(completion: @escaping (Result<UserProfileData, NetworkError>) -> Void) {
        guard let token = authToken else {
            completion(.failure(.notAuthenticated))
            return
        }
        
        guard let url = URL(string: "\(baseURL)/api/user/profile/") else {
            completion(.failure(.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Token \(token)", forHTTPHeaderField: "Authorization")
        
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(.networkError(error)))
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse else {
                completion(.failure(.invalidResponse))
                return
            }
            
            guard (200...299).contains(httpResponse.statusCode) else {
                if let data = data,
                   let serverError = try? JSONDecoder().decode(ServerError.self, from: data) {
                    completion(.failure(.serverError(message: serverError.detail)))
                } else {
                    completion(.failure(.statusCode(httpResponse.statusCode)))
                }
                return
            }
            
            guard let data = data,
                  let userProfile = try? JSONDecoder().decode(UserProfileData.self, from: data) else {
                completion(.failure(.decodingFailed))
                return
            }
            
            completion(.success(userProfile))
        }
        
        task.resume()
    }
    
    // MARK: - Logout
    
    func logout(completion: @escaping (Result<Void, NetworkError>) -> Void) {
        guard let token = authToken else {
            completion(.failure(.notAuthenticated))
            return
        }
        
        guard let url = URL(string: "\(baseURL)/api/auth/logout/") else {
            completion(.failure(.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Token \(token)", forHTTPHeaderField: "Authorization")
        
        let task = URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            guard let self = self else { return }
            if let error = error {
                completion(.failure(.networkError(error)))
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse else {
                completion(.failure(.invalidResponse))
                return
            }
            
            guard (200...299).contains(httpResponse.statusCode) else {
                if let data = data,
                   let serverError = try? JSONDecoder().decode(ServerError.self, from: data) {
                    completion(.failure(.serverError(message: serverError.detail)))
                } else {
                    completion(.failure(.statusCode(httpResponse.statusCode)))
                }
                return
            }
            
            KeychainHelper.shared.delete(service: self.tokenService, account: self.tokenAccount)
            completion(.success(()))
        }
        
        task.resume()
    }
}

// MARK: - Supporting Structures and Enums

// Struct to decode server error messages
struct ServerError: Codable {
    let detail: String
}

// Struct to decode successful login response
struct LoginSuccess: Codable {
    let token: String
}

// Renamed struct to avoid conflict
struct UserProfileData: Codable {
    let username: String
    let email: String
    let first_name: String
    let last_name: String
    // Add other profile fields as needed
}

// Enum to handle different network errors
enum NetworkError: Error, LocalizedError {
    case invalidURL
    case invalidBody
    case networkError(Error)
    case invalidResponse
    case statusCode(Int)
    case serverError(message: String)
    case decodingFailed
    case notAuthenticated
    case unknown // Added to ensure switch exhaustiveness
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "The URL is invalid."
        case .invalidBody:
            return "Failed to encode the request body."
        case .networkError(let error):
            return error.localizedDescription
        case .invalidResponse:
            return "Received an invalid response from the server."
        case .statusCode(let code):
            return "Received HTTP status code \(code)."
        case .serverError(let message):
            return "Server error: \(message)"
        case .decodingFailed:
            return "Failed to decode the response."
        case .notAuthenticated:
            return "User is not authenticated."
        case .unknown:
            return "An unknown error occurred."
        }
    }
}
